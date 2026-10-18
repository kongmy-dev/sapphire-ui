import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type FileMetrics, measureFile } from './measure';

type Snapshot = {
  takenAt: string;
  commit: string;
  totals: {
    files: number;
    srcFiles: number;
    testFiles: number;
    codeLines: number;
    testCodeLines: number;
    commentLines: number;
    commentRatio: number;
    testRatio: number;
    exports: number;
    unreferencedExports: number;
    interfaces: number;
    types: number;
    abstractionsPerKloc: number;
    worstCognitive: number;
    worstOwnCognitive: number;
    functionsOverOwnCognitive15: number;
    functionsOver50Lines: number;
    filesOver300CodeLines: number;
    maxNesting: number;
    cloneBlocks: number;
  };
  files: Record<
    string,
    { codeLines: number; commentLines: number; worstOwnCognitive: number }
  >;
  offenders: {
    cognitive: {
      file: string;
      fn: string;
      line: number;
      score: number;
      own: number;
    }[];
    longFunctions: { file: string; fn: string; line: number; lines: number }[];
    bigFiles: { file: string; codeLines: number }[];
    unreferencedExports: { file: string; name: string }[];
  };
};

const SOURCE_GLOBS = ['src', 'registry', 'tests'];

const FRAMEWORK_ENTRY = [
  /(^|\/)(page|layout|template|loading|error|not-found|route|default|middleware|instrumentation)\.tsx?$/,
  /(^|\/)app\.tsx?$/,
  /\.d\.ts$/,
];

const isFrameworkEntry = (p: string) =>
  FRAMEWORK_ENTRY.some((re) => re.test(p));

function listSourceFiles(root: string): string[] {
  const out = execFileSync(
    'find',
    [
      ...SOURCE_GLOBS,
      '-type',
      'f',
      '(',
      '-name',
      '*.ts',
      '-o',
      '-name',
      '*.tsx',
      ')',
      '-not',
      '-path',
      '*/node_modules/*',
      '-not',
      '-path',
      '*/dist/*',
      '-not',
      '-path',
      '*/build/*',
      '-not',
      '-path',
      '*/.next/*',
      '-not',
      '-path',
      '*/coverage/*',
      '-not',
      '-path',
      '*/vendor/*',
      '-not',
      '-path',
      '*/registry-consumer/*',
    ],
    { cwd: root, encoding: 'utf8' },
  );
  return out.split('\n').filter(Boolean).sort();
}

const CLONE_WINDOW_LINES = 8;

const normalizeLine = (line: string) =>
  line
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, 'S')
    .replace(/\b\d+\b/g, 'N');

