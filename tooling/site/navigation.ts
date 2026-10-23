import type { ExampleRow } from '../examples/catalog';

export const componentGroups = [
  ['Actions', ['button', 'toggle', 'chip', 'icon-mark']],
  [
    'Forms',
    [
      'input',
      'textarea',
      'label',
      'form-field',
      'form-section',
      'checkbox',
      'switch',
      'radio-group',
      'native-select',
      'select',
      'range-slider',
    ],
  ],
  [
    'Content',
    [
      'card',
      'avatar',
      'avatar-group',
      'badge',
      'code-block',
      'kbd',
      'prose',
      'document',
      'margin-note',
    ],
  ],
  [
    'Navigation',
    [
      'accordion',
      'breadcrumb',
      'command-palette',
      'dropdown-menu',
      'mobile-nav',
      'pagination',
      'steps',
      'tabs',
      'table-of-contents',
    ],
  ],
  [
    'Feedback',
    [
      'alert',
      'banner',
      'callout',
      'cookie-banner',
      'empty',
      'progress',
      'skeleton',
      'spinner',
      'toast',
      'tooltip',
    ],
  ],
  [
    'Data display',
    [
      'bar-chart',
      'key-value-list',
      'segmented-bar',
      'sparkline',
      'stat',
      'stat-group',
      'table',
      'timeline',
    ],
  ],
  ['Overlays', ['dialog', 'hover-card', 'popover', 'sheet']],
  [
    'Layouts',
    [
      'admin-layout',
      'container',
      'layout',
      'page-header',
      'page-section',
      'proposal-layout',
      'scroll-area',
      'separator',
      'site-footer',
      'site-header',
      'split-layout',
      'vertical-tabs-layout',
      'wizard-layout',
    ],
  ],
] as const;

const label = (name: string) =>
  name
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
function link(href: string, title: string, current: string) {
  return `<a class="docs-nav-link" href="${href}"${href === current ? ' aria-current="page"' : ''}>${title}</a>`;
}
function group(
  title: string,
  names: readonly string[],
  prefix: string,
  current: string,
) {
  if (!names.length) return '';
  const active = names.some((name) => current === `/${prefix}/${name}/`);
  return `<details class="docs-nav-group" data-active="${active}"${active ? ' open' : ''}><summary>${title}</summary><div class="docs-nav-items">${names.map((name) => link(`/${prefix}/${name}/`, label(name), current)).join('')}</div></details>`;
}

export function navigation(
  react: readonly ExampleRow[],
  native: readonly ExampleRow[],
  route: string,
) {
  const current = route ? `/${route}/` : '/';
  const names = [...new Set(react.map((row) => row.component))];
  const grouped = new Set<string>(
    componentGroups.flatMap(([, items]) => [...items]),
  );
  const start = [
    ['/', 'Overview'],
    ['/foundations/', 'Getting started'],
    ['/colors/', 'Colors'],
    ['/typography/', 'Typography'],
    ['/tokens/', 'Tokens & themes'],
    ['/spacing/', 'Spacing & shape'],
    ['/layout/', 'Layout primitives'],
    ['/prose/', 'Prose'],
    ['/hooks/', 'Hooks & utilities'],
  ];
  return `<nav aria-label="Documentation">${start.map(([href = '/', title = 'Overview']) => link(href, title, current)).join('')}<p class="docs-nav-label">Components</p>${componentGroups
    .map(([title, items]) =>
      group(
        title,
        items.filter((name) => names.includes(name)),
        'components',
        current,
      ),
    )
    .join('')}${group(
    'Utilities',
    names.filter((name) => !grouped.has(name)),
    'components',
    current,
  )}<p class="docs-nav-label">Native HTML</p>${link('/native/', 'Native elements', current)}${group('Custom elements', [...new Set(native.map((row) => row.component))], 'native', current)}</nav>`;
}
