import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { THEME_INIT_SCRIPT } from '../../lib/theme';
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

const searchDialog = `<dialog id="docs-search-dialog" class="docs-search-dialog sp-command-palette" aria-labelledby="docs-search-title"><h2 id="docs-search-title" class="sp-command-palette-title">Search documentation</h2><div class="docs-search-header"><input class="sp-input" type="search" role="combobox" aria-label="Search documentation" aria-controls="docs-search-results" aria-autocomplete="list" aria-expanded="true" placeholder="Search components and guides…" autocomplete="off"><button type="button" class="docs-search-close" aria-label="Close search">Esc</button></div><div class="sp-command-palette-body"><p class="sp-command-palette-empty" role="status" hidden>No matching pages.</p><ul id="docs-search-results" class="sp-command-palette-list" role="listbox" aria-label="Documentation results"></ul></div><footer class="sp-command-palette-footer"><span>↑ ↓ navigate</span><span>↵ open</span><span>Esc close</span></footer></dialog>`;

export function page(title: string, body: string, navigation = '') {
  const brand = '<a class="docs-brand" href="/">Sapphire <span>UI</span></a>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Sapphire UI: navy and gold components for React and native HTML."><title>${escapeHtml(title)} · Sapphire UI</title><script>${THEME_INIT_SCRIPT}</script><link rel="stylesheet" href="/assets/sapphire.css"><link rel="stylesheet" href="/assets/docs.css"></head><body class="docs-site"><a class="sp-sr-only-focusable" href="#main">Skip to content</a><header class="docs-mobile-bar">${brand}<button type="button" class="docs-menu" aria-label="Open navigation" aria-controls="docs-sidebar" aria-expanded="false"><svg class="sp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button></header><aside id="docs-sidebar" class="docs-sidebar">${brand}<p class="docs-version">v4.0.0 · Design system</p><button type="button" class="docs-search" aria-label="Search documentation" aria-haspopup="dialog" aria-controls="docs-search-dialog"><span>Search documentation…</span><kbd aria-hidden="true">⌘K</kbd></button>${navigation}<div class="docs-sidebar-bottom"><button type="button" class="docs-theme" aria-label="Switch to dark theme">Theme: light</button><a class="docs-sidebar-footer" href="https://kongmy.dev">KONGMY.DEV ↗</a></div></aside><button class="docs-nav-backdrop" tabindex="-1" aria-label="Close navigation overlay"></button><main id="main" class="docs-main sp-cq" tabindex="-1"><header class="docs-page-header"><h1>${escapeHtml(title)}</h1></header><div class="docs-content">${body}</div><footer class="docs-footer">Sapphire UI · KONGMY Digital Solutions</footer></main>${searchDialog}<script type="module" src="/assets/site-client.js"></script></body></html>`;
}

export function catalogPage(
  rows: readonly ExampleRow[],
  native = false,
  navigation = '',
) {
  const names = [...new Set(rows.map((row) => row.component))];
  const prefix = native ? 'native' : 'components';
  return page(
    native ? 'Native elements' : 'Sapphire UI',
    `<p>Editorial character. Practical controls. Use the package, plain HTML or source you own.</p>${code('bun add @kongmy-dev/sapphire-ui')}<p>Import foundations once, then the stylesheet for each component you use. Install React only for React components and behaviour peers only where required.</p>${code('import "@kongmy-dev/sapphire-ui/foundations.css";\nimport "@kongmy-dev/sapphire-ui/button.css";\nimport { Button } from "@kongmy-dev/sapphire-ui/button";')}<div class="docs-catalog sp-columns" data-columns="3" data-from="md">${names.map((name) => `<article class="sp-card"><div class="sp-card-header"><h2><a href="/${prefix}/${name}/">${titleOf(name)}</a></h2><p>${rows.filter((row) => row.component === name).length} examples · light and dark</p></div></article>`).join('')}</div>`,
    navigation,
  );
}

const ranks: Record<string, number> = { variants: 0, default: 1, states: 2 };
const exampleRank = (name: string) => ranks[name] ?? 3;

function preview(row: ExampleRow, native: boolean) {
  return `<section class="docs-example"><h2>${titleOf(row.name)}</h2><div class="docs-preview-columns sp-columns" data-columns="2" data-from="md">${[
    'light',
    'dark',
  ]
    .map((scheme) => {
      const url = `/preview.html?component=${row.component}&example=${row.name}&scheme=${scheme}&kind=${native ? 'native' : 'react'}`;
      return `<section class="docs-preview"><p><strong>${titleOf(scheme)}</strong></p><iframe title="${row.component} ${row.name} ${scheme}" src="${url}" width="100%" height="160" loading="lazy"></iframe><a href="${url}">Open ${scheme} example</a></section>`;
    })
    .join('')}</div></section>`;
}

export function componentPage(
  root: string,
  rows: readonly ExampleRow[],
  native = false,
  navigation = '',
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
    navigation,
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
