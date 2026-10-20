import { afterEach, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  exampleUrl,
  namesFromSource,
  readExamples,
  readVisualExamples,
} from './catalog';

const root = mkdtempSync(join(tmpdir(), 'sapphire-example-catalog-'));
afterEach(() =>
  rmSync(join(root, 'components'), { recursive: true, force: true }),
);
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('discovers literal example names without executing React modules', () => {
  expect(
    namesFromSource(
      'button.examples.tsx',
      `
    throw new Error('must not execute');
    export const examples = [{name: 'with-icon', render: WithIcon}] as const;
  `,
    ),
  ).toEqual(['with-icon']);
});

test.each([
  'const examples = [{name: "valid", render: Valid}];',
  'export const examples = [];',
  'export const examples = computedExamples;',
  'export const examples = [otherExample];',
  'export const examples = [{name: "Bad Name", render: Valid}];',
  'export const examples = [{name: "valid", render: () => null}];',
  'export const examples = [{name: "valid", render: lowercase}];',
  'export const examples = [{name: "valid", render: Valid}, {name: "valid", render: Other}];',
])('rejects unstable or undiscoverable example declarations: %s', (source) => {
  expect(() => namesFromSource('invalid.examples.tsx', source)).toThrow();
});

test('enumerates colocated examples independently of test imports', () => {
  for (const component of ['dialog', 'button']) {
    const directory = join(root, 'components', component);
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, `${component}.examples.tsx`),
      'export const examples = [{name: "default", render: DefaultExample}];',
    );
  }
  mkdirSync(join(root, 'components', 'without-examples'));
  expect(readVisualExamples(root).map(({ name }) => name)).toEqual([
    'react/button/default',
    'react/dialog/default',
    'react/dialog/default/open',
  ]);
  const rows = readExamples(root);
  expect(rows.map(({ component }) => component)).toEqual(['button', 'dialog']);
  expect(rows[0]).toEqual({
    component: 'button',
    name: 'default',
    file: 'components/button/button.examples.tsx',
  });
  expect(
    exampleUrl(
      { component: 'button', name: 'default', file: 'unused' },
      'dark',
    ),
  ).toBe('http://localhost:4176/?component=button&example=default&scheme=dark');
});

test('an absent components tree has no examples', () => {
  expect(readExamples(root)).toEqual([]);
});
