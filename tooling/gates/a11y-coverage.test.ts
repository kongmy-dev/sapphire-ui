import { expect, test } from 'bun:test';
import { checkA11yCoverage } from './a11y-coverage';
import { renderReport } from './report';

const catalog = [
  {
    component: 'button',
    file: 'components/button/button.examples.tsx',
    name: 'default',
  },
];
const results = ['light', 'dark'].flatMap((scheme) =>
  ['chromium', 'firefox', 'webkit'].map((project) => ({
    title: `react/button/default/${scheme}`,
    project,
    status: 'passed',
  })),
);

test('a11y coverage requires the full browser and scheme matrix', () => {
  expect(renderReport(checkA11yCoverage(catalog, results)).ok).toBe(true);
  expect(checkA11yCoverage(catalog, results.slice(1)).violations).toHaveLength(
    1,
  );
});

test('a11y coverage fails an empty catalog and an absent report', () => {
  expect(renderReport(checkA11yCoverage([], [])).ok).toBe(false);
  expect(checkA11yCoverage(catalog, []).violations).toHaveLength(6);
});

test('a11y coverage rejects failed skipped timed out and interrupted tests', () => {
  for (const status of ['failed', 'skipped', 'timedOut', 'interrupted']) {
    const failing = results.map((result, index) =>
      index === 0 ? { ...result, status } : result,
    );
    expect(checkA11yCoverage(catalog, failing).violations[0]).toMatchObject({
      file: catalog[0]?.file,
      rule: 'P-8',
    });
  }
});

test('a11y coverage rejects duplicate outcomes and unexpected examples', () => {
  expect(
    checkA11yCoverage(catalog, [...results, ...results]).violations,
  ).toHaveLength(6);
  expect(
    checkA11yCoverage(catalog, [
      ...results,
      {
        title: 'react/unknown/default/light',
        project: 'chromium',
        status: 'passed',
      },
    ]).violations[0]?.problem,
  ).toContain('Unexpected');
});
