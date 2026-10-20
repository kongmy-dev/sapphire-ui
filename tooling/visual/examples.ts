import { readExamples } from '../examples/catalog';

export type RouteExamples = {
  name: string;
  path: string;
  pinned: readonly string[];
  skipped: Readonly<Record<string, string>>;
};

const PROPS = 'prop table: API documentation, not a component demo';
const HOOK = 'hook demo: live state and timers, not a look';
const OVERVIEW = 'documentation prose and code samples, not a component demo';
const COLORS = 'colour swatches: tokens are checked by the token tests';

export const slugOf = (heading: string): string =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const ROUTES: readonly RouteExamples[] = [
  {
    name: 'overview',
    path: '/',
    pinned: [],
    skipped: {
      architecture: OVERVIEW,
      catalog: OVERVIEW,
      'quick-start': OVERVIEW,
      'theming-customization': OVERVIEW,
    },
  },
  {
    name: 'colors',
    path: '/colors',
    pinned: [],
    skipped: { 'brand-colors': COLORS, 'status-colors': COLORS },
  },
  {
    name: 'typography',
    path: '/typography',
    pinned: ['font-families', 'type-scale'],
    skipped: {},
  },
  {
    name: 'buttons',
    path: '/buttons',
    pinned: [
      'variants',
      'sizes',
      'with-icon',
      'states',
      'as-link-aschild',
      'icon-mark',
    ],
    skipped: { props: PROPS },
  },
  {
    name: 'cards',
    path: '/cards',
    pinned: ['default-card', 'dark-card', 'bordered-card', 'dashed-card'],
    skipped: { props: PROPS },
  },
  {
    name: 'forms',
    path: '/forms',
    pinned: [
      'input',
      'textarea',
      'checkbox',
      'switch',
      'range-slider',
      'native-select',
      'select-radix',
      'radio-group',
      'form-field-composition',
    ],
    skipped: { props: PROPS },
  },
  {
    name: 'feedback',
    path: '/feedback',
    pinned: [
      'skeleton',
      'spinner',
      'progress',
      'segmented-bar',
      'alert',
      'toast',
      'empty-state',
    ],
    skipped: { props: PROPS },
  },
  {
    name: 'data',
    path: '/data',
    pinned: [
      'badge',
      'avatar',
      'avatar-group',
      'stat',
      'chip',
      'pagination',
      'tabs',
      'table',
      'separator',
      'barchart',
      'sparkline',
      'progress',
    ],
    skipped: { props: PROPS },
  },
  {
    name: 'interactive',
    path: '/interactive',
    pinned: [
      'dialog',
      'toast',
      'sheet-side-drawer',
      'popover',
      'tooltip',
      'hover-card',
      'dropdown-menu',
    ],
    skipped: { props: PROPS },
  },
  {
    name: 'extended',
    path: '/extended',
    pinned: [
      'breadcrumb',
      'kbd',
      'code-block',
      'toggle',
      'scroll-area',
      'banner',
      'accordion',
      'editorial-complex-primitives',
    ],
    skipped: { props: PROPS },
  },
  {
    name: 'layouts',
    path: '/layouts',
    pinned: [
      'admin-layout',
      'pagesection',
      'layout',
      'siteheader',
      'sitefooter',
      'split-layout-draggable',
      'wizard-layout',
      'container-layout',
      'vertical-tabs-layout',
    ],
    skipped: { props: PROPS },
  },
  {
    name: 'elements',
    path: '/elements',
    pinned: [
      'custom-elements-astro-vanilla-html',
      'toast-banner-cookie-banner',
      'seo-head',
    ],
    skipped: {},
  },
  {
    name: 'hooks',
    path: '/hooks',
    pinned: ['css-utilities'],
    skipped: {
      usedebounce: HOOK,
      uselocalstorage: HOOK,
      usecopytoclipboard: HOOK,
      useonclickoutside: HOOK,
      usemediaquery: HOOK,
      useisomorphiclayouteffect: HOOK,
      reference: PROPS,
    },
  },
];

export const exampleNames = (): string[] => [
  ...readExamples(process.cwd()).flatMap((row) => {
    const name = `react/${row.component}/${row.name}`;
    return row.component === 'dialog' ? [name, `${name}/open`] : [name];
  }),
  ...ROUTES.flatMap((route) =>
    route.pinned.map((slug) => `${route.name}/${slug}`),
  ),
];
