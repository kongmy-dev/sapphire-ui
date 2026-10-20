import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ExampleRow } from '../examples/catalog';

const escapeHtml = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const titleOf = (name: string) =>
  name
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
export const code = (source: string) =>
  `<div class="sp-code-block"><pre class="sp-code-block-pre" tabindex="0"><code>${escapeHtml(source)}</code></pre></div>`;

export function page(title: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Sapphire UI: navy and gold components for React and native HTML."><title>${escapeHtml(title)} · Sapphire UI</title><link rel="stylesheet" href="/assets/sapphire.css"></head><body><a class="sp-sr-only-focusable" href="#main">Skip to content</a><header class="sp-site-header"><div class="sp-page sp-cluster"><div class="sp-site-header-brand"><a href="/">Sapphire UI</a></div><nav class="sp-cluster" aria-label="Main"><a class="sp-site-header-link" href="/">Components</a><a class="sp-site-header-link" href="/foundations/">Foundations</a><a class="sp-site-header-link" href="/native/">Native elements</a></nav></div></header><main id="main" class="sp-page sp-stack sp-cq"><header class="sp-admin-layout-page-head"><h1>${escapeHtml(title)}</h1></header>${body}</main><footer class="sp-page"><p>Sapphire UI · KONGMY Digital Solutions</p></footer><script type="module" src="/assets/site-client.js"></script></body></html>`;
}

export function catalogPage(rows: readonly ExampleRow[], native = false) {
  const names = [...new Set(rows.map((row) => row.component))];
  const prefix = native ? 'native' : 'components';
  return page(
    native ? 'Native elements' : 'Sapphire UI',
    `<p>Editorial character. Practical controls. Use the package, plain HTML or source you own.</p>${code('bun add @kongmy-dev/sapphire-ui')}<p>Import foundations once, then the stylesheet for each component you use. Install React only for React components and behaviour peers only where required.</p>${code('import "@kongmy-dev/sapphire-ui/foundations.css";\nimport "@kongmy-dev/sapphire-ui/button.css";\nimport { Button } from "@kongmy-dev/sapphire-ui/button";')}<div class="sp-columns" data-columns="3" data-from="md">${names.map((name) => `<article class="sp-card"><div class="sp-card-header"><h2><a href="/${prefix}/${name}/">${titleOf(name)}</a></h2><p>${rows.filter((row) => row.component === name).length} examples · light and dark</p></div></article>`).join('')}</div>`,
  );
}

const ranks: Record<string, number> = { variants: 0, default: 1, states: 2 };
const exampleRank = (name: string) => ranks[name] ?? 3;

function preview(row: ExampleRow, native: boolean) {
  return `<section class="sp-stack"><h2 class="sp-page-section-title">${titleOf(row.name)}</h2><div class="sp-columns" data-columns="2" data-from="md">${[
    'light',
    'dark',
  ]
    .map((scheme) => {
      const url = `/preview.html?component=${row.component}&example=${row.name}&scheme=${scheme}&kind=${native ? 'native' : 'react'}`;
      return `<section class="sp-stack" data-size="sm"><p><strong>${titleOf(scheme)}</strong></p><iframe class="sp-card" data-padding="none" title="${row.component} ${row.name} ${scheme}" src="${url}" width="100%" height="200" loading="lazy"></iframe><a href="${url}">Open ${scheme} example</a></section>`;
    })
    .join('')}</div></section>`;
}

export function componentPage(
  root: string,
  rows: readonly ExampleRow[],
  native = false,
) {
  const first = rows[0];
  if (!first) throw new Error('A component needs examples');
  const name = first.component;
  const { text, imports, snippet } = componentSource(root, name, native);
  return page(
    titleOf(name),
    `<nav aria-label="Breadcrumb"><a href="/${native ? 'native/' : ''}">All ${native ? 'native elements' : 'components'}</a></nav>${code(imports)}${[
      ...rows,
    ]
      .sort((a, b) => exampleRank(a.name) - exampleRank(b.name))
      .map((row) => preview(row, native))
      .join(
        '',
      )}<details><summary>Component source</summary>${code(text)}</details><details><summary>Example source</summary>${code(readFileSync(join(root, first.file), 'utf8'))}</details><details><summary>HTML specimen source</summary>${code(snippet)}</details>`,
  );
}

function componentSource(root: string, name: string, native: boolean) {
  const source = native
    ? `elements/${name}.ts`
    : `components/${name}/${name}.tsx`;
  const runtime = existsSync(join(root, source));
  const text = readFileSync(
    join(root, runtime ? source : `components/${name}/${name}.css`),
    'utf8',
  );
  const exported = /export (?:function|const) (\w+)/.exec(text)?.[1] ?? name;
  const snippet = htmlSource(root, name);
  const path = native ? `elements/${name}` : name;
  const imports = [
    runtime
      ? `import { ${exported} } from "@kongmy-dev/sapphire-ui/${path}";`
      : '',
    existsSync(join(root, `components/${name}/${name}.css`))
      ? `import "@kongmy-dev/sapphire-ui/${name}.css";`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  return { text, imports, snippet };
}

function htmlSource(root: string, name: string) {
  const spec = join(root, `components/${name}/${name}.examples.html`);
  return existsSync(spec)
    ? readFileSync(spec, 'utf8')
    : 'This component owns browser behaviour. Use its typed entry and live examples.';
}
