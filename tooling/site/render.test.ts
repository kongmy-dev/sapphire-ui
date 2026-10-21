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

test('API text cannot become executable markup and full example source is omitted', () => {
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
  const html = componentPage(root, [row], false, '', [
    {
      name: 'Button',
      supporting: false,
      definition: '',
      branches: [
        {
          name: 'ButtonProps',
          props: [
            {
              name: 'label',
              type: '<script>alert("API")</script>',
              required: true,
              defaultValue: undefined,
              platform: false,
            },
          ],
        },
      ],
    },
  ]);
  expect(html).toContain(
    'data-example-component="button" data-example-name="variants"',
  );
  expect(html).toContain('src="/assets/examples-entry.js"');
  expect(html).not.toContain('<iframe');
  expect(html).not.toContain('preview.html');
  expect(html).toContain('@kongmy-dev/sapphire-ui/sapphire.css');
  expect(html).toContain('&lt;script&gt;alert(&quot;API&quot;)');
  expect(html).not.toContain('<script>alert');
  expect(html).not.toContain('alert(&quot;example&quot;)');
  expect(html).toContain('id="props"');
  expect(html).not.toContain('id="source"');
});

test('native setup registers the element without importing a named React export', () => {
  mkdirSync(join(root, 'elements'), { recursive: true });
  writeFileSync(
    join(root, 'elements/banner.ts'),
    'export const BannerElement = class {};',
  );
  writeFileSync(
    join(root, 'elements/banner.examples.ts'),
    'function Example() {}',
  );
  const html = componentPage(
    root,
    [
      {
        component: 'banner',
        name: 'notice',
        file: 'elements/banner.examples.ts',
      },
    ],
    true,
  );
  expect(html).toContain(
    'import &quot;@kongmy-dev/sapphire-ui/elements/banner&quot;;',
  );
  expect(html).not.toContain('import { BannerElement }');
  expect(html).toContain('id="setup"');
  expect(html).toContain('id="examples"');
  expect(html).toContain('id="props"');
  expect(html).not.toContain('id="source"');
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
  expect(html).toContain('@kongmy-dev/sapphire-ui/sapphire.css');
  expect(html).not.toContain('import {');
});

test('catalog has one link per component and native links stay in their lane', () => {
  const html = catalogPage([row, { ...row, name: 'sizes' }]);
  expect(html.match(/href="\/components\/button\/"/g)).toHaveLength(1);
  expect(catalogPage([row], true)).toContain('href="/native/button/"');
  expect(page('<unsafe>', '')).toContain('&lt;unsafe&gt;');
  expect(() => componentPage(root, [])).toThrow();
});

test('setup includes behaviour peers from composed components', () => {
  const html = componentPage(process.cwd(), [
    {
      component: 'avatar-group',
      name: 'members',
      file: 'components/avatar-group/avatar-group.examples.tsx',
    },
  ]);
  expect(html).toContain(
    'bun add @kongmy-dev/sapphire-ui react react-dom radix-ui',
  );
  expect(html).toContain('@kongmy-dev/sapphire-ui/sapphire.css');
  const native = catalogPage([row], true);
  expect(native).not.toContain('import { Button }');
});
