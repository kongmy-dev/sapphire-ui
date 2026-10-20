import { expect, it } from 'bun:test';
import { apiContract, parseApiSnapshot, releaseNotes } from './api-contract.js';

const baseline = {
  version: '4.0.0',
  releaseNotes: 'Initial public components and styles with native elements.',
  surface: 'Button(): Element; .sp-button; --background',
};
it('accepts unchanged API and documented versioned changes', () => {
  expect(
    apiContract({
      actual: baseline,
      snapshot: baseline,
      baseline,
      exportsMatch: true,
    }).violations,
  ).toEqual([]);
  const actual = {
    ...baseline,
    version: '4.1.0',
    releaseNotes: 'Add the compact public button variant and its styles.',
    surface: 'Button(size?: compact): Element; .sp-button; --background',
  };
  expect(
    apiContract({ actual, snapshot: actual, baseline, exportsMatch: true })
      .violations,
  ).toEqual([]);
});
it('rejects a type selector or token change without a version increase even after updating the snapshot', () => {
  for (const surface of [
    'Button(required: string): Element',
    '.sp-button-renamed',
    '--removed-background',
  ]) {
    const actual = { ...baseline, surface };
    expect(
      apiContract({
        actual,
        snapshot: actual,
        baseline,
        exportsMatch: true,
      }).violations.some((item) => item.problem.includes('version')),
    ).toBe(true);
  }
});
it('rejects stale exports, missing snapshot, missing notes and measuring nothing', () => {
  const actual = { ...baseline, surface: '', releaseNotes: '' };
  const result = apiContract({
    actual,
    snapshot: null,
    baseline,
    exportsMatch: false,
  });
  expect(result.files).toBe(0);
  expect(result.violations).toHaveLength(5);
});
it('rejects malformed snapshots and finds notes only under the exact version heading', () => {
  expect(() => parseApiSnapshot('{"version":4}')).toThrow('Malformed');
  expect(
    releaseNotes(
      '## 4.0.0 — unreleased\n\nActual migration.\n\n## 3.0.0\nOld.',
      '4.0.0',
    ),
  ).toBe('Actual migration.');
  expect(releaseNotes('## 4.0.1\nDifferent.', '4.0.0')).toBe('');
});
