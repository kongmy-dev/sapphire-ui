import { type FileMetrics, measureText } from './measure';

type Limits = {
  cognitive: number;
  functionLines: number;
  fileCodeLines: number;
  nesting: number;
};

export type Finding = { line: number; problem: string; fix: string };

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

function fileFindings(m: FileMetrics, limits: Limits): Finding[] {
  const findings: Finding[] = [];
  if (m.codeLines > limits.fileCodeLines) {
    findings.push({
      line: 1,
      problem: `${m.codeLines} code lines (limit ${limits.fileCodeLines})`,
      fix: 'Split it along the seam the exports already suggest, or move the part with no local caller to where it is used.',
    });
  }
  if (m.maxNesting > limits.nesting) {
    findings.push({
      line: 1,
      problem: `nesting reaches ${m.maxNesting} levels (limit ${limits.nesting})`,
      fix: 'Invert the outermost condition into an early return so the body unindents.',
    });
  }
  return findings;
}

function functionFindings(
  fn: FileMetrics['functions'][number],
  limits: Limits,
): Finding[] {
  const findings: Finding[] = [];
  if (fn.ownCognitive > limits.cognitive) {
    findings.push({
      line: fn.line,
      problem: `${fn.name}: cognitive complexity ${fn.ownCognitive} (limit ${limits.cognitive})`,
      fix: 'Turn the leading conditions into guard clauses that return early, and lift any branch that only computes a value into a named helper.',
    });
  }
  if (fn.codeLines > limits.functionLines) {
    findings.push({
      line: fn.line,
      problem: `${fn.name}: ${fn.codeLines} lines (limit ${limits.functionLines})`,
      fix: 'Extract the longest contiguous block that has one job and name it after that job.',
    });
  }
  return findings;
}

export function checkText(rel: string, text: string): Finding[] {
  const m = measureText(rel, text);
  const limits = isTest(rel) ? TEST_LIMITS : BASE_LIMITS;
  return [
    ...fileFindings(m, limits),
    ...m.functions.flatMap((fn) => functionFindings(fn, limits)),
  ];
}
