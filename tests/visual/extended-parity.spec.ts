import { writeFile } from 'node:fs/promises';
import type { Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';

const V3_PAGE = '/extended';
const HOLDER = '#parity';
const AWAY = { x: 960, y: 700 };

const PROPERTIES = [
  'display',
  'position',
  'flex-direction',
  'flex-grow',
  'flex-shrink',
  'align-items',
  'justify-content',
  'gap',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'width',
  'height',
  'min-width',
  'top',
  'right',
  'bottom',
  'left',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'text-decoration-line',
  'text-underline-offset',
  'user-select',
  'touch-action',
  'overflow-x',
  'overflow-y',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'cursor',
  'opacity',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
] as const;
const OUTLINE = [
  'outline-style',
  'outline-width',
  'outline-offset',
  'outline-color',
] as const;

type Interaction = 'hover' | 'focus';
type Probes = Record<string, readonly [string, string]>;
type Action = { probe: string; interaction: Interaction };
type Pair = {
  name: string;
  v3: string;
  v4: string;
  probes: Probes;
  act: Action | undefined;
  outline?: boolean;
  antialiased?: boolean;
  ignore?: readonly string[];
  decided?: (v4: Observation) => string;
};
type Probe = {
  style: Record<string, string>;
  raw: Record<string, string>;
  box: string;
  rotation: number;
  focusVisible: boolean;
};
type Observation = {
  probes: Record<string, Probe>;
  box: string;
  pixels: Buffer;
};

const VARIANTS = ['default', 'outline', 'ghost'] as const;
const SIZES = ['sm', 'default', 'lg'] as const;
const TOGGLE_STATES = [
  'off',
  'on',
  'off-hover',
  'on-hover',
  'focus',
  'disabled',
] as const;
type ToggleVariant = (typeof VARIANTS)[number];
type ToggleSize = (typeof SIZES)[number];
type ToggleState = (typeof TOGGLE_STATES)[number];

const V3_TOGGLE_BASE =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 font-medium font-sans outline-none transition-colors focus-visible:ring-(--color-focus-ring) focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';
const V3_TOGGLE_VARIANT: Record<ToggleVariant, string> = {
  default:
    'border border-border bg-transparent text-text-main hover:bg-surface data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-text-on-dark',
  outline:
    'border border-border bg-transparent text-text-muted hover:text-text-main data-[state=on]:border-accent data-[state=on]:bg-accent data-[state=on]:text-primary',
  ghost:
    'border-none bg-transparent text-text-muted hover:bg-surface data-[state=on]:bg-surface data-[state=on]:text-text-main',
};
const V3_TOGGLE_SIZE: Record<ToggleSize, string> = {
  sm: 'h-8 rounded-btn px-2.5 text-xs',
  default: 'h-9 rounded-btn px-3 text-sm',
  lg: 'h-10 rounded-btn px-4 text-base',
};

const toggleData = (variant: ToggleVariant, size: ToggleSize) =>
  [
    variant === 'default' ? '' : ` data-variant="${variant}"`,
    size === 'default' ? '' : ` data-size="${size}"`,
  ].join('');

const toggleAct = (state: ToggleState): Action | undefined => {
  if (state === 'focus') return { probe: 'toggle', interaction: 'focus' };
  if (state.endsWith('hover')) return { probe: 'toggle', interaction: 'hover' };
  return undefined;
};

function togglePair(
  variant: ToggleVariant,
  size: ToggleSize,
  state: ToggleState,
): Pair {
  const on = state === 'on' || state === 'on-hover';
  const attributes = `type="button" aria-pressed="${on}" data-state="${on ? 'on' : 'off'}"${state === 'disabled' ? ' disabled' : ''}`;
  const classes = `${V3_TOGGLE_BASE} ${V3_TOGGLE_VARIANT[variant]} ${V3_TOGGLE_SIZE[size]}`;
  return {
    name: `toggle/${variant}/${size}/${state}`,
    v3: `<button class="${classes}" ${attributes}>Toggle</button>`,
    v4: `<button class="sp-toggle"${toggleData(variant, size)} ${attributes}>Toggle</button>`,
    probes: { toggle: ['button', 'button'] },
    act: toggleAct(state),
    antialiased: state === 'disabled',
  };
}

const V3_BREADCRUMB_LINK =
  'text-text-muted no-underline transition-colors hover:text-accent-text';
const breadcrumbPair = (name: string, hover: boolean): Pair => ({
  name,
  v3: `<nav aria-label="Breadcrumb" class="font-sans text-sm text-text-muted"><ol class="m-0 flex list-none flex-wrap items-center gap-1.5 p-0"><li class="inline-flex items-center"><a href="/" class="${V3_BREADCRUMB_LINK}">Home</a></li><li aria-hidden="true" class="inline-flex select-none items-center text-text-muted">/</li><li class="inline-flex items-center"><span aria-current="page" class="font-medium text-text-main">Tables</span></li></ol></nav>`,
  v4: '<nav class="sp-breadcrumb" aria-label="Breadcrumb"><ol class="sp-breadcrumb-list"><li class="sp-breadcrumb-item"><a class="sp-breadcrumb-link" href="/">Home</a></li><li class="sp-breadcrumb-separator" aria-hidden="true">/</li><li class="sp-breadcrumb-item"><span class="sp-breadcrumb-page" aria-current="page">Tables</span></li></ol></nav>',
  probes: {
    nav: ['nav', 'nav'],
    list: ['ol', 'ol'],
    link: ['a', 'a'],
    separator: ['li[aria-hidden]', 'li[aria-hidden]'],
    page: ['span[aria-current]', 'span[aria-current]'],
  },
  act: hover ? { probe: 'link', interaction: 'hover' } : undefined,
});

const CODE_VARIANTS = ['light', 'dark'] as const;
const CODE_STATES = [
  'rest',
  'block-hover',
  'copy-hover',
  'copy-focus',
  'copied',
] as const;
type CodeVariant = (typeof CODE_VARIANTS)[number];
type CodeState = (typeof CODE_STATES)[number];

const V3_CODE_PRE: Record<CodeVariant, string> = {
  light: 'border border-border bg-surface text-text-main',
  dark: 'bg-primary text-text-on-dark',
};
const V3_CODE_COPY: Record<CodeVariant, string> = {
  light:
    'border border-border bg-(--color-card-bg) text-text-muted hover:bg-surface',
  dark: 'border-none bg-white/10 text-text-on-dark hover:bg-white/20',
};
const CODE = 'const answer = 42;';

function codePair(variant: CodeVariant, state: CodeState): Pair {
  const copied = state === 'copied';
  const label = copied ? 'Copied!' : 'Copy';
  const aria = copied ? 'Copied' : 'Copy code to clipboard';
  const act: Record<CodeState, Action | undefined> = {
    rest: undefined,
    'block-hover': { probe: 'pre', interaction: 'hover' },
    'copy-hover': { probe: 'copy', interaction: 'hover' },
    'copy-focus': { probe: 'copy', interaction: 'focus' },
    copied: { probe: 'copy', interaction: 'hover' },
  };
  return {
    name: `code-block/${variant}/${state}`,
    v3: `<div class="group relative"><pre data-lang="ts" class="m-0 overflow-x-auto font-mono text-[13px] leading-relaxed rounded-sm p-4 ${V3_CODE_PRE[variant]}"><code>${CODE}</code></pre><button type="button" aria-label="${aria}" class="absolute top-2 right-2 inline-flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 font-mono text-xs transition-opacity opacity-0 focus-visible:opacity-100 group-hover:opacity-100 ${V3_CODE_COPY[variant]} focus-visible:outline-none focus-visible:ring-(--color-focus-ring) focus-visible:ring-2">${label}</button></div>`,
    v4: `<div class="sp-code-block"${variant === 'dark' ? ' data-variant="dark"' : ''}><pre class="sp-code-block-pre" data-lang="ts"><code>${CODE}</code></pre><button class="sp-code-block-copy" type="button" aria-label="${aria}">${label}</button></div>`,
    probes: {
      pre: ['pre', 'pre'],
      code: ['code', 'code'],
      copy: ['button', 'button'],
    },
    act: act[state],
  };
}

const DISMISS_SVG =
  '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>';
const V3_RESTORE =
  '<button type="button" class="inline-flex cursor-pointer select-none items-center justify-center gap-2 font-sans font-semibold no-underline outline-none transition-all focus-visible:ring-(--color-focus-ring) focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 border-none bg-transparent p-0 text-accent-text underline-offset-4 hover:text-(--color-text-strong) hover:underline px-3 py-1.5 text-[13px]">Restore</button>';
const V4_RESTORE =
  '<button class="sp-button" type="button" data-variant="link" data-size="sm" style="--sp-button-line-height: var(--sp-banner-line-height)">Restore</button>';

type BannerRow = readonly [string, string, string, boolean];
const BANNERS: readonly BannerRow[] = [
  ['info', 'info', 'Heads up — this is an informational banner.', false],
  ['success', 'success', 'Your changes were saved successfully.', false],
  [
    'warning',
    'warning',
    "You're approaching your API quota for this month.",
    false,
  ],
  ['error', 'error', 'Something went wrong — please retry.', false],
  ['accent', 'brand', 'Dismissible banner — click × to close. ', true],
];
const FIRST_BANNER = BANNERS.slice(0, 1);

const bannerRow = (side: 0 | 1, row: BannerRow) => {
  const [v3, v4, text, restore] = row;
  if (side === 0)
    return `<sapphire-banner variant="${v3}" dismissible>${text}${restore ? V3_RESTORE : ''}</sapphire-banner>`;
  return `<div class="sp-banner" data-variant="${v4}">${text}${restore ? V4_RESTORE : ''}<button class="sp-banner-dismiss" type="button" aria-label="Dismiss">${DISMISS_SVG}</button></div>`;
};

const bannerStack = (side: 0 | 1, inner: string) =>
  side === 0
    ? `<div class="docs-stack" style="gap:12px">${inner}</div>`
    : `<div class="docs-stack docs-banner-stack">${inner}</div>`;

const bannerProbes = (count: number): Probes => ({
  ...Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `banner${index + 1}`,
      [
        `sapphire-banner:nth-child(${index + 1})`,
        `.sp-banner:nth-child(${index + 1})`,
      ] as const,
    ]),
  ),
  dismiss: ['.sapphire-banner-dismiss', '.sp-banner-dismiss'],
});

