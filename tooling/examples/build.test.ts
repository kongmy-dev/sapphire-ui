import { afterAll, expect, test } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildExamples } from './build';
import { readExamples } from './catalog';
import { readElementExamples } from './elements';

const root = process.cwd();
const out = mkdtempSync(join(tmpdir(), 'sapphire-example-bundles-'));
afterAll(() => rmSync(out, { recursive: true, force: true }));

function reachableBundle(entry: string) {
  const sources = new Map<string, string>();
  const pending = new Set([entry]);
  for (const file of pending) {
    const source = readFileSync(join(out, 'production', file), 'utf8');
    sources.set(file, source);
    for (const imported of source.matchAll(/"\/assets\/([^"\s]+\.js)"/g)) {
      if (imported[1]) pending.add(imported[1]);
    }
  }
  return [...sources.values()].join('\n');
}

test('production entries preserve every named React/native example with bounded page assets', async () => {
  const examples = readExamples(root);
  await buildExamples({
    root,
    out: join(out, 'production'),
    examples,
    production: true,
  });
  for (const row of examples) {
    expect(reachableBundle(`examples/${row.component}.js`)).toContain(row.name);
    expect(
      existsSync(join(out, 'production/examples', `${row.component}.css`)),
    ).toBe(true);
  }
  for (const row of readElementExamples(root)) {
    expect(reachableBundle(`native/${row.component}.js`)).toContain(row.name);
    expect(
      existsSync(join(out, 'production/native', `${row.component}.css`)),
    ).toBe(true);
  }
  const button = reachableBundle('examples/button.js');
  expect(button).not.toContain('We will send a verification link.');
  expect(button).not.toContain('Download the React DevTools');
  expect(button).not.toContain('react.development');
  expect(reachableBundle('examples/form-field.js')).toContain(
    'We will send a verification link.',
  );
  expect(existsSync(join(out, 'production/equivalence.js'))).toBe(false);
  expect(existsSync(join(out, 'production/examples-entry.js'))).toBe(false);
  const styles = readFileSync(
    join(out, 'production/examples/button.css'),
    'utf8',
  );
  expect(styles).toContain('.docs-button-hint');
  expect(styles).not.toContain('.docs-form-field-demo');
});

test('development keeps the all-example browser and native equivalence harness', async () => {
  mkdirSync(join(out, 'development'));
  await buildExamples({
    root,
    out: join(out, 'development'),
    examples: readExamples(root),
  });
  for (const file of [
    'examples-entry.js',
    'elements-entry.js',
    'equivalence.js',
    'examples.css',
    'sapphire.css',
  ]) {
    expect(existsSync(join(out, 'development', file))).toBe(true);
  }
  expect(
    readFileSync(join(out, 'development/examples-entry.js'), 'utf8'),
  ).toContain('We will send a verification link.');
});

test('production rejects an empty catalogue before building assets', async () => {
  await expect(
    buildExamples({
      root,
      out: join(out, 'empty'),
      examples: [],
      production: true,
    }),
  ).rejects.toThrow('non-empty React catalogue');
  expect(existsSync(join(out, 'empty'))).toBe(false);
});
