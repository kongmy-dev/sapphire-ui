/**
 * The size gate, scoped to the files just touched.
 *
 * `typecheck` and `test` answer "is it correct?". Nothing here answered "is it more than it
 * needs to be?", so nothing did — and the answer arrived weeks later, from whoever next had
 * to read it.
 *
 * Two decisions this file exists to hold:
 *
 * **It counts code, never comments.** A sibling repo shipped a budget that counted raw lines
 * in a codebase that is a third prose; the number it gated on was mostly comments, so it
 * caught the wrong files, got waived on all forty-six of them, and was deleted. Comment
 * volume is reported separately and is not a failure.
 *
 * **Every message names the fix.** "complexity violation" needs a human to translate it.
 * "invert the three conditionals at 84-96 into guard clauses" does not. A gate whose output
 * is only usable by a person is a gate that only fires once a person is looking, which is
 * after the code is written.
 *
 *   bun tooling/quality-metrics/check.ts <file> [file...]
 *
 * Exit 0 when clean, 1 when something is over a threshold.
 */
import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { measureFile } from './metrics';

/**
 * These are THIS repo's own 95th percentile (7/89/474/5 as cognitive/function-lines/file-lines/nesting),
 * measured over its own functions — not numbers carried in from a sibling. They fire on roughly
 * the worst 5% of what is already here, which means about a third of existing files fail: that is
 * expected, and it is why the gate runs on the files you touched and never over the whole tree.
 *
 * **Do not copy these anywhere.** A sibling's set applied here fails 40%+ of files for reasons
 * that have nothing to do with quality. Re-measure per repo:
 * `bun tooling/quality-metrics/metrics.ts` prints the distribution.
 */
const BASE_LIMITS = {
  cognitive: 7,
  functionLines: 89,
  fileCodeLines: 474,
  nesting: 5
} as const;

/**
 * Test files are measured on complexity but not on length.
 *
 * A `describe` callback is a function to the parser and a file section to a person, so the
 * length rule reads a 73-line suite as one 73-line function and asks for it to be split —
 * advice that would make the tests worse. The first run of this gate produced exactly that
 * finding and nothing else, which is how a gate teaches people to ignore it.
 *
 * Complexity and nesting still apply: a test with branching in it is a test that needs its
 * own test, and that is worth hearing about wherever it appears.
 */
const TEST_LIMITS = {
  ...BASE_LIMITS,
  functionLines: Number.POSITIVE_INFINITY,
  fileCodeLines: Number.POSITIVE_INFINITY,
  nesting: 6
} as const;

const isTest = (p: string) => /\.(test|spec)\.tsx?$/.test(p) || /(^|\/)(test|__tests__)\//.test(p);

type Finding = { file: string; line: number; message: string };

export function checkFile(root: string, rel: string): Finding[] {
  const findings: Finding[] = [];
  const m = measureFile(root, rel);
  const LIMITS = isTest(rel) ? TEST_LIMITS : BASE_LIMITS;

  if (m.codeLines > LIMITS.fileCodeLines) {
    findings.push({
      file: rel,
      line: 1,
      message:
        `${m.codeLines} code lines (limit ${LIMITS.fileCodeLines}). ` +
        `Split it along the seam the exports already suggest, or move the part with no ` +
        `local caller to where it is used. Comments are not counted here.`
    });
  }

  if (m.maxNesting > LIMITS.nesting) {
    findings.push({
      file: rel,
      line: 1,
      message:
        `nesting reaches ${m.maxNesting} levels (limit ${LIMITS.nesting}). ` +
        `Invert the outermost condition into an early return so the body unindents.`
    });
  }

  for (const fn of m.functions) {
    if (fn.ownCognitive > LIMITS.cognitive) {
      findings.push({
        file: rel,
        line: fn.line,
        message:
          `${fn.name}: cognitive complexity ${fn.ownCognitive} (limit ${LIMITS.cognitive}). ` +
          `Turn the leading conditions into guard clauses that return early, and lift any ` +
          `branch that only computes a value into a named helper.`
      });
    }
    if (fn.codeLines > LIMITS.functionLines) {
      findings.push({
        file: rel,
        line: fn.line,
        message:
          `${fn.name}: ${fn.codeLines} lines (limit ${LIMITS.functionLines}). ` +
          `Extract the longest contiguous block that has one job and name it after that job.`
      });
    }
  }

  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  const args = process.argv.slice(2).filter((f) => /\.tsx?$/.test(f));
  const files = args
    .map((f) => relative(root, resolve(root, f)))
    .filter((f) => !f.startsWith('..') && existsSync(resolve(root, f)));

  if (!files.length) process.exit(0);

  const findings = files.flatMap((f) => checkFile(root, f));
  if (!findings.length) process.exit(0);

  console.error(`\nSize gate — ${findings.length} finding(s). Fix these before moving on.\n`);
  for (const f of findings) console.error(`  ${f.file}:${f.line}\n    ${f.message}\n`);
  console.error(
    `Thresholds are in tooling/quality-metrics/check.ts. They are not suppressible per-line ` +
      `on purpose: a gate that can be waived is a gate that gets waived.\n`
  );
  process.exit(1);
}