const decidedBanners = (v4: Observation) =>
  Object.entries(v4.probes)
    .map(([name, probe]) => {
      const background = probe.raw['background-color'];
      if (name === 'dismiss')
        return `#parity .sapphire-banner-dismiss{background-color:${background} !important}`;
      const index = name.replace('banner', '');
      return `#parity sapphire-banner:nth-child(${index}){background-color:${background} !important;border-color:${probe.raw['border-top-color']} !important;color:${probe.raw.color} !important}`;
    })
    .join('');

const bannerPair = (
  name: string,
  rows: readonly BannerRow[],
  act: Action | undefined,
  outline: boolean,
): Pair => ({
  name,
  v3: bannerStack(0, rows.map((row) => bannerRow(0, row)).join('')),
  v4: bannerStack(1, rows.map((row) => bannerRow(1, row)).join('')),
  probes: bannerProbes(rows.length),
  act,
  outline,
  decided: decidedBanners,
});

const hiddenBannerPair: Pair = {
  name: 'banner/hidden',
  v3: bannerStack(
    0,
    '<sapphire-banner variant="error" dismissible hidden>Gone</sapphire-banner><p style="margin:0">after</p>',
  ),
  v4: bannerStack(
    1,
    `<div class="sp-banner" data-variant="error" hidden>Gone<button class="sp-banner-dismiss" type="button" aria-label="Dismiss">${DISMISS_SVG}</button></div><p style="margin:0">after</p>`,
  ),
  probes: {
    banner1: ['sapphire-banner', '.sp-banner'],
  },
  act: undefined,
  decided: decidedBanners,
};

