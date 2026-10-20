import { expect, test } from 'bun:test';
import type ts from 'typescript';
import { boundaryGate } from './boundary';
import { renderReport } from './report';
import type { FileText } from './scope';

const file = (name: string, text = '') => ({ name, text });
const check = (files: FileText[], options: ts.CompilerOptions = {}) =>
  boundaryGate({ root: '/project', files, options });

test('boundary allows one way public layers and supported peers', () => {
  const result = check([
    file(
      'components/button/button.tsx',
      `import React from 'react'; import '../../lib/slot';`,
    ),
    file('lib/slot.tsx', `export const slot = 1;`),
  ]);
  expect(result.violations).toEqual([]);
});

test('boundary fails when nothing is checked', () => {
  expect(renderReport(check([])).ok).toBe(false);
});

test('boundary rejects upward reexports and reports their location', () => {
  expect(
    check([
      file(
        'lib/slot.tsx',
        `\nexport { Button } from '../components/button/button';`,
      ),
      file('components/button/button.tsx'),
    ]).violations[0],
  ).toMatchObject({ file: 'lib/slot.tsx', line: 2, rule: 'P-2' });
});

test('boundary resolves dynamic imports and rejects computed targets', () => {
  const result = check([
    file(
      'components/button/button.tsx',
      `import('../../site/main'); import(target);`,
    ),
    file('site/main.ts'),
  ]);
  expect(result.violations).toHaveLength(2);
});

test('boundary resolves aliased paths before deciding whether they are external', () => {
  const result = check(
    [
      file('components/button/button.tsx', `import '@/tooling/private';`),
      file('tooling/private.ts'),
    ],
    { baseUrl: '/project', paths: { '@/*': ['*'] } },
  );
  expect(result.violations[0]?.problem).toContain('tooling/private.ts');
});

test('boundary rejects forbidden packages and unresolved local imports', () => {
  expect(
    check([
      file(
        'components/button/button.tsx',
        `import 'class-variance-authority'; import './missing';`,
      ),
    ]).violations,
  ).toHaveLength(2);
});

test('boundary only lets component tests import public entries and examples', () => {
  const result = check([
    file(
      'components/button/button.test.tsx',
      `import './button'; import './button.examples'; import './private'; import '@testing-library/react';`,
    ),
    file('components/button/button.tsx'),
    file('components/button/button.examples.tsx'),
    file('components/button/private.ts'),
  ]);
  expect(result.violations).toHaveLength(1);
  expect(result.violations[0]?.problem).toContain('private.ts');
});

test('boundary rejects CSS imports into runtime layers but ignores comments', () => {
  const result = check([
    file(
      'css/base.css',
      `/* @import '../site/hidden.css'; */\n@import '../components/button/button.css';`,
    ),
    file('components/button/button.css'),
  ]);
  expect(result.violations).toHaveLength(1);
  expect(result.violations[0]?.line).toBe(2);
});
