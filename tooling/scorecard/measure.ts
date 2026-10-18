import { COMMENT_EXTENSIONS, commentGate } from '../gates/comments';
import { type FileText, hasExtension } from '../gates/scope';
import { SIZE_EXTENSIONS, sizeGate } from '../gates/size';

export type PackageFields = {
  readonly scripts: Readonly<Record<string, string>>;
  readonly dependencies: Readonly<Record<string, string>>;
  readonly peerDependencies: Readonly<Record<string, string>>;
  readonly optionalPeers: readonly string[];
  readonly exports: Readonly<Record<string, unknown>>;
};

export type Measurement = {
  runtimeDependencies: number;
  requiredPeers: number;
  exportEntries: number;
  strayComments: number;
  sizeFindings: number;
  sizeFailingFiles: number;
  markdownLines: number;
};

export type Stylesheet =
  | { kind: 'measured'; bytes: number }
  | { kind: 'unmeasured'; reason: string };

const MAIN_STYLESHEETS = ['sapphire-ui.css', 'sapphire.css'] as const;
const REASON_LIMIT = 160;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const stringRecord = (value: unknown): Record<string, string> =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
    : {};

const optionalNames = (meta: unknown): string[] =>
  isRecord(meta)
    ? Object.entries(meta)
        .filter(([, flag]) => isRecord(flag) && flag.optional === true)
        .map(([name]) => name)
    : [];

function exportMap(value: unknown): Record<string, unknown> {
  if (value === undefined || value === null) return {};
  if (isRecord(value) && Object.keys(value).some((key) => key.startsWith('.')))
    return value;
  return { '.': value };
}

export function readPackage(text: string): PackageFields | null {
  const parsed = parseJson(text);
  if (!isRecord(parsed)) return null;
  return {
    scripts: stringRecord(parsed.scripts),
    dependencies: stringRecord(parsed.dependencies),
    peerDependencies: stringRecord(parsed.peerDependencies),
    optionalPeers: optionalNames(parsed.peerDependenciesMeta),
    exports: exportMap(parsed.exports),
  };
}

export function mainStylesheet(pkg: PackageFields): string | null {
  const isMain = (value: unknown): value is string =>
    typeof value === 'string' &&
    MAIN_STYLESHEETS.some((name) => value.endsWith(`/${name}`));
  return Object.values(pkg.exports).find(isMain) ?? null;
}

export const isMeasuredFile = (name: string) =>
  hasExtension(name, [...COMMENT_EXTENSIONS, ...SIZE_EXTENSIONS, '.md']);

const lineCount = (text: string) => {
  if (text === '') return 0;
  return text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
};

const isCountedMarkdown = (file: FileText) =>
  file.name.endsWith('.md') && file.name !== 'CHANGELOG.md';

export function measureTree(
  files: readonly FileText[],
  pkg: PackageFields,
): Measurement {
  const sized = files.filter((file) =>
    hasExtension(file.name, SIZE_EXTENSIONS),
  );
  const sizeFindings = sizeGate(sized).violations;
  const commented = files.filter((file) =>
    hasExtension(file.name, COMMENT_EXTENSIONS),
  );
  return {
    runtimeDependencies: Object.keys(pkg.dependencies).length,
    requiredPeers: Object.keys(pkg.peerDependencies).filter(
      (name) => !pkg.optionalPeers.includes(name),
    ).length,
    exportEntries: Object.keys(pkg.exports).length,
    strayComments: commentGate(commented).violations.length,
    sizeFindings: sizeFindings.length,
    sizeFailingFiles: new Set(sizeFindings.map((finding) => finding.file)).size,
    markdownLines: files
      .filter(isCountedMarkdown)
      .reduce((total, file) => total + lineCount(file.text), 0),
  };
}

export const gzippedBytes = (bytes: Uint8Array<ArrayBuffer>): number =>
  Bun.gzipSync(bytes).length;

export const unmeasured = (reason: string): Stylesheet => ({
  kind: 'unmeasured',
  reason,
});

export function firstErrorLine(output: string): string {
  const lines = output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  const line = lines.find((text) => /error/i.test(text)) ?? lines.at(-1);
  return (line ?? 'no output').slice(0, REASON_LIMIT);
}

const ENTRY = /^(?<mode>\d+) \S+ \d\t(?<path>.+)$/s;

export function regularFilePaths(listing: string): string[] {
  return listing.split('\0').flatMap((entry) => {
    const groups = ENTRY.exec(entry)?.groups;
    const isRegular = groups?.mode?.startsWith('100') === true;
    return isRegular && groups?.path ? [groups.path] : [];
  });
}