const ACCORDION_TITLES = [
  'What is Sapphire UI?',
  'Does it work outside React?',
  "What's the bundle size?",
] as const;
const ACCORDION_TEXT =
  'An editorial-focused design system for KONGMY Digital Solutions. Built on Radix UI primitives with Web Component escape hatches for framework-agnostic usage in Astro, vanilla HTML, and other non-React contexts.';
const CHEVRON =
  '<path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
const V3_ACCORDION_TRIGGER =
  'flex flex-1 cursor-pointer items-center justify-between py-4 font-medium font-sans text-sm text-text-main transition-all underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-(--color-focus-ring) focus-visible:ring-2 focus-visible:ring-offset-1 [&[data-state=open]>svg]:rotate-180';
const V3_ACCORDION_CONTENT =
  'overflow-hidden font-sans text-sm text-text-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down';

const accordionItem = (side: 0 | 1, index: number, open: boolean) => {
  const state = open ? 'open' : 'closed';
  const title = ACCORDION_TITLES[index] ?? '';
  const shared = `data-orientation="vertical" data-state="${state}"`;
  const trigger = `id="t${index}" aria-controls="c${index}" aria-expanded="${open}" ${shared}`;
  const region = `role="region" id="c${index}" aria-labelledby="t${index}" ${shared}`;
  if (side === 0)
    return `<div ${shared} class="border-border border-b"><h3 ${shared} class="flex"><button type="button" ${trigger} class="${V3_ACCORDION_TRIGGER}">${title}<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" class="shrink-0 text-text-muted transition-transform duration-200">${CHEVRON}</svg></button></h3>${open ? `<div ${region} class="${V3_ACCORDION_CONTENT}"><div class="pt-0 pb-4">${ACCORDION_TEXT}</div></div>` : ''}</div>`;
  return `<div class="sp-accordion-item" ${shared}><h3 class="sp-accordion-header" ${shared}><button class="sp-accordion-trigger" type="button" ${trigger}>${title}<svg class="sp-accordion-chevron" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">${CHEVRON}</svg></button></h3><div class="sp-accordion-content" ${region}${open ? '' : ' hidden'}><div class="sp-accordion-body">${ACCORDION_TEXT}</div></div></div>`;
};

