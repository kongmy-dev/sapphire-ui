import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildStylesheet } from '../css/build';
import { STYLESHEET_FILE } from '../css/stylesheet';
import { gzippedBytes } from '../scorecard/measure';
import { finish, type GateResult } from './report';

export const CEILING_BYTES = 24 * 1_024;

const count = (bytes: number) => bytes.toLocaleString('en-US');

export const budgetGate = (
  gzipped: number,
  ceiling: number = CEILING_BYTES,
): GateResult => ({
  name: 'budget',
  files: gzipped > 0 ? 1 : 0,
  detail: `${count(gzipped)} bytes gzipped, ceiling ${count(ceiling)}`,
  violations:
    gzipped > ceiling
      ? [
          {
            file: STYLESHEET_FILE,
            line: 1,
            rule: 'P-13',
            problem: `gzipped stylesheet is ${count(gzipped)} bytes, ${count(gzipped - ceiling)} over the ${count(ceiling)} ceiling`,
            fix: 'Remove or merge CSS until it fits; the ceiling changes only when the owner decides it (docs/adr/0003-the-css-contract-comes-first.md).',
          },
        ]
      : [],
});

export async function measureStylesheet(root: string): Promise<number> {
  const scratch = mkdtempSync(join(tmpdir(), 'sapphire-budget-'));
  try {
    const built = await buildStylesheet(root, scratch, { minify: true });
    return gzippedBytes(readFileSync(built.stylesheet));
  } finally {
    rmSync(scratch, { recursive: true });
  }
}

if (import.meta.main) {
  finish(budgetGate(await measureStylesheet(process.cwd())));
}
