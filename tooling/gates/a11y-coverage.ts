import { finish, type GateResult, type Violation } from './report';

export type A11yExample = { component: string; file: string; name: string };
export type A11yResult = { title: string; project: string; status: string };
const SCHEMES = ['light', 'dark'];
const BROWSERS = ['chromium', 'firefox', 'webkit'];

const problem = (file: string, message: string): Violation => ({
  file,
  line: 1,
  rule: 'P-8',
  problem: message,
  fix: 'Run every exported React example through strict axe and keyboard coverage in both schemes and all browsers.',
});

export function checkA11yCoverage(
  catalog: readonly A11yExample[],
  results: readonly A11yResult[],
): GateResult {
  const expected = catalog.flatMap((example) =>
    SCHEMES.flatMap((scheme) =>
      BROWSERS.map((project) => ({
        title: `react/${example.component}/${example.name}/${scheme}`,
        project,
        file: example.file,
      })),
    ),
  );
  const violations = expected.flatMap((entry) => {
    const found = results.filter(
      (result) =>
        result.title === entry.title && result.project === entry.project,
    );
    if (found.length !== 1)
      return [
        problem(
          entry.file,
          `${entry.title} (${entry.project}): expected one result, found ${found.length}`,
        ),
      ];
    const result = found[0];
    return result?.status === 'passed'
      ? []
      : [
          problem(
            entry.file,
            `${entry.title} (${entry.project}): ${result?.status ?? 'missing'}`,
          ),
        ];
  });
  for (const result of results) {
    const known = expected.some(
      (entry) =>
        entry.title === result.title && entry.project === result.project,
    );
    if (!known)
      violations.push(
        problem(
          'a11y-report',
          `Unexpected result ${result.title} (${result.project})`,
        ),
      );
  }
  return { name: 'a11y coverage', files: catalog.length, violations };
}

if (import.meta.main) {
  const root = process.cwd();
  const path = resolve(root, process.argv[2] ?? 'test-results/a11y.json');
  const results = existsSync(path)
    ? readA11yResults(readFileSync(path, 'utf8'))
    : null;
  const result = checkA11yCoverage(readExamples(root), results ?? []);
  if (results === null)
    result.violations.push(
      problem(path, 'Missing or invalid Playwright report'),
    );
  finish(result);
}

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readExamples } from '../examples/catalog';
import { readA11yResults } from '../source/a11y-report';