const accordionMarkup = (side: 0 | 1, openIndex: number) => {
  const items = ACCORDION_TITLES.map((_, index) =>
    accordionItem(side, index, index === openIndex),
  ).join('');
  return side === 0
    ? `<div data-orientation="vertical" style="max-width:600px">${items}</div>`
    : `<div class="sp-accordion docs-accordion" data-orientation="vertical">${items}</div>`;
};

const accordionPair = (
  name: string,
  openIndex: number,
  act: Action | undefined,
): Pair => ({
  name,
  v3: accordionMarkup(0, openIndex),
  v4: accordionMarkup(1, openIndex),
  probes: {
    item: ['.border-b', '.sp-accordion-item'],
    header: ['h3', 'h3'],
    trigger: ['button', 'button'],
    chevron: ['svg', 'svg'],
    ...(openIndex < 0
      ? {}
      : {
          content: ['[role=region]', '[role=region]'],
          body: ['[role=region] > div', '[role=region] > div'],
        }),
  },
  act,
});

const V3_SCROLL_HIDE =
  '<style>[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}</style>';
const V3_SCROLL_VIEWPORT =
  'size-full rounded-[inherit] focus-visible:outline-none focus-visible:ring-(--color-focus-ring) focus-visible:ring-2 focus-visible:ring-offset-1';
const V3_SCROLL_BAR = 'flex touch-none select-none transition-colors';
const V3_SCROLL_THUMB =
  'relative flex-1 rounded-full bg-border transition-colors hover:bg-text-muted';
const THUMB_SIZE =
  'width:var(--radix-scroll-area-thumb-width);height:var(--radix-scroll-area-thumb-height);transform:translate3d(0,0,0)';

const scrollRows = (side: 0 | 1, wide: boolean) =>
  Array.from({ length: wide ? 10 : 25 }, (_, index) => {
    const text = wide
      ? `Item ${index + 1} — a long row that overflows the viewport horizontally`
      : `Item ${index + 1} — scroll to see more`;
    return side === 0
      ? `<div style="padding:6px 0;border-bottom:1px solid var(--color-border)${wide ? ';white-space:nowrap' : ''}">${text}</div>`
      : `<div class="docs-scroll-row${wide ? ' docs-scroll-wide' : ''}">${text}</div>`;
  }).join('');

