import { THEME_INIT_SCRIPT } from '../../lib/theme';
import type { ExampleRow } from '../examples/catalog';
import { cssReference, nativeReference, reactReference } from './api';
import { code, escapeHtml, titleOf } from './html';
import { componentGroups } from './navigation';
import type { ComponentReference } from './props';
import { componentSetup } from './setup';

const searchDialog = `<dialog id="docs-search-dialog" class="docs-search-dialog sp-command-palette" aria-labelledby="docs-search-title"><h2 id="docs-search-title" class="sp-command-palette-title">Search documentation</h2><div class="docs-search-header"><input class="sp-input" type="search" role="combobox" aria-label="Search documentation" aria-controls="docs-search-results" aria-autocomplete="list" aria-expanded="true" placeholder="Search components and guides…" autocomplete="off"><button type="button" class="docs-search-close" aria-label="Close search">Esc</button></div><div class="sp-command-palette-body"><p class="sp-command-palette-empty" role="status" hidden>No matching pages.</p><ul id="docs-search-results" class="sp-command-palette-list" role="listbox" aria-label="Documentation results"></ul></div><footer class="sp-command-palette-footer"><span>↑ ↓ navigate</span><span>↵ open</span><span>Esc close</span></footer></dialog>`;

export function page(title: string, body: string, navigation = '') {
  const brand = '<a class="docs-brand" href="/">Sapphire <span>UI</span></a>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Sapphire UI: navy and gold components for React and native HTML."><title>${escapeHtml(title)} · Sapphire UI</title><script>${THEME_INIT_SCRIPT}</script><link rel="stylesheet" href="/assets/sapphire.css"><link rel="stylesheet" href="/assets/docs.css"><link rel="stylesheet" href="/assets/reference.css"></head><body class="docs-site"><a class="sp-sr-only-focusable" href="#main">Skip to content</a><header class="docs-mobile-bar" data-theme="dark">${brand}<button type="button" class="docs-menu" aria-label="Open navigation" aria-controls="docs-sidebar" aria-expanded="false"><svg class="sp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button></header><aside id="docs-sidebar" class="docs-sidebar" data-theme="dark">${brand}<p class="docs-version">v4.0.0 · Design system</p><button type="button" class="docs-search" aria-label="Search documentation" aria-haspopup="dialog" aria-controls="docs-search-dialog"><span>Search documentation…</span><kbd aria-hidden="true">⌘K</kbd></button>${navigation}<div class="docs-sidebar-bottom"><button type="button" class="docs-theme" aria-label="Switch to dark theme">Theme: light</button><a class="docs-sidebar-footer" href="https://kongmy.dev">KONGMY.DEV ↗</a></div></aside><button class="docs-nav-backdrop" tabindex="-1" aria-label="Close navigation overlay"></button><main id="main" class="docs-main sp-cq" tabindex="-1"><header class="docs-page-header"><h1>${escapeHtml(title)}</h1></header><div class="docs-content">${body}</div><footer class="docs-footer">Sapphire UI · KONGMY Digital Solutions</footer></main>${searchDialog}<script type="module" src="/assets/site-client.js"></script></body></html>`;
}

const architecture = [
  [
    'CSS design system',
    'Tokens, typography and shared component styles. Use plain HTML or your preferred framework.',
    'import "@kongmy-dev/sapphire-ui/foundations.css";\nimport "@kongmy-dev/sapphire-ui/button.css";',
    '/foundations/',
    'Set up styles',
  ],
  [
    'Native elements',
    'Browser behaviour for site chrome, announcements and consent. Register only the elements you need.',
    'import "@kongmy-dev/sapphire-ui/elements/banner";\nimport "@kongmy-dev/sapphire-ui/banner.css";',
    '/native/',
    'Explore native elements',
  ],
  [
    'React components',
    'Typed component entries with the same CSS contract. Install behaviour peers only where required.',
    'import { Button } from "@kongmy-dev/sapphire-ui/button";',
    '#catalogue',
    'Explore the catalogue',
  ],
] as const;

function catalogue(rows: readonly ExampleRow[], native: boolean) {
  const names = [...new Set(rows.map((row) => row.component))];
  if (native)
    return names
      .map(
        (name) =>
          `<article class="sp-card sp-stack"><h3><a href="/native/${name}/">${titleOf(name)}</a></h3><p>${rows.filter((row) => row.component === name).length} live examples</p></article>`,
      )
      .join('');
  const grouped = new Set<string>(
    componentGroups.flatMap(([, items]) => [...items]),
  );
  return [
    ...componentGroups,
    ['Utilities', names.filter((name) => !grouped.has(name))] as const,
  ]
    .map(([title, items]) => ({
      title,
      items: items.filter((name) => names.includes(name)),
    }))
    .filter(({ items }) => items.length)
    .map(
      ({ title, items }) =>
        `<article class="sp-card sp-stack"><h3>${title}</h3><ul class="docs-component-links">${items.map((name) => `<li><a href="/components/${name}/">${titleOf(name)}</a></li>`).join('')}</ul></article>`,
    )
    .join('');
}

