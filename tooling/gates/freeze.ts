import { execFileSync } from 'node:child_process';
import { finish, type GateResult, type Violation } from './report';

const FROZEN_SRC_TREE = '87b6f4e71a290445f7df203d7223ba8a179cff1c';
const FIX = 'A v3 fix goes to the v3 branch; v4 work goes in the new folders.';

export type FreezeInputs = {
  treeHash: string;
  statusLines: readonly string[];
  fileCount: number;
};

const unquote = (path: string) => path.replace(/^"(.*)"$/, '$1');

function describeStatus(code: string): string {
  if (code === '??') return 'untracked';
  if (code.includes('R')) return 'renamed';
  if (code.includes('D')) return 'deleted';
  if (code.includes('A')) return 'added';
  if (code.includes('M')) return 'modified';
  return 'changed';
}

const changedFileViolations = (line: string): Violation[] =>
  line
    .slice(3)
    .split(' -> ')
    .map((path) => ({
      file: unquote(path),
      line: 1,
      rule: 'P-17',
      problem: `src/ is frozen, and this file is ${describeStatus(line.slice(0, 2))}`,
      fix: FIX,
    }));

function treeViolations(treeHash: string): Violation[] {
  if (treeHash === FROZEN_SRC_TREE) return [];
  return [
    {
      file: 'src',
      line: 1,
      rule: 'P-17',
      problem: `src/ tree is ${treeHash || 'unreadable'}, not the frozen ${FROZEN_SRC_TREE}`,
      fix: `${FIX} git diff --stat ${FROZEN_SRC_TREE} HEAD:src lists what changed.`,
    },
  ];
}

export const freezeGate = (inputs: FreezeInputs): GateResult => ({
  name: 'freeze',
  files: inputs.fileCount,
  detail: `src tree ${inputs.treeHash || 'unreadable'}`,
  violations: [
    ...treeViolations(inputs.treeHash),
    ...inputs.statusLines
      .filter((line) => line.trim() !== '')
      .flatMap(changedFileViolations),
  ],
});

function git(args: string[]): string {
  try {
    return execFileSync('git', args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

const lines = (output: string) =>
  output.split('\n').filter((line) => line.length > 0);

if (import.meta.main) {
  finish(
    freezeGate({
      treeHash: git(['rev-parse', 'HEAD:src']).trim(),
      statusLines: lines(git(['status', '--porcelain', '--', 'src'])),
      fileCount: lines(git(['ls-files', 'src'])).length,
    }),
  );
}