const v3ScrollBars = `<div data-orientation="vertical" data-state="visible" class="${V3_SCROLL_BAR} h-full w-2 border-l border-l-transparent p-px" style="position:absolute;top:0;right:0;bottom:var(--radix-scroll-area-corner-height);--radix-scroll-area-thumb-height:40%"><div data-state="visible" class="${V3_SCROLL_THUMB}" style="${THUMB_SIZE}"></div></div><div data-orientation="horizontal" data-state="visible" class="${V3_SCROLL_BAR} h-2 flex-col border-t border-t-transparent p-px" style="position:absolute;bottom:0;left:0;right:var(--radix-scroll-area-corner-width);--radix-scroll-area-thumb-width:50%"><div data-state="visible" class="${V3_SCROLL_THUMB}" style="${THUMB_SIZE}"></div></div><div style="width:8px;height:8px;position:absolute;right:0;bottom:0"></div>`;
const v4ScrollBars = `<div class="sp-scroll-area-scrollbar" data-orientation="vertical" data-state="visible" style="--radix-scroll-area-thumb-height: 40%"><div class="sp-scroll-area-thumb" data-state="visible" style="${THUMB_SIZE}"></div></div><div class="sp-scroll-area-scrollbar" data-orientation="horizontal" data-state="visible" style="--radix-scroll-area-thumb-width: 50%"><div class="sp-scroll-area-thumb" data-state="visible" style="${THUMB_SIZE}"></div></div><div class="sp-scroll-area-corner" style="width: var(--space-2); height: var(--space-2)"></div>`;

const v3ScrollMarkup = (bars: boolean) => {
  const corner = bars ? 8 : 0;
  const overflowX = bars ? 'scroll' : 'hidden';
  const scrollbars = bars ? v3ScrollBars : '';
  return `${V3_SCROLL_HIDE}<div dir="ltr" class="relative overflow-hidden" style="position:relative;--radix-scroll-area-corner-width:${corner}px;--radix-scroll-area-corner-height:${corner}px;height:180px;width:100%;max-width:320px;border:1px solid var(--color-border);border-radius:var(--radius-sm)"><div data-radix-scroll-area-viewport="" tabindex="0" class="${V3_SCROLL_VIEWPORT}" style="overflow-x:${overflowX};overflow-y:scroll"><div style="min-width:100%;display:table"><div style="padding:16px;font-family:var(--font-sans);font-size:14px">${scrollRows(0, bars)}</div></div></div>${scrollbars}</div>`;
};

const v4ScrollMarkup = (bars: boolean) => {
  const corner = bars
    ? ' style="--radix-scroll-area-corner-width: var(--space-2); --radix-scroll-area-corner-height: var(--space-2)"'
    : '';
  const scrollbars = bars ? v4ScrollBars : '';
  return `<div class="sp-scroll-area docs-scroll-area" dir="ltr"${corner}><div class="sp-scroll-area-viewport" role="region" aria-label="Scrollable list" tabindex="0"><div class="docs-scroll-fill"><div class="docs-scroll-list">${scrollRows(1, bars)}</div></div></div>${scrollbars}</div>`;
};

const scrollPair = (
  name: string,
  bars: boolean,
  act: Action | undefined,
): Pair => ({
  name,
  v3: v3ScrollMarkup(bars),
  v4: v4ScrollMarkup(bars),
  probes: {
    root: ['div[dir]', '.sp-scroll-area'],
    viewport: ['[data-radix-scroll-area-viewport]', '.sp-scroll-area-viewport'],
    ...(bars
      ? {
          barY: ['[data-orientation=vertical]', '[data-orientation=vertical]'],
          thumbY: [
            '[data-orientation=vertical] > div',
            '[data-orientation=vertical] > div',
          ],
          barX: [
            '[data-orientation=horizontal]',
            '[data-orientation=horizontal]',
          ],
          thumbX: [
            '[data-orientation=horizontal] > div',
            '[data-orientation=horizontal] > div',
          ],
        }
      : {}),
  },
  act,
  ignore: ['overflow-x', 'overflow-y'],
});

