import { expect, test } from 'bun:test';
import { readA11yResults } from './a11y-report';

const spec = (title: string, results = [{ status: 'passed' }]) => ({
  title,
  tests: [{ projectName: 'chromium', results }],
});
const report = (specs: unknown[]) =>
  JSON.stringify({
    suites: [{ suites: [{ specs }] }],
  });

test('a11y reporter reads actual nested Playwright results without assuming success', () => {
  expect(
    readA11yResults(
      report([spec('react/button/default/light', [{ status: 'failed' }])]),
    ),
  ).toEqual([
    {
      title: 'react/button/default/light',
      project: 'chromium',
      status: 'failed',
    },
  ]);
});

test('a11y reporter excludes unrelated suites but preserves every retry outcome', () => {
  expect(
    readA11yResults(
      report([
        spec('legacy/specimen'),
        spec('react/button/default/light', [
          { status: 'failed' },
          { status: 'passed' },
        ]),
      ]),
    ),
  ).toHaveLength(2);
});

test('a11y reporter rejects missing malformed and structurally invalid reports', () => {
  for (const text of [
    '',
    '{}',
    '{"suites":false}',
    report([{ title: 'react/a/b/light', tests: [{}] }]),
  ])
    expect(readA11yResults(text)).toBeNull();
});

test('a11y reporter keeps zero results empty so coverage fails missing runs', () => {
  expect(
    readA11yResults(report([spec('react/button/default/light', [])])),
  ).toEqual([]);
});
