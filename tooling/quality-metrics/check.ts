import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { type FileMetrics, measureFile } from './measure';

type Limits = {
  cognitive: number;
  functionLines: number;
  fileCodeLines: number;
  nesting: number;
};

type Finding = { file: string; line: number; message: string };

const BASE_LIMITS: Limits = {
  cognitive: 7,
  functionLines: 89,
  fileCodeLines: 474,
  nesting: 5,
};

const TEST_LIMITS: Limits = {
  ...BASE_LIMITS,
  functionLines: Number.POSITIVE_INFINITY,
  fileCodeLines: Number.POSITIVE_INFINITY,
  nesting: 6,
};

const isTest = (p: string) =>
  /\.(test|spec)\.tsx?$/.test(p) || /(^|\/)(test|__tests__)\//.test(p);

function fileFindings(rel: string, m: FileMetrics, limits: Limits): Finding[] {
  const findings: Finding[] = [];
  if (m.codeLines > limits.fileCodeLines) {
    findings.push({
      file: rel,
      line: 1,
      message:
        `${m.codeLines} code lines (limit ${limits.fileCodeLines}). ` +
        `Split it along the seam the exports already suggest, or move the part with no ` +
        `local caller to where it is used. Comments are not counted here.`,
    });
  }
  if (m.maxNesting > limits.nesting) {
    findings.push({
      file: rel,
      line: 1,
      message:
        `nesting reaches ${m.maxNesting} levels (limit ${limits.nesting}). ` +
        `Invert the outermost condition into an early return so the body unindents.`,
    });
  }
  return findings;
}

function functionFindings(
  rel: string,
  fn: FileMetrics['functions'][number],
  limits: Limits,
): Finding[] {
  const findings: Finding[] = [];
  if (fn.ownCognitive > limits.cognitive) {
    findings.push({
      file: rel,
      line: fn.line,
      message:
        `${fn.name}: cognitive complexity ${fn.ownCognitive} (limit ${limits.cognitive}). ` +
        `Turn the leading conditions into guard clauses that return early, and lift any ` +
        `branch that only computes a value into a named helper.`,
    });
  }
  if (fn.codeLines > limits.functionLines) {
    findings.push({
      file: rel,
      line: fn.line,
      message:
        `${fn.name}: ${fn.codeLines} lines (limit ${limits.functionLines}). ` +
        `Extract the longest contiguous block that has one job and name it after that job.`,
    });
  }
  return findings;
}

export function checkFile(root: string, rel: string): Finding[] {
  const m = measureFile(root, rel);
  const limits = isTest(rel) ? TEST_LIMITS : BASE_LIMITS;
  return [
    ...fileFindings(rel, m, limits),
    ...m.functions.flatMap((fn) => functionFindings(rel, fn, limits)),
  ];
}

function main() {
  const root = process.cwd();
  const files = process.argv
    .slice(2)
    .filter((f) => /\.tsx?$/.test(f))
    .map((f) => relative(root, resolve(root, f)))
    .filter((f) => !f.startsWith('..') && existsSync(resolve(root, f)));

  if (!files.length) process.exit(0);

  const findings = files.flatMap((f) => checkFile(root, f));
  if (!findings.length) process.exit(0);

  console.error(
    `\nSize gate — ${findings.length} finding(s). Fix these before moving on.\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}\n    ${f.message}\n`);
  }
  console.error(
    `Thresholds are in tooling/quality-metrics/check.ts. They are not suppressible per-line ` +
      `on purpose: a gate that can be waived is a gate that gets waived.\n`,
  );
  process.exit(1);
}

if (import.meta.main) main();