const PAIRS: readonly Pair[] = [
  ...VARIANTS.flatMap((variant) =>
    SIZES.flatMap((size) =>
      TOGGLE_STATES.map((state) => togglePair(variant, size, state)),
    ),
  ),
  breadcrumbPair('breadcrumb/rest', false),
  breadcrumbPair('breadcrumb/link-hover', true),
  ...CODE_VARIANTS.flatMap((variant) =>
    CODE_STATES.map((state) => codePair(variant, state)),
  ),
  bannerPair('banner/rest', BANNERS, undefined, false),
  bannerPair(
    'banner/dismiss-hover',
    FIRST_BANNER,
    { probe: 'dismiss', interaction: 'hover' },
    false,
  ),
  bannerPair(
    'banner/dismiss-focus',
    FIRST_BANNER,
    { probe: 'dismiss', interaction: 'focus' },
    true,
  ),
  hiddenBannerPair,
  accordionPair('accordion/closed', -1, undefined),
  accordionPair('accordion/trigger-hover', -1, {
    probe: 'trigger',
    interaction: 'hover',
  }),
  accordionPair('accordion/trigger-focus', -1, {
    probe: 'trigger',
    interaction: 'focus',
  }),
  accordionPair('accordion/open', 0, undefined),
  scrollPair('scroll-area/rest', false, undefined),
  scrollPair('scroll-area/viewport-focus', false, {
    probe: 'viewport',
    interaction: 'focus',
  }),
  scrollPair('scroll-area/scrollbars', true, undefined),
  scrollPair('scroll-area/thumb-hover', true, {
    probe: 'thumbY',
    interaction: 'hover',
  }),
];

const GROUPS: Record<string, string> = {
  toggle: 'components/toggle/toggle.examples.html',
  breadcrumb: 'components/breadcrumb/breadcrumb.examples.html',
  'code-block': 'components/code-block/code-block.examples.html',
  banner: 'components/banner/banner.examples.html',
  accordion: 'components/accordion/accordion.examples.html',
  'scroll-area': 'components/scroll-area/scroll-area.examples.html',
};

const settled = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    ),
  );

async function open(page: Page, path: string, scheme: string) {
  await page.goto(path);
  await page.locator('section.docs-section').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}

async function inject(page: Page, markup: string) {
  await page.evaluate(
    async ({ html }) => {
      document.getElementById('parity')?.remove();
      document.getElementById('parity-bed')?.remove();
      const bed = document.createElement('div');
      bed.id = 'parity-bed';
      bed.style.cssText =
        'position:fixed;inset:0;z-index:99998;background:#808080';
      document.body.append(bed);
      const holder = document.createElement('div');
      holder.id = 'parity';
      holder.className = 'docs-preview';
      holder.style.cssText =
        'position:fixed;top:0;left:0;width:480px;z-index:99999;border-radius:0';
      holder.innerHTML = `<style>#parity *{transition:none !important}</style>${html}`;
      document.body.append(holder);
      holder.getBoundingClientRect();
      await document.fonts.ready;
    },
    { html: markup },
  );
}

async function interact(
  page: Page,
  selector: string,
  interaction: Interaction,
) {
  const target = page.locator(`${HOLDER} ${selector}`).first();
  if (interaction === 'hover') await target.hover();
  if (interaction === 'focus') await target.focus();
  await settled(page);
}

