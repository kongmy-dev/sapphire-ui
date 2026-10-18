import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GENERATORS, type Generator } from '../generators';
import { finish, type GateResult, type Violation } from './report';

const FIX = 'Run bun run generate and commit the result.';

function firstDifference(actual: string, expected: string): number {
  const have = actual.split('\n');
  const want = expected.split('\n');
  const length = Math.max(have.length, want.length);
  for (let index = 0; index < length; index++) {
    if (have[index] !== want[index]) return index + 1;
  }
  return 1;
}

function staleness(root: string, generator: Generator): Violation[] {
  const path = join(root, generator.file);
  const expected = generator.generate(root);
  if (!existsSync(path)) {
    return [
      {
        file: generator.file,
        line: 1,
        rule: 'P-16',
        problem: `${generator.file} is missing`,
        fix: FIX,
      },
    ];
  }
  const actual = readFileSync(path, 'utf8');
  return actual === expected
    ? []
    : [
        {
          file: generator.file,
          line: firstDifference(actual, expected),
          rule: 'P-16',
          problem: `${generator.file} differs from what its generator writes`,
          fix: FIX,
        },
      ];
}

export const generatedGate = (
  root: string,
  generators: readonly Generator[] = GENERATORS,
): GateResult => ({
  name: 'generated',
  files: generators.length,
  violations: generators.flatMap((generator) => staleness(root, generator)),
});

if (import.meta.main) finish(generatedGate(process.cwd()));
