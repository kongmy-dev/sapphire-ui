import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { finish, type GateResult, type Violation } from './report';

type PackageShape = {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};

export type DependencyInputs = {
  packageText: string | null;
  bunVersionText: string | null;
};

const RUNTIME_PEERS = ['react', 'react-dom', 'react-resizable-panels'];
const EXACT_VERSION =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const BUN_PACKAGE_MANAGER = /^bun@(\d+\.\d+\.\d+)$/;
const TYPESCRIPT_LINE = /^6\.0\.\d+$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRecordOf = (
  value: unknown,
  isEntry: (entry: unknown) => boolean,
): boolean =>
  value === undefined ||
  (isRecord(value) && Object.values(value).every(isEntry));

const isString = (entry: unknown) => typeof entry === 'string';

const isOptionalFlag = (entry: unknown) =>
  isRecord(entry) &&
  (entry.optional === undefined || typeof entry.optional === 'boolean');

function isPackageShape(value: unknown): value is PackageShape {
  return (
    isRecord(value) &&
    (value.packageManager === undefined ||
      typeof value.packageManager === 'string') &&
    isRecordOf(value.dependencies, isString) &&
    isRecordOf(value.devDependencies, isString) &&
    isRecordOf(value.peerDependencies, isString) &&
    isRecordOf(value.peerDependenciesMeta, isOptionalFlag)
  );
}

function parsePackage(text: string): PackageShape | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return isPackageShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function lineOf(text: string, section: string, key?: string): number {
  const lines = text.split('\n');
  const sectionIndex = lines.findIndex((line) =>
    line.startsWith(`  "${section}"`),
  );
  if (sectionIndex < 0) return 1;
  if (key === undefined) return sectionIndex + 1;
  const keyIndex = lines.findIndex(
    (line, index) =>
      index > sectionIndex && line.trimStart().startsWith(`"${key}":`),
  );
  return (keyIndex < 0 ? sectionIndex : keyIndex) + 1;
}

const violation = (
  line: number,
  problem: string,
  fix: string,
  file = 'package.json',
): Violation => ({ file, line, rule: 'P-12', problem, fix });

function runtimePeerViolations(pkg: PackageShape, text: string): Violation[] {
  return Object.keys(pkg.dependencies ?? {})
    .filter(
      (name) => name.startsWith('@radix-ui/') || RUNTIME_PEERS.includes(name),
    )
    .map((name) =>
      violation(
        lineOf(text, 'dependencies', name),
        `${name} is in dependencies`,
        `Move ${name} to peerDependencies; consumers must not bundle a second copy.`,
      ),
    );
}

function reactPeerViolations(pkg: PackageShape, text: string): Violation[] {
  const peers = pkg.peerDependencies ?? {};
  if (peers.react && peers['react-dom']) return [];
  return [
    violation(
      lineOf(text, 'peerDependencies'),
      'react and react-dom are not both declared in peerDependencies',
      'Declare react and react-dom in peerDependencies.',
    ),
  ];
}

function optionalPeerViolations(pkg: PackageShape, text: string): Violation[] {
  const isPeer = pkg.peerDependencies?.['react-resizable-panels'] !== undefined;
  const isOptional =
    pkg.peerDependenciesMeta?.['react-resizable-panels']?.optional === true;
  if (!isPeer || isOptional) return [];
  return [
    violation(
      lineOf(text, 'peerDependencies', 'react-resizable-panels'),
      'react-resizable-panels is a peer that is not marked optional',
      'Mark react-resizable-panels optional in peerDependenciesMeta.',
    ),
  ];
}

function pinViolations(pkg: PackageShape, text: string): Violation[] {
  return Object.entries(pkg.devDependencies ?? {})
    .filter(([, range]) => !EXACT_VERSION.test(range))
    .map(([name, range]) =>
      violation(
        lineOf(text, 'devDependencies', name),
        `${name} is "${range}", not an exact version`,
        `Write the installed version with no ^, ~, range or tag: "${name}": "x.y.z".`,
      ),
    );
}

function typescriptViolations(pkg: PackageShape, text: string): Violation[] {
  const version = pkg.devDependencies?.typescript;
  if (version === undefined) {
    return [
      violation(
        lineOf(text, 'devDependencies'),
        'typescript is not in devDependencies',
        'Add typescript at an exact 6.0.x version.',
      ),
    ];
  }
  if (!EXACT_VERSION.test(version) || TYPESCRIPT_LINE.test(version)) return [];
  return [
    violation(
      lineOf(text, 'devDependencies', 'typescript'),
      `typescript is ${version}, not 6.0.x`,
      'Stay on 6.0.x: the gates and knip need the classic compiler API that 7 drops.',
    ),
  ];
}

function bunVersionViolations(
  pkg: PackageShape,
  text: string,
  bunVersionText: string | null,
): Violation[] {
  const line = lineOf(text, 'packageManager');
  const pinned = BUN_PACKAGE_MANAGER.exec(pkg.packageManager ?? '')?.[1];
  if (pinned === undefined) {
    return [
      violation(
        line,
        'packageManager is missing or not bun@x.y.z',
        'Set "packageManager": "bun@x.y.z" to the Bun version CI installs.',
      ),
    ];
  }
  if (bunVersionText === null) {
    return [
      violation(
        1,
        '.bun-version is missing',
        `Create .bun-version containing ${pinned}.`,
        '.bun-version',
      ),
    ];
  }
  if (bunVersionText.trim() === pinned) return [];
  return [
    violation(
      1,
      `.bun-version is ${bunVersionText.trim()}, packageManager says ${pinned}`,
      `Make .bun-version contain ${pinned}.`,
      '.bun-version',
    ),
  ];
}

function packageViolations(
  packageText: string,
  bunVersionText: string | null,
): Violation[] {
  const pkg = parsePackage(packageText);
  if (pkg === null) {
    return [
      violation(
        1,
        'package.json is not valid JSON of the expected shape',
        'Fix package.json so it parses.',
      ),
    ];
  }
  const text = packageText;
  return [
    ...runtimePeerViolations(pkg, text),
    ...reactPeerViolations(pkg, text),
    ...optionalPeerViolations(pkg, text),
    ...pinViolations(pkg, text),
    ...typescriptViolations(pkg, text),
    ...bunVersionViolations(pkg, text, bunVersionText),
  ];
}

function describeChecked(packageText: string): string {
  const pkg = parsePackage(packageText);
  const count = (record: Record<string, string> | undefined) =>
    Object.keys(record ?? {}).length;
  return `${count(pkg?.devDependencies)} devDependencies, ${count(pkg?.peerDependencies)} peers`;
}

export function dependencyGate(inputs: DependencyInputs): GateResult {
  const { packageText, bunVersionText } = inputs;
  if (packageText === null) {
    return {
      name: 'dependency',
      files: 0,
      violations: [
        violation(
          1,
          'package.json is missing',
          'Run the gate from the repository root.',
        ),
      ],
    };
  }
  return {
    name: 'dependency',
    files: bunVersionText === null ? 1 : 2,
    detail: describeChecked(packageText),
    violations: packageViolations(packageText, bunVersionText),
  };
}

function readIfPresent(path: string): string | null {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

if (import.meta.main) {
  const root = process.cwd();
  finish(
    dependencyGate({
      packageText: readIfPresent(resolve(root, 'package.json')),
      bunVersionText: readIfPresent(resolve(root, '.bun-version')),
    }),
  );
}
