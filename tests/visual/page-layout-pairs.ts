export type Case = {
  name: string;
  v3: string;
  v4: string;
  width?: number;
  holder?: string;
  scroll?: number;
  hover?: string;
  hoverPixels?: false;
  focus?: string;
};

export const NARROW = 500;
export const WIDE = 1280;

const SIZES = ['sm', 'md', 'lg', 'xl', '7xl', 'full'] as const;
type Size = (typeof SIZES)[number];
const MAX: Record<Size, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '7xl': '80rem',
  full: '100%',
};
const PADDINGS = ['default', 'lg', 'none'] as const;
type Padding = (typeof PADDINGS)[number];

const cells = (count: number) =>
  Array.from({ length: count }, () => '<div class="pl-cell"></div>').join('');
const chips = (count: number) =>
  Array.from({ length: count }, () => '<span class="pl-chip"></span>').join('');
const row = (items: readonly string[]) =>
  `<div style="display:flex;gap:32px;align-items:flex-start">${items.join('')}</div>`;
const column = (items: readonly string[]) =>
  `<div style="display:flex;flex-direction:column;gap:24px">${items.join('')}</div>`;

const STACK_SIZES = [
  ['', 'stack'],
  ['sm', 'stack stack-sm'],
  ['lg', 'stack stack-lg'],
  ['xl', 'stack stack-xl'],
] as const;

const stackCase: Case = {
  name: 'stack',
  v3: row([
    ...STACK_SIZES.map(
      ([, classes]) =>
        `<div class="${classes}" style="width:100px">${cells(3)}</div>`,
    ),
    `<div class="stack" style="width:100px;--stack-gap:2rem">${cells(3)}</div>`,
  ]),
  v4: row([
    ...STACK_SIZES.map(
      ([size]) =>
        `<div class="sp-stack"${size === '' ? '' : ` data-size="${size}"`} style="width:100px">${cells(3)}</div>`,
    ),
    `<div class="sp-stack" style="width:100px;--sp-stack-gap:2rem">${cells(3)}</div>`,
  ]),
};

const clusterCase: Case = {
  name: 'cluster',
  v3: column([
    `<div class="cluster" style="width:260px">${chips(7)}</div>`,
    `<div class="cluster" style="width:260px;--cluster-justify:flex-end">${chips(7)}</div>`,
    `<div class="cluster" style="width:260px;--cluster-gap:1.5rem">${chips(7)}</div>`,
  ]),
  v4: column([
    `<div class="sp-cluster" style="width:260px">${chips(7)}</div>`,
    `<div class="sp-cluster" style="width:260px;--sp-cluster-justify:flex-end">${chips(7)}</div>`,
    `<div class="sp-cluster" style="width:260px;--sp-cluster-gap:1.5rem">${chips(7)}</div>`,
  ]),
};

const columnsCase: Case = {
  name: 'columns',
  v3: column([
    `<div class="cols-2">${cells(4)}</div>`,
    `<div class="cols-3">${cells(6)}</div>`,
  ]),
  v4: column([
    `<div class="sp-columns" data-columns="2">${cells(4)}</div>`,
    `<div class="sp-columns" data-columns="3">${cells(6)}</div>`,
  ]),
};

const BREAKPOINTS = [
  { from: 'md', edge: 768, counts: [2, 3] },
  { from: 'lg', edge: 1024, counts: [2, 3, 4] },
] as const;
const COLUMN_GAP: Record<number, string> = {
  2: '24px',
  3: '16px',
  4: '16px',
};

const fromCases = (): Case[] =>
  BREAKPOINTS.flatMap(({ from, edge, counts }) =>
    counts.flatMap((count) =>
      [edge - 1, edge].map((size) => ({
        name: `columns-from/${from}-${count}/${size}`,
        v3: `<div class="cq" style="width:${size}px"><div class="cq-${from}:cols-${count}" style="display:grid;gap:${COLUMN_GAP[count]}">${cells(count)}</div></div>`,
        v4: `<div class="sp-cq" style="width:${size}px"><div class="sp-columns" data-columns="${count}" data-from="${from}">${cells(count)}</div></div>`,
      })),
    ),
  );

const pageCase: Case = {
  name: 'page-masthead',
  v3: '<div class="page"><div class="masthead"><h2 class="pl-text">Quarterly review</h2><p class="pl-text">Opens a page.</p></div><p class="pl-text">Body copy.</p></div>',
  v4: '<div class="sp-page"><div class="sp-masthead"><h2 class="pl-text">Quarterly review</h2><p class="pl-text">Opens a page.</p></div><p class="pl-text">Body copy.</p></div>',
};

