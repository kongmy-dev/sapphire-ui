import type { GateResult } from '../gates/report.js';

export type ApiSnapshot = {
  version: string;
  releaseNotes: string;
  surface: string;
};

export function parseApiSnapshot(text: string): ApiSnapshot {
  const value: unknown = JSON.parse(text);
  if (
    typeof value !== 'object' ||
    value === null ||
    !('version' in value) ||
    !('releaseNotes' in value) ||
    !('surface' in value)
  )
    throw new Error('Malformed API snapshot');
  if (
    typeof value.version !== 'string' ||
    typeof value.releaseNotes !== 'string' ||
    !Array.isArray(value.surface) ||
    !value.surface.every((line: unknown) => typeof line === 'string')
  )
    throw new Error('Malformed API snapshot');
  return {
    version: value.version,
    releaseNotes: value.releaseNotes,
    surface: value.surface.join('\n'),
  };
}

export function releaseNotes(changelog: string, version: string) {
  const sections = changelog.split(/^## /m);
  return (
    sections
      .find(
        (section) =>
          section.startsWith(`${version} `) ||
          section.startsWith(`${version}\n`),
      )
      ?.split('\n')
      .slice(1)
      .join('\n')
      .trim() ?? ''
  );
}

function newerVersion(current: string, previous: string) {
  if (!/^\d+\.\d+\.\d+$/.test(current) || !/^\d+\.\d+\.\d+$/.test(previous))
    return false;
  const left = current.split('.').map(Number);
  const right = previous.split('.').map(Number);
  for (let index = 0; index < 3; index++) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0);
    if (delta !== 0) return delta > 0;
  }
  return false;
}

function versionProblems(actual: ApiSnapshot, baseline: ApiSnapshot | null) {
  const problems: string[] = [];
  if (baseline && baseline.surface !== actual.surface) {
    if (!newerVersion(actual.version, baseline.version))
      problems.push('Public API changed without increasing the version');
    if (actual.releaseNotes === baseline.releaseNotes)
      problems.push('Public API changed without updated release notes');
  }
  return problems;
}

export function apiContract(input: {
  actual: ApiSnapshot;
  snapshot: ApiSnapshot | null;
  baseline: ApiSnapshot | null;
  exportsMatch: boolean;
}): GateResult {
  const { actual, snapshot, baseline } = input;
  const problems: string[] = [];
  if (!actual.surface) problems.push('No public API was measured');
  if (!input.exportsMatch)
    problems.push(
      'Package exports differ from the generated public entrypoints',
    );
  if (!snapshot || JSON.stringify(actual) !== JSON.stringify(snapshot))
    problems.push('API snapshot is missing or stale');
  if (actual.releaseNotes.length < 40)
    problems.push(
      'Current version needs meaningful CHANGELOG.md release notes',
    );
  problems.push(...versionProblems(actual, baseline));
  return {
    name: 'api',
    files: actual.surface ? 1 : 0,
    violations: problems.map((problem) => ({
      file: 'tooling/package/api-snapshot.json',
      line: 1,
      rule: 'P-16',
      problem,
      fix: 'Update the version and changelog, run bun run generate:package and bun run api:snapshot, then commit the reviewed API change.',
    })),
  };
}
