import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { finish, type GateResult, type Violation } from './report';

type Counts = { found: number; hit: number };
type RecordCoverage = { file: string; lines: Counts; functions: Counts };
const THRESHOLD = 95;
const SOURCE_ROOTS = ['components', 'hooks', 'lib', 'elements'];
const isProduction = (file: string) =>
  /\.[cm]?tsx?$/.test(file) &&
  !file.split('/').some((part) => part.endsWith('-tests')) &&
  !/\.(?:test|spec|d)\.[cm]?tsx?$/.test(file);

export function coverageFiles(root: string): string[] {
  const walk = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [relative(root, path)];
    });
  return SOURCE_ROOTS.flatMap((name) => {
    const directory = join(root, name);
    return existsSync(directory) ? walk(directory) : [];
  })
    .filter(isProduction)
    .sort();
}

const counts = (text: string[], prefix: string): Counts => {
  const rows = text.filter((line) => line.startsWith(prefix));
  const hits = rows.map((line) =>
    Number(line.slice(prefix.length).split(',')[0]),
  );
  return { found: rows.length, hit: hits.filter((hit) => hit > 0).length };
};

function parseRecord(text: string): RecordCoverage | null {
  const rows = text.trim().split('\n');
  const file = rows.find((row) => row.startsWith('SF:'))?.slice(3);
  if (file === undefined) return null;
  const lineRows = rows.filter((row) => row.startsWith('DA:'));
  const lines = {
    found: lineRows.length,
    hit: lineRows.filter((row) => Number(row.split(',')[1]) > 0).length,
  };
  const functions = counts(rows, 'FNDA:');
  const declared = rows.filter((row) => row.startsWith('FN:')).length;
  const found = Number(
    rows.find((row) => row.startsWith('FNF:'))?.slice(4) ?? 0,
  );
  return {
    file,
    lines,
    functions: {
      ...functions,
      found: Math.max(functions.found, declared, found),
    },
  };
}

const violation = (file: string, problem: string): Violation => ({
  file,
  line: 1,
  rule: 'P-10',
  problem,
  fix: 'Exercise this file through public behavior tests and regenerate LCOV.',
});

function metricProblems(record: RecordCoverage): Violation[] {
  if (record.lines.found === 0)
    return [violation(record.file, 'LCOV contains no executable lines')];
  return (['lines', 'functions'] as const).flatMap((metric) => {
    const { found, hit } = record[metric];
    if (found === 0 || hit / found >= THRESHOLD / 100) return [];
    return [
      violation(
        record.file,
        `${metric} coverage ${((100 * hit) / found).toFixed(2)}% is below ${THRESHOLD}% (${hit}/${found})`,
      ),
    ];
  });
}

export function coverageGate(input: {
  root: string;
  files: readonly string[];
  lcov: string | null;
}): GateResult {
  const records = (input.lcov ?? '')
    .split('end_of_record')
    .map(parseRecord)
    .filter((record) => record !== null);
  const violations = input.files.flatMap((file) => {
    const matches = records.filter(
      (record) =>
        resolve(input.root, record.file) === resolve(input.root, file),
    );
    if (matches.length !== 1)
      return [
        violation(file, `${matches.length} LCOV records; expected exactly one`),
      ];
    const record = matches[0];
    return record === undefined ? [] : metricProblems({ ...record, file });
  });
  return { name: 'coverage', files: input.files.length, violations };
}

if (import.meta.main) {
  const root = process.cwd();
  const report = resolve(root, process.argv[2] ?? 'coverage/lcov.info');
  finish(
    coverageGate({
      root,
      files: coverageFiles(root),
      lcov: existsSync(report) ? readFileSync(report, 'utf8') : null,
    }),
  );
}