export function catalogPage(
  rows: readonly ExampleRow[],
  native = false,
  navigation = '',
) {
  const intro = native
    ? '<p class="docs-lead">Native browser behaviour. Shared Sapphire styles. Use custom elements in plain HTML or any framework.</p>'
    : `<p class="docs-lead">A design system with editorial character and practical controls. Navy and gold, shared CSS, typed React components and native elements.</p><section class="docs-section"><h2>Design foundations</h2><div class="docs-feature-grid"><a class="docs-feature" href="/colors/"><span class="docs-feature-palette" aria-hidden="true"></span><h3>Colors</h3><p>Brand, surfaces and status. Light and dark values together.</p></a><a class="docs-feature" href="/typography/"><span class="docs-feature-type" aria-hidden="true">Aa</span><h3>Typography</h3><p>Three font families, the full type scale and reading rhythm.</p></a><a class="docs-feature" href="/spacing/"><span class="docs-feature-space" aria-hidden="true"></span><h3>Spacing &amp; shape</h3><p>The 4px grid, control density, corners and elevation.</p></a></div></section><section class="docs-section"><h2>Architecture</h2><div class="sp-stack">${architecture.map(([title, description, source, href, label], index) => `<article class="sp-card sp-stack"><h3><span class="docs-layer">0${index + 1}</span>${title}</h3><p>${description}</p>${code(source)}<a href="${href}">${label} →</a></article>`).join('')}</div></section>`;
  return page(
    native ? 'Native elements' : 'Sapphire UI',
    `${intro}<section class="docs-section" id="quick-start"><h2>Quick start</h2>${code('bun add @kongmy-dev/sapphire-ui')}<p>Load foundations once, then the styles and entry points on each component page. <a href="/foundations/">Read the setup guide →</a></p></section><section class="docs-section" id="catalogue"><h2>${native ? 'Custom elements' : 'Component catalogue'}</h2><p>Choose a component for setup, live light and dark examples, and supported props.</p><div class="docs-catalog sp-columns" data-columns="2" data-from="md">${catalogue(rows, native)}</div></section>`,
    navigation,
  );
}

const ranks: Record<string, number> = { variants: 0, default: 1, states: 2 };
const exampleRank = (name: string) => ranks[name] ?? 3;

function componentApi(
  root: string,
  name: string,
  native: boolean,
  reference: ComponentReference,
) {
  if (native)
    return {
      title: 'Attributes, methods and events',
      body: nativeReference(root, name),
    };
  if (reference.length)
    return { title: 'Props', body: reactReference(reference) };
  return { title: 'HTML API', body: cssReference(root, name) };
}

function preview(row: ExampleRow, native: boolean) {
  return `<section class="docs-example" id="example-${row.name}"><h3>${titleOf(row.name)}</h3><div class="docs-preview-columns sp-columns" data-columns="2" data-from="md">${[
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
  reference: ComponentReference = [],
) {
  const first = rows[0];
  if (!first) throw new Error('A component needs examples');
  const name = first.component;
  const { title: apiTitle, body: api } = componentApi(
    root,
    name,
    native,
    reference,
  );
  const { imports, install } = componentSetup(root, name, native);
  return page(
    titleOf(name),
    `<p class="docs-lead">${native ? 'Native HTML' : 'Component'} · ${rows.length} live examples in both colour schemes.</p><nav class="docs-page-links sp-cluster" aria-label="On this page"><a href="#examples">Examples</a><a href="#props">${apiTitle}</a><a href="#setup">Setup</a><a href="/${native ? 'native/' : '#catalogue'}">All ${native ? 'native elements' : 'components'} →</a></nav><section class="docs-section" id="examples"><h2>Examples</h2>${[
      ...rows,
    ]
      .sort((a, b) => exampleRank(a.name) - exampleRank(b.name))
      .map((row) => preview(row, native))
      .join(
        '',
      )}</section><section class="docs-section" id="props"><h2>${apiTitle}</h2>${api}</section><section class="docs-section" id="setup"><h2>Setup</h2>${code(install)}<p>For an app using package components throughout, load the full stylesheet once. Add this ${native ? 'element registration' : 'component import'} where you use it.</p>${code(imports)}<p>Mixing package and vendored components? Follow <a href="/foundations/">application setup</a>.</p></section>`,
    navigation,
  );
}