const srOnlyCase: Case = {
  name: 'sr-only',
  focus: '.pl-focus',
  v3: '<div style="position:relative;width:200px;height:48px;border:1px solid #888"><span class="visually-hidden">Hidden</span><span class="sr-only">Hidden</span><a href="#x" class="visually-hidden-focusable pl-focus">Skip</a></div>',
  v4: '<div style="position:relative;width:200px;height:48px;border:1px solid #888"><span class="sp-sr-only">Hidden</span><span class="sp-sr-only">Hidden</span><a href="#x" class="sp-sr-only-focusable pl-focus">Skip</a></div>',
};

const v3Container = (size: Size, padding: Padding) => {
  const spacing = {
    default: 'px-4 py-8 sm:px-6 md:py-12',
    lg: 'px-6 py-16 sm:px-8 md:py-24',
    none: '',
  }[padding];
  return `<div class="mx-auto w-full font-sans ${spacing}" style="max-width:${MAX[size]};background:#e5e7eb">${cells(1)}</div>`;
};

const v4Container = (size: Size, padding: Padding) =>
  `<div class="sp-container"${size === '7xl' ? '' : ` data-size="${size}"`}${padding === 'default' ? '' : ` data-padding="${padding}"`} style="background:#e5e7eb">${cells(1)}</div>`;

const containerCases = (): Case[] =>
  PADDINGS.flatMap((padding) =>
    [WIDE, NARROW].map((width) => ({
      name: `container/${padding}/${width}`,
      width,
      v3: SIZES.map((size) => v3Container(size, padding)).join(''),
      v4: SIZES.map((size) => v4Container(size, padding)).join(''),
    })),
  );

const HEADING = 'What we build';
const DESCRIPTION =
  'Cloud infrastructure, AI/ML pipelines, and custom software for growing businesses.';

const v3Section = (size: Size, header: boolean) =>
  `<section class="mx-auto w-full px-6 py-16 md:py-24" style="max-width:${MAX[size]};background:#e5e7eb">${
    header
      ? `<div class="mb-10 md:mb-14"><span class="mb-3 block font-bold font-mono text-accent text-xs uppercase tracking-widest pl-brand-text">01 — Services</span><h2 class="m-0 font-bold font-serif text-(--color-text-strong) text-[clamp(1.5rem,3vw,2.5rem)] leading-tight">${HEADING}</h2><p class="m-0 mt-3 max-w-[640px] font-sans text-base/relaxed text-text-muted md:text-lg">${DESCRIPTION}</p></div>`
      : ''
  }${cells(1)}</section>`;

const v4Section = (size: Size, header: boolean) =>
  `<section class="sp-page-section"${size === '7xl' ? '' : ` data-size="${size}"`} style="background:#e5e7eb">${
    header
      ? `<div class="sp-page-section-header"><span class="sp-page-section-label">01 — Services</span><h2 class="sp-page-section-title">${HEADING}</h2><p class="sp-page-section-description">${DESCRIPTION}</p></div>`
      : ''
  }${cells(1)}</section>`;

const sectionCases = (): Case[] =>
  [WIDE, NARROW].flatMap((width) => [
    {
      name: `page-section/header/${width}`,
      width,
      v3: SIZES.map((size) => v3Section(size, true)).join(''),
      v4: SIZES.map((size) => v4Section(size, true)).join(''),
    },
    {
      name: `page-section/bare/${width}`,
      width,
      v3: v3Section('md', false),
      v4: v4Section('md', false),
    },
  ]);

type Variant = 'dark' | 'light';
const LINKS = ['Home', 'Services', 'Blog'] as const;

const V3_HEADER_SKIN: Record<Variant, string> = {
  dark: 'border-border-dark bg-primary text-text-on-dark',
  light: 'border-border bg-(--color-card-bg) text-(--color-text-strong)',
};

const v3HeaderLink = (variant: Variant, label: string, active: boolean) => {
  const skin = {
    dark: active
      ? 'bg-accent/10 text-accent'
      : 'text-text-on-dark-muted hover:bg-white/6 hover:text-text-on-dark',
    light: active
      ? 'bg-surface text-(--color-text-strong)'
      : 'text-text-muted hover:bg-surface hover:text-(--color-text-strong)',
  }[variant];
  const marker = active ? '' : ' pl-hover';
  return `<a class="rounded-btn px-3 py-2 font-medium font-sans text-sm no-underline transition-colors ${skin}${marker}" href="#">${label}</a>`;
};

