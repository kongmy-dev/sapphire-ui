import { describe, expect, it } from 'bun:test';
import type { ComponentRow } from './components';
import { renderScorecard, type Scorecard } from './render';

const row = (name: string, done: boolean): ComponentRow => ({
  name,
  css: done,
  react: done,
  examples: false,
  pin: false,
  element: false,
  registry: false,
});

const card: Scorecard = {
  commit: 'bc2e116',
  subject: 'feat(gates): adopt coding principles',
  notes: ['lockfile is stale: installed without --frozen-lockfile'],
  measurement: {
    runtimeDependencies: 4,
    requiredPeers: 22,
    exportEntries: 88,
    strayComments: 354,
    sizeFindings: 61,
    sizeFailingFiles: 28,
    markdownLines: 2391,
  },
  stylesheet: { kind: 'measured', bytes: 23614 },
  rows: [row('alert', false), row('button', true)],
  referencePins: 0,
};

describe('scorecard rendering', () => {
  it('prints the commit, notes and every number', () => {
    const text = renderScorecard(card);
    expect(text).toContain(
      'scorecard bc2e116  feat(gates): adopt coding principles',
    );
    expect(text).toContain('note: lockfile is stale');
    expect(text).toContain('runtime dependencies  4');
    expect(text).toContain('required peers        22');
    expect(text).toContain('export entries        88');
    expect(text).toContain('stray comments        354');
    expect(text).toContain('size-gate findings    61 in 28 files');
    expect(text).toContain('markdown lines        2,391');
    expect(text).toContain('gzipped stylesheet    23,614 bytes (23.6 kB)');
  });

  it('prints the reason when the stylesheet is unmeasured', () => {
    const text = renderScorecard({
      ...card,
      stylesheet: { kind: 'unmeasured', reason: 'build failed: error TS2307' },
    });
    expect(text).toContain('unmeasured (build failed: error TS2307)');
    expect(text).not.toContain('bytes');
  });

  it('prints a table of yes and no with a count per column', () => {
    const lines = renderScorecard(card).split('\n');
    const header = lines.findIndex((line) => line.startsWith('name'));
    expect(lines[header]).toMatch(
      /^name\s+css\s+react\s+examples\s+pin\s+element\s+registry$/,
    );
    expect(lines[header + 1]).toMatch(/^alert\s+no\s+no\s+no\s+no\s+no\s+no$/);
    expect(lines[header + 2]).toMatch(
      /^button\s+yes\s+yes\s+no\s+no\s+no\s+no$/,
    );
    expect(lines[header + 3]).toMatch(/^done\s+1\s+1\s+0\s+0\s+0\s+0$/);
  });

  it('prints the row count and the reference pin count', () => {
    const text = renderScorecard(card);
    expect(text).toContain('components: 2 rows');
    expect(text).toContain('v3 reference pins: 0');
  });
});