const readProbes = (
  page: Page,
  selectors: Record<string, string>,
  outline: boolean,
) =>
  page.evaluate(
    ({ selectors: wanted, properties, colours, outlineNames, withOutline }) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context === null) throw new Error('no 2d context');
      const rgba = (value: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#000';
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        return context.getImageData(0, 0, 1, 1).data.join(',');
      };
      const visibleColour = (style: CSSStyleDeclaration, name: string) => {
        const side = /^border-(\w+)-color$/.exec(name)?.[1];
        const hidden =
          side !== undefined &&
          Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) ===
            0;
        return hidden ? 'none' : rgba(style.getPropertyValue(name));
      };
      const shadows = (value: string) =>
        value
          .split(/,(?![^(]*\))/)
          .map((layer) => layer.trim())
          .map((layer) => {
            const found = /(?:rgba?|color|oklab|oklch)\([^)]*\)/.exec(layer);
            const geometry = layer.replace(found?.[0] ?? '', '').trim();
            return { geometry, colour: rgba(found?.[0] ?? 'transparent') };
          })
          .filter(
            ({ geometry }) =>
              geometry !== 'none' && !/^(?:0px\s*){3,4}$/.test(geometry),
          )
          .map(({ geometry, colour }) => `${geometry} ${colour}`)
          .join(' | ');
      const angle = (style: CSSStyleDeclaration) => {
        const matrix = new DOMMatrix(
          style.transform === 'none' ? undefined : style.transform,
        );
        const turned = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
        const property = Number.parseFloat(style.rotate) || 0;
        return Math.round(turned + property);
      };
      const read = (element: Element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        const names = withOutline
          ? [...properties, ...outlineNames]
          : properties;
        return {
          raw: {
            'background-color': style.backgroundColor,
            color: style.color,
            'border-top-color': style.borderTopColor,
          },
          style: {
            ...Object.fromEntries(
              names.map((name) => [name, style.getPropertyValue(name)]),
            ),
            ...Object.fromEntries(
              colours.map((name) => [name, visibleColour(style, name)]),
            ),
            'box-shadow': shadows(style.boxShadow),
          },
          box: JSON.stringify([box.x, box.y, box.width, box.height]),
          rotation: angle(style),
          focusVisible: element.matches(':focus-visible'),
        };
      };
      return Object.fromEntries(
        Object.entries(wanted).map(([name, selector]) => {
          const element = document.querySelector(`#parity ${selector}`);
          if (element === null) throw new Error(`no ${name}: ${selector}`);
          return [name, read(element)];
        }),
      );
    },
    {
      selectors,
      properties: [...PROPERTIES],
      colours: [...COLOURS],
      outlineNames: [...OUTLINE],
      withOutline: outline,
    },
  );

const applyDecided = (page: Page, css: string) =>
  page.evaluate((text) => {
    const style = document.createElement('style');
    style.textContent = text;
    document.getElementById('parity')?.append(style);
  }, css);

async function observe(
  page: Page,
  pair: Pair,
  side: 0 | 1,
  v4: Observation | undefined,
): Promise<Observation> {
  await inject(page, side === 0 ? pair.v3 : pair.v4);
  if (side === 0 && v4 !== undefined && pair.decided !== undefined)
    await applyDecided(page, pair.decided(v4));
  await page.mouse.move(AWAY.x, AWAY.y);
  const selectors = Object.fromEntries(
    Object.entries(pair.probes).map(([name, both]) => [name, both[side]]),
  );
  if (pair.act !== undefined)
    await interact(page, selectors[pair.act.probe] ?? '', pair.act.interaction);
  await settled(page);
  const probes = await readProbes(page, selectors, pair.outline === true);
  const holder = page.locator(HOLDER);
  const box = await holder.boundingBox();
  const pixels = await holder.screenshot({
    animations: 'disabled',
    caret: 'hide',
  });
  return { probes, box: JSON.stringify(box), pixels };
}

type Difference = { count: number; max: number };
const ANTIALIAS_ALLOWANCE: Difference = { count: 64, max: 1 };
const EXACT: Difference = { count: 0, max: 0 };

const imageDifference = (
  page: Page,
  left: Buffer,
  right: Buffer,
): Promise<Difference> =>
  page.evaluate(
    async (images) => {
      const decode = async (base64: string) => {
        const response = await fetch(`data:image/png;base64,${base64}`);
        const bitmap = await createImageBitmap(await response.blob());
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext('2d');
        if (context === null) throw new Error('no 2d context');
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height);
      };
      const [first, second] = await Promise.all([
        decode(images.left),
        decode(images.right),
      ]);
      if (first.width !== second.width || first.height !== second.height)
        return { count: -1, max: 0 };
      let count = 0;
      let max = 0;
      for (let index = 0; index < first.data.length; index += 4) {
        const steps = [0, 1, 2, 3].map((offset) =>
          Math.abs(
            (first.data[index + offset] ?? 0) -
              (second.data[index + offset] ?? 0),
          ),
        );
        const worst = Math.max(...steps);
        if (worst > 0) count += 1;
        max = Math.max(max, worst);
      }
      return { count, max };
    },
    { left: left.toString('base64'), right: right.toString('base64') },
  );

