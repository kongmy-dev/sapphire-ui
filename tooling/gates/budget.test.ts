import { afterEach, describe, expect, it } from 'bun:test';
import { join } from 'node:path';
import { makeTree, type Tree } from '../css/tree';
import { budgetGate, CEILING_BYTES, measureStylesheet } from './budget';
import { renderReport } from './report';

const REPOSITORY = join(import.meta.dir, '../..');

let tree: Tree | null = null;
afterEach(() => {
  tree?.remove();
  tree = null;
});

const SEED = 20_260_718;

function bloatedComponent(rules: number): string {
  let state = SEED;
  const word = () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state.toString(16).padStart(8, '0');
  };
  const body = Array.from(
    { length: rules },
    () => `.sp-${word()}{color:#${word().slice(0, 6)};margin:${word()}px}`,
  ).join('');
  return `@layer components{${body}}`;
}

describe('budget gate: gzipped sapphire.css stays under its ceiling', () => {
  it('prints the measured size and the ceiling when it fits', () => {
    expect(renderReport(budgetGate(5_000, 23_765))).toEqual({
      ok: true,
      text: 'budget gate: 1 file checked (5,000 bytes gzipped, ceiling 23,765)\nbudget gate: OK',
    });
  });

  it('passes at exactly the ceiling and fails one byte over', () => {
    expect(renderReport(budgetGate(23_765, 23_765)).ok).toBe(true);
    const over = renderReport(budgetGate(23_766, 23_765));
    expect(over.ok).toBe(false);
    expect(over.text.split('\n').slice(1, 2)).toEqual([
      '  sapphire.css:1  P-13  gzipped stylesheet is 23,766 bytes, 1 over the 23,765 ceiling',
    ]);
  });

  it('fails when nothing was measured', () => {
    const report = renderReport(budgetGate(0));
    expect(report.ok).toBe(false);
    expect(report.text).toContain('nothing was measured');
  });

  it('measures the real stylesheet under the ceiling', async () => {
    const bytes = await measureStylesheet(REPOSITORY);
    expect(bytes).toBeGreaterThan(0);
    expect(budgetGate(bytes).violations).toEqual([]);
  });

  it('fails a build that a new component pushes over the ceiling', async () => {
    tree = makeTree({ bloat: bloatedComponent(6_000) });
    const bytes = await measureStylesheet(tree.root);
    const report = renderReport(budgetGate(bytes));
    expect(bytes).toBeGreaterThan(CEILING_BYTES);
    expect(report.ok).toBe(false);
    expect(report.text).toContain('P-13');
    expect(report.text).toContain(
      `ceiling ${CEILING_BYTES.toLocaleString('en-US')}`,
    );
  });
});
