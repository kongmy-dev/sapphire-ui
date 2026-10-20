import { afterAll, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { catalogPage, componentPage, page } from './render';

const root = mkdtempSync(join(tmpdir(), 'sapphire-site-test-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));
const row = {
  component: 'button',
  name: 'variants',
  file: 'components/button/button.examples.tsx',
};

test('source cannot become executable markup and both schemes have live previews', () => {
  const directory = join(root, 'components/button');
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, 'button.tsx'),
    'export function Button() { return <button>Continue</button>; }',
  );
  writeFileSync(join(directory, 'button.css'), '.sp-button {}');
  writeFileSync(
    join(directory, 'button.examples.tsx'),
    '<script>alert("example")</script>',
  );
  const html = componentPage(root, [row]);
  expect(html).toContain('scheme=light');
  expect(html).toContain('scheme=dark');
  expect(html).toContain('@kongmy-dev/sapphire-ui/button.css');
  expect(html).toContain('&lt;script&gt;alert(&quot;example&quot;)');
  expect(html).not.toContain('<script>alert');
});

test('CSS-only entries do not advertise nonexistent React imports', () => {
  const directory = join(root, 'components/document');
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'document.css'), '.sp-document {}');
  writeFileSync(
    join(directory, 'document.examples.tsx'),
    'function Example() {}',
  );
  const html = componentPage(root, [
    {
      component: 'document',
      name: 'article',
      file: 'components/document/document.examples.tsx',
    },
  ]);
  expect(html).toContain('@kongmy-dev/sapphire-ui/document.css');
  expect(html).not.toContain('import {');
});

test('catalog has one link per component and native links stay in their lane', () => {
  const html = catalogPage([row, { ...row, name: 'sizes' }]);
  expect(html.match(/href="\/components\/button\/"/g)).toHaveLength(1);
  expect(catalogPage([row], true)).toContain('href="/native/button/"');
  expect(page('<unsafe>', '')).toContain('&lt;unsafe&gt;');
  expect(() => componentPage(root, [])).toThrow();
});
