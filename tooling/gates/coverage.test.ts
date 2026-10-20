import { expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { coverageFiles, coverageGate } from './coverage';
import { renderReport } from './report';

const FILE = 'components/button/button.tsx';
const record = (file = FILE) =>
  `SF:${file}\nDA:1,1\nFNDA:1,Button\nend_of_record\n`;
const check = (lcov: string | null, files = [FILE]) =>
  coverageGate({ root: '/project', files, lcov });

test('coverage accepts every file at or above both thresholds', () => {
  expect(renderReport(check(record())).ok).toBe(true);
});

test('coverage fails when no public files were enumerated', () => {
  expect(renderReport(check(record(), [])).ok).toBe(false);
});

test('coverage fails missing reports and independently counted unimported files', () => {
  expect(check(null).violations[0]).toMatchObject({ file: FILE, rule: 'P-10' });
  const missing = 'hooks/unimported.ts';
  expect(check(record(), [FILE, missing]).violations[0]?.file).toBe(missing);
});

test('coverage rejects low lines even with completely covered functions', () => {
  expect(
    check(record().replace('DA:1,1', 'DA:1,0')).violations[0]?.problem,
  ).toContain('lines coverage 0.00%');
});

test('coverage rejects low functions even with completely covered lines', () => {
  expect(
    check(record().replace('FNDA:1', 'FNDA:0')).violations[0]?.problem,
  ).toContain('functions coverage 0.00%');
});

test('coverage rejects empty and duplicate records', () => {
  expect(check(`SF:${FILE}\nend_of_record`).violations).toHaveLength(1);
  expect(check(record() + record()).violations).toHaveLength(1);
});

test('coverage resolves absolute report paths against the checkout', () => {
  expect(check(record(`/project/${FILE}`)).violations).toEqual([]);
});

test('coverage enumerates examples and never silently drops unimported source', () => {
  const root = mkdtempSync(join(tmpdir(), 'sapphire-coverage-'));
  try {
    mkdirSync(join(root, 'components/button'), { recursive: true });
    for (const name of [
      'button.tsx',
      'button.examples.tsx',
      'lost.ts',
      'button.test.tsx',
      'types.d.ts',
    ])
      writeFileSync(join(root, 'components/button', name), '');
    expect(coverageFiles(root)).toEqual([
      'components/button/button.examples.tsx',
      FILE,
      'components/button/lost.ts',
    ]);
  } finally {
    rmSync(root, { recursive: true });
  }
});