const v3Header = (variant: Variant, sticky: boolean, nav: boolean) =>
  `<header class="z-40 w-full border-b ${sticky ? 'sticky top-0 ' : ''}${V3_HEADER_SKIN[variant]}"><div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6"><div class="flex shrink-0 items-center gap-3"><span class="pl-brand">KONGMY</span><span class="pl-brand">dev</span></div>${
    nav
      ? `<nav class="hidden flex-1 items-center gap-1 md:flex">${LINKS.map((label, index) => v3HeaderLink(variant, label, index === 0)).join('')}</nav><div class="flex shrink-0 items-center gap-3"><span class="pl-chip"></span></div>`
      : ''
  }</div></header>`;

const v4Header = (variant: Variant, sticky: boolean, nav: boolean) =>
  `<header class="sp-site-header"${variant === 'light' ? ' data-variant="light"' : ''}${sticky ? ' data-sticky' : ''}><div class="sp-site-header-inner"><div class="sp-site-header-brand"><span class="pl-brand">KONGMY</span><span class="pl-brand">dev</span></div>${
    nav
      ? `<nav class="sp-site-header-nav">${LINKS.map((label, index) => `<a class="sp-site-header-link${index === 0 ? '' : ' pl-hover'}" href="#"${index === 0 ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav><div class="sp-site-header-actions"><span class="pl-chip"></span></div>`
      : ''
  }</div></header>`;

const FILLER = '<div style="height:600px" class="pl-cell"></div>';
const STICKY_HOLDER = 'height:200px;overflow:auto';

const headerCases = (): Case[] => [
  ...(['dark', 'light'] as const).flatMap((variant) =>
    [WIDE, NARROW].map((width) => ({
      name: `site-header/${variant}/${width}`,
      width,
      ...(width === WIDE ? { hover: '.pl-hover' } : {}),
      ...(width === WIDE && variant === 'light'
        ? { hoverPixels: false as const }
        : {}),
      v3: v3Header(variant, false, true),
      v4: v4Header(variant, false, true),
    })),
  ),
  {
    name: 'site-header/brand-only',
    v3: v3Header('dark', false, false),
    v4: v4Header('dark', false, false),
  },
  ...(['dark', 'light'] as const).map((variant) => ({
    name: `site-header/sticky/${variant}`,
    holder: STICKY_HOLDER,
    scroll: 120,
    v3: `${v3Header(variant, true, true)}${FILLER}`,
    v4: `${v4Header(variant, true, true)}${FILLER}`,
  })),
];

const GROUPS = [
  ['Products', ['CloudCost', 'Web Toolbox', 'Sapphire UI']],
  ['Legal', ['Privacy Policy', 'Terms of Service']],
] as const;

const V3_FOOTER_SKIN: Record<Variant, string> = {
  dark: 'border-border-dark bg-primary text-text-on-dark',
  light: 'border-border bg-(--color-card-bg) text-text-main',
};
const V3_BOTTOM_SKIN: Record<Variant, string> = {
  dark: 'border-border-dark text-text-on-dark-muted',
  light: 'border-border text-text-muted',
};
const V3_FOOTER_LINK: Record<Variant, string> = {
  dark: 'text-text-on-dark-muted hover:text-text-on-dark',
  light: 'text-text-muted hover:text-(--color-text-strong)',
};

const BRAND =
  '<span class="pl-brand">KONGMY</span><p class="pl-text">Helping businesses cut costs and automate operations.</p>';
const BOTTOM = '<span>© 2024 KONGMY</span><span>Built with Sapphire UI</span>';

const v3Footer = (variant: Variant, main: boolean) =>
  `<footer class="w-full border-t ${V3_FOOTER_SKIN[variant]}"><div class="mx-auto max-w-7xl px-6 py-12 md:py-16">${
    main
      ? `<div class="mb-10 flex flex-col gap-10 md:flex-row md:gap-16"><div class="shrink-0 md:max-w-xs"><div>${BRAND}</div></div><div class="flex flex-1 flex-wrap gap-10 md:gap-16">${GROUPS.map(
          ([title, links]) =>
            `<div class="flex flex-col gap-3"><span class="font-bold font-mono text-accent text-xs uppercase tracking-widest${variant === 'light' ? ' pl-brand-text' : ''}">${title}</span><div class="flex flex-col gap-2">${links
              .map(
                (label, index) =>
                  `<a class="font-sans text-sm no-underline transition-colors ${V3_FOOTER_LINK[variant]}${index === 0 ? ' pl-hover' : ''}" href="#">${label}</a>`,
              )
              .join('')}</div></div>`,
        ).join('')}</div></div>`
      : ''
  }<div class="flex flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.06em] md:flex-row${main ? ' border-t pt-6' : ''} ${V3_BOTTOM_SKIN[variant]}">${BOTTOM}</div></div></footer>`;

const v4Footer = (variant: Variant, main: boolean) =>
  `<footer class="sp-site-footer"${variant === 'light' ? ' data-variant="light"' : ''}><div class="sp-site-footer-inner">${
    main
      ? `<div class="sp-site-footer-grid"><div class="sp-site-footer-brand"><div>${BRAND}</div></div><div class="sp-site-footer-links">${GROUPS.map(
          ([title, links]) =>
            `<div class="sp-site-footer-group"><span class="sp-site-footer-group-title">${title}</span><div class="sp-site-footer-group-list">${links
              .map(
                (label, index) =>
                  `<a class="sp-site-footer-link${index === 0 ? ' pl-hover' : ''}" href="#">${label}</a>`,
              )
              .join('')}</div></div>`,
        ).join('')}</div></div>`
      : ''
  }<div class="sp-site-footer-bottom">${BOTTOM}</div></div></footer>`;

const footerCases = (): Case[] => [
  ...(['dark', 'light'] as const).flatMap((variant) =>
    [WIDE, NARROW].map((width) => ({
      name: `site-footer/${variant}/${width}`,
      width,
      hover: '.pl-hover',
      v3: v3Footer(variant, true),
      v4: v4Footer(variant, true),
    })),
  ),
  {
    name: 'site-footer/bottom-only',
    v3: v3Footer('dark', false),
    v4: v4Footer('dark', false),
  },
];

const LAYOUT_HEIGHT = '240px';
const SIDEBAR = '<span class="pl-brand">Sidebar</span>';

const layoutCases = (): Case[] => [
  {
    name: 'layout/shell',
    v3: `<div class="flex min-h-screen flex-col bg-surface" style="min-height:${LAYOUT_HEIGHT}">${v3Header('dark', false, true)}<div class="flex min-h-0 flex-1 flex-col"><main class="min-w-0 flex-1">${cells(1)}</main></div>${v3Footer('dark', false)}</div>`,
    v4: `<div class="sp-layout" style="--sp-layout-min-height:${LAYOUT_HEIGHT}">${v4Header('dark', false, true)}<div class="sp-layout-body"><div class="sp-layout-main">${cells(1)}</div></div>${v4Footer('dark', false)}</div>`,
  },
  {
    name: 'layout/sidebar',
    v3: `<div class="flex min-h-screen flex-col bg-surface" style="min-height:${LAYOUT_HEIGHT}"><div class="flex min-h-0 flex-1"><aside class="sidebar" style="height:${LAYOUT_HEIGHT}">${SIDEBAR}</aside><main class="min-w-0 flex-1">${cells(1)}</main></div></div>`,
    v4: `<div class="sp-layout" style="--sp-layout-min-height:${LAYOUT_HEIGHT}"><div class="sp-layout-body" data-sidebar><aside class="sp-layout-sidebar" style="--sp-layout-sidebar-height:${LAYOUT_HEIGHT}">${SIDEBAR}</aside><div class="sp-layout-main">${cells(1)}</div></div></div>`,
  },
];

export const CASES: readonly Case[] = [
  stackCase,
  clusterCase,
  columnsCase,
  ...fromCases(),
  pageCase,
  srOnlyCase,
  ...containerCases(),
  ...sectionCases(),
  ...headerCases(),
  ...footerCases(),
  ...layoutCases(),
];

export const THEME_TOGGLE_V4 =
  '<button class="sp-theme-toggle" type="button" aria-label="Switch to dark theme"><span class="sp-theme-toggle-icon" aria-hidden="true"></span></button>';

export const SHARED_CSS = `
#parity .pl-cell { box-sizing: border-box; height: 40px; border: 1px solid #3b82f6; background: #dbeafe; }
#parity .pl-chip { display: inline-block; box-sizing: border-box; width: 56px; height: 24px; border: 1px solid #888; background: #eee; }
#parity .pl-brand { font: 700 18px/28px sans-serif; }
#parity .pl-text { margin: 0; font: 14px/20px sans-serif; }
#parity a { color: #00f; }
#parity a:focus-visible { outline: 2px solid #f0f !important; outline-offset: 0 !important; box-shadow: none !important; }
`;
