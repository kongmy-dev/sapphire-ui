import type { FileMetrics } from './measure.js';

export function percentile95(values: readonly number[]): number {
  if (values.length === 0)
    throw new Error('Cannot calibrate an empty population');
  const ordered = values.toSorted((left, right) => left - right);
  return ordered[Math.ceil(ordered.length * 0.95) - 1] ?? 0;
}

export function calibration(files: readonly FileMetrics[]) {
  const functions = files.flatMap((file) => file.functions);
  return {
    method: 'nearest-rank-95th-percentile',
    population: 'tracked in-scope non-test TypeScript files',
    files: files.length,
    functions: functions.length,
    p95: {
      cognitive: percentile95(functions.map((fn) => fn.ownCognitive)),
      functionLines: percentile95(functions.map((fn) => fn.codeLines)),
      fileCodeLines: percentile95(files.map((file) => file.codeLines)),
      nesting: percentile95(files.map((file) => file.maxNesting)),
    },
  };
}