const isCountableLine = (line: string) =>
  line !== '' &&
  !/^(\/\/|\*|\/\*|import |export \{)/.test(line) &&
  line.length > 8;

function windowsOf(lines: string[]): string[] {
  const count = Math.max(lines.length - CLONE_WINDOW_LINES + 1, 0);
  return Array.from({ length: count }, (_, i) =>
    lines.slice(i, i + CLONE_WINDOW_LINES).join('\n'),
  );
}

function cloneBlocks(root: string, files: string[]): number {
  const ownersByWindow = new Map<string, Set<string>>();
  for (const file of files) {
    const lines = readFileSync(resolve(root, file), 'utf8')
      .split('\n')
      .map(normalizeLine)
      .filter(isCountableLine);
    for (const window of windowsOf(lines)) {
      const owners = ownersByWindow.get(window) ?? new Set<string>();
      owners.add(file);
      ownersByWindow.set(window, owners);
    }
  }
  return [...ownersByWindow.values()].filter((owners) => owners.size > 1)
    .length;
}

type FunctionRow = FileMetrics['functions'][number] & { file: string };
type Unreferenced = { file: string; name: string };

type SnapshotInput = {
  measured: FileMetrics[];
  src: FileMetrics[];
  tests: FileMetrics[];
  allFns: FunctionRow[];
  unreferenced: Unreferenced[];
  cloneBlocks: number;
};

const sum = (items: FileMetrics[], pick: (m: FileMetrics) => number) =>
  items.reduce((total, m) => total + pick(m), 0);

function unreferencedExports(
  root: string,
  measured: FileMetrics[],
  src: FileMetrics[],
): Unreferenced[] {
  const wholeSource = measured
    .map((m) => readFileSync(resolve(root, m.path), 'utf8'))
    .join('\n');
  const usesOf = (name: string) =>
    (wholeSource.match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length;
  return src
    .filter((m) => !isFrameworkEntry(m.path))
    .flatMap((m) =>
      m.exports
        .filter((name) => usesOf(name) <= 1)
        .map((name) => ({ file: m.path, name })),
    );
}

function totalsOf(input: SnapshotInput): Snapshot['totals'] {
  const { measured, src, tests, allFns, unreferenced } = input;
  const codeLines = sum(src, (m) => m.codeLines);
  const testCodeLines = sum(tests, (m) => m.codeLines);
  const commentLines = sum(src, (m) => m.commentLines);
  const interfaces = sum(src, (m) => m.interfaceDecls);
  const types = sum(src, (m) => m.typeDecls);
  const perCodeLine = (n: number) => n / Math.max(codeLines, 1);
  return {
    files: measured.length,
    srcFiles: src.length,
    testFiles: tests.length,
    codeLines,
    testCodeLines,
    commentLines,
    commentRatio: +perCodeLine(commentLines).toFixed(3),
    testRatio: +perCodeLine(testCodeLines).toFixed(3),
    exports: sum(src, (m) => m.exports.length),
    unreferencedExports: unreferenced.length,
    interfaces,
    types,
    abstractionsPerKloc: +(perCodeLine(interfaces + types) * 1000).toFixed(1),
    worstCognitive: Math.max(...allFns.map((f) => f.cognitive), 0),
    worstOwnCognitive: Math.max(...allFns.map((f) => f.ownCognitive), 0),
    functionsOverOwnCognitive15: allFns.filter((f) => f.ownCognitive > 15)
      .length,
    functionsOver50Lines: allFns.filter((f) => f.codeLines > 50).length,
    filesOver300CodeLines: src.filter((m) => m.codeLines > 300).length,
    maxNesting: Math.max(...src.map((m) => m.maxNesting), 0),
    cloneBlocks: input.cloneBlocks,
  };
}

function offendersOf(
  src: FileMetrics[],
  allFns: FunctionRow[],
  unreferenced: Unreferenced[],
): Snapshot['offenders'] {
  const byCognitive = [...allFns].sort(
    (a, b) => b.ownCognitive - a.ownCognitive,
  );
  const byLength = [...allFns].sort((a, b) => b.codeLines - a.codeLines);
  const bigFiles = [...src].sort((a, b) => b.codeLines - a.codeLines);
  return {
    cognitive: byCognitive.slice(0, 15).map((f) => ({
      file: f.file,
      fn: f.name,
      line: f.line,
      score: f.cognitive,
      own: f.ownCognitive,
    })),
    longFunctions: byLength.slice(0, 15).map((f) => ({
      file: f.file,
      fn: f.name,
      line: f.line,
      lines: f.codeLines,
    })),
    bigFiles: bigFiles
      .slice(0, 15)
      .map((m) => ({ file: m.path, codeLines: m.codeLines })),
    unreferencedExports: unreferenced.slice(0, 40),
  };
}

function fileSummaries(measured: FileMetrics[]): Snapshot['files'] {
  return Object.fromEntries(
    measured.map((m) => [
      m.path,
      {
        codeLines: m.codeLines,
        commentLines: m.commentLines,
        worstOwnCognitive: Math.max(
          ...m.functions.map((f) => f.ownCognitive),
          0,
        ),
      },
    ]),
  );
}

export function snapshot(root: string): Snapshot {
  const files = listSourceFiles(root);
  const measured = files.map((f) => measureFile(root, f));
  const src = measured.filter((m) => !m.isTest);
  const tests = measured.filter((m) => m.isTest);
  const unreferenced = unreferencedExports(root, measured, src);
  const allFns = src.flatMap((m) =>
    m.functions.map((fn) => ({ ...fn, file: m.path })),
  );
  return {
    takenAt: new Date().toISOString(),
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim(),
    totals: totalsOf({
      measured,
      src,
      tests,
      allFns,
      unreferenced,
      cloneBlocks: cloneBlocks(root, files),
    }),
    files: fileSummaries(measured),
    offenders: offendersOf(src, allFns, unreferenced),
  };
}
