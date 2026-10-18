import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { runInContainer } from './container';
import { exampleNames } from './examples';
import { parseExamples, titleGrep } from './pin-args';
import { describeFailure, parseFailures } from './report';

const REPORT = 'test-results/visual-report.json';
const PINS = 'tests/visual/pins';

function differing(root: string): string[] {
  const report: unknown = JSON.parse(readFileSync(join(root, REPORT), 'utf8'));
  return parseFailures(report).flatMap((failure) =>
    describeFailure(failure, root),
  );
}

const changedPins = (root: string): string =>
  execFileSync(
    'git',
    ['status', '--short', '--untracked-files=all', '--', PINS],
    {
      cwd: root,
      encoding: 'utf8',
    },
  ).trimEnd();

function main(argv: readonly string[]) {
  const args = parseExamples(argv, exampleNames());
  if (!args.ok) {
    console.error(args.message);
    process.exit(1);
  }
  const root = process.cwd();
  const grep = titleGrep(args.examples);
  rmSync(join(root, REPORT), { force: true });
  if (runInContainer(['--grep', grep]) === 0) {
    console.log('pin: every named example already matches; nothing changed');
    return;
  }
  console.log(['pin: differences', ...differing(root)].join('\n'));
  const updated = runInContainer(['--grep', grep, '--update-snapshots=all']);
  if (updated !== 0) process.exit(updated);
  console.log(`pin: changed files\n${changedPins(root) || '  (none)'}`);
}

main(process.argv.slice(2));
