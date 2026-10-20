import { describe, expect, it } from 'bun:test';
import { calibration, percentile95 } from './calibration.js';
import { measureText } from './measure.js';

describe('reader-load calibration', () => {
  it('uses nearest rank on an ordered copy, including small populations', () => {
    const values = [100, ...Array.from({ length: 19 }, (_, index) => index)];
    expect(percentile95(values)).toBe(18);
    expect(values[0]).toBe(100);
    expect(percentile95([7])).toBe(7);
    expect(percentile95([1, 2])).toBe(2);
  });

  it('rejects empty populations instead of reporting an unmeasured zero', () => {
    expect(() => percentile95([])).toThrow('empty population');
    expect(() => calibration([])).toThrow('empty population');
    expect(() =>
      calibration([measureText('value.ts', 'export const x = 1;')]),
    ).toThrow('empty population');
  });

  it('records file and function populations independently', () => {
    const short = measureText('short.ts', 'export const run = () => 1;');
    const data = measureText('data.ts', 'export const data = [1, 2, 3];');
    expect(calibration([short, data])).toEqual({
      method: 'nearest-rank-95th-percentile',
      population: 'tracked in-scope non-test TypeScript files',
      files: 2,
      functions: 1,
      p95: {
        cognitive: 0,
        functionLines: 1,
        fileCodeLines: 1,
        nesting: short.maxNesting,
      },
    });
  });
});
