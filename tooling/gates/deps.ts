import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type DepViolation = {
  field: string;
  pkg: string;
  issue: string;
};

type PackageShape = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};

const RUNTIME_PEERS = ['react', 'react-dom', 'react-resizable-panels'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRecordOf = (
  value: unknown,
  isEntry: (entry: unknown) => boolean,
): boolean =>
  value === undefined ||
  (isRecord(value) && Object.values(value).every(isEntry));

const isOptionalFlag = (entry: unknown) =>
  isRecord(entry) &&
  (entry.optional === undefined || typeof entry.optional === 'boolean');

function isPackageShape(value: unknown): value is PackageShape {
  return (
    isRecord(value) &&
    isRecordOf(value.dependencies, (entry) => typeof entry === 'string') &&
    isRecordOf(value.peerDependencies, (entry) => typeof entry === 'string') &&
    isRecordOf(value.peerDependenciesMeta, isOptionalFlag)
  );
}

function runtimePeerViolations(deps: Record<string, string>): DepViolation[] {
  return Object.keys(deps)
    .filter(
      (pkg) => pkg.startsWith('@radix-ui/') || RUNTIME_PEERS.includes(pkg),
    )
    .map((pkg) => ({
      field: 'dependencies',
      pkg,
      issue:
        'Must remain in peerDependencies; never add runtime peer to dependencies.',
    }));
}

function reactPeerViolations(peers: Record<string, string>): DepViolation[] {
  if (peers.react && peers['react-dom']) return [];
  return [
    {
      field: 'peerDependencies',
      pkg: 'react/react-dom',
      issue: 'react and react-dom must be declared in peerDependencies.',
    },
  ];
}

function optionalPeerViolations(
  peers: Record<string, string>,
  peerMeta: Record<string, { optional?: boolean }>,
): DepViolation[] {
  const isDeclaredOptional = peerMeta['react-resizable-panels']?.optional;
  if (!peers['react-resizable-panels'] || isDeclaredOptional) return [];
  return [
    {
      field: 'peerDependenciesMeta',
      pkg: 'react-resizable-panels',
      issue:
        'react-resizable-panels must be marked optional in peerDependenciesMeta.',
    },
  ];
}

export function validateDependencies(
  packageJson: PackageShape,
): DepViolation[] {
  const peers = packageJson.peerDependencies ?? {};
  return [
    ...runtimePeerViolations(packageJson.dependencies ?? {}),
    ...reactPeerViolations(peers),
    ...optionalPeerViolations(peers, packageJson.peerDependenciesMeta ?? {}),
  ];
}

function main() {
  const parsed: unknown = JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
  );
  if (!isPackageShape(parsed))
    throw new Error('package.json has an unexpected shape');

  const violations = validateDependencies(parsed);

  if (!violations.length) {
    console.log(
      'Dependency gate: OK — peer dependencies and dependency policies satisfied.',
    );
    process.exit(0);
  }

  console.error(
    `\nDependency gate — ${violations.length} violation(s) found (P-10):\n`,
  );
  for (const v of violations) {
    console.error(`  [${v.field}] ${v.pkg}: ${v.issue}`);
  }
  process.exit(1);
}

if (import.meta.main) main();