const withinAllowance = (pair: Pair, found: Difference): boolean => {
  const allowed = pair.antialiased === true ? ANTIALIAS_ALLOWANCE : EXACT;
  return (
    found.count >= 0 && found.count <= allowed.count && found.max <= allowed.max
  );
};

const MAX_RADIUS = 9999;
const normal = (key: string, value: string | undefined) => {
  if (!/-radius$/.test(key) || value === undefined) return value;
  return `${Math.min(Number.parseFloat(value), MAX_RADIUS)}px`;
};

function styleProblems(pair: Pair, v3: Observation, v4: Observation): string[] {
  const lines = Object.entries(v3.probes).flatMap(([name, left]) => {
    const right = v4.probes[name];
    if (right === undefined) return [`${pair.name}: no v4 probe ${name}`];
    const keys = Object.keys(left.style).filter(
      (key) =>
        pair.ignore?.includes(key) !== true &&
        normal(key, left.style[key]) !== normal(key, right.style[key]),
    );
    return [
      ...keys.map(
        (key) =>
          `${pair.name} ${name}: ${key} v3=${left.style[key]} v4=${right.style[key]}`,
      ),
      ...(left.rotation === right.rotation
        ? []
        : [
            `${pair.name} ${name}: rotation v3=${left.rotation} v4=${right.rotation}`,
          ]),
    ];
  });
  return v3.box === v4.box
    ? lines
    : [...lines, `${pair.name}: box v3=${v3.box} v4=${v4.box}`];
}

function focusProblems(pair: Pair, v4: Observation): string[] {
  if (pair.act?.interaction !== 'focus') return [];
  const probe = v4.probes[pair.act.probe];
  return probe?.focusVisible === true
    ? []
    : [`${pair.name}: ${pair.act.probe} is not :focus-visible`];
}

async function attach(
  testInfo: TestInfo,
  name: string,
  images: Record<'expected' | 'actual', Buffer>,
) {
  for (const kind of ['expected', 'actual'] as const) {
    const path = testInfo.outputPath(
      `${name.replaceAll('/', '-')}-${kind}.png`,
    );
    await writeFile(path, images[kind]);
    await testInfo.attach(`${name}-${kind}.png`, {
      path,
      contentType: 'image/png',
    });
  }
}

const schemeOf = (testInfo: TestInfo): Scheme => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};

async function observeSide(
  page: Page,
  pairs: readonly Pair[],
  side: 0 | 1,
  v4: Map<string, Observation> | undefined,
): Promise<Map<string, Observation>> {
  const seen = new Map<string, Observation>();
  for (const pair of pairs)
    seen.set(pair.name, await observe(page, pair, side, v4?.get(pair.name)));
  return seen;
}

const lookup = (seen: Map<string, Observation>, name: string): Observation => {
  const found = seen.get(name);
  if (found === undefined) throw new Error(name);
  return found;
};

for (const [group, specimen] of Object.entries(GROUPS)) {
  test(`extended-parity/${group}`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const scheme = schemeOf(testInfo);
    const pairs = PAIRS.filter((pair) => pair.name.startsWith(`${group}/`));
    await open(page, specimenUrl(specimen, scheme), scheme);
    const v4 = await observeSide(page, pairs, 1, undefined);
    await open(page, V3_PAGE, scheme);
    const v3 = await observeSide(page, pairs, 0, v4);
    const problems: string[] = [];
    for (const pair of pairs) {
      const seen = { v3: lookup(v3, pair.name), v4: lookup(v4, pair.name) };
      problems.push(
        ...focusProblems(pair, seen.v4),
        ...styleProblems(pair, seen.v3, seen.v4),
      );
      const found = await imageDifference(page, seen.v3.pixels, seen.v4.pixels);
      if (withinAllowance(pair, found)) continue;
      problems.push(
        `${pair.name}: ${found.count} pixels differ, up to ${found.max} per channel`,
      );
      await attach(testInfo, pair.name, {
        expected: seen.v3.pixels,
        actual: seen.v4.pixels,
      });
    }
    expect(problems).toEqual([]);
  });
}
