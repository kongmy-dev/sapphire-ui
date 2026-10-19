export type Part = {
  name: string;
  v3: string;
  v4: string;
  deep?: boolean;
  styles?: boolean;
  pixels?: boolean;
  skip?: readonly string[];
};

export type Interaction = {
  name: string;
  action: 'hover' | 'focus';
  v3: string;
  v4: string;
};

export const WIDE = 1280;
export const NARROW = 500;

const ASIDE = '.sf-admin-sidebar';
const HEAD = `${ASIDE} > div:nth-child(1)`;
const LINKS = `${ASIDE} nav`;
const HEADER = '.sf-admin-header';

const LINK = (index: number) => `${LINKS} > a:nth-child(${index})`;
const V4_LINK = (index: number) =>
  `.sp-admin-layout-links > a:nth-child(${index})`;

export const SHELL_PARTS: readonly Part[] = [
  {
    name: 'shell',
    v3: ':scope > .sf-admin-shell',
    v4: ':scope > .sp-admin-layout',
    skip: ['height', 'rect-size'],
    pixels: false,
  },
  { name: 'aside', v3: ASIDE, v4: '.sp-admin-layout-sidebar' },
  {
    name: 'aside-header',
    v3: HEAD,
    v4: '.sp-admin-layout-sidebar-header',
  },
  {
    name: 'brand',
    v3: `${HEAD} > div`,
    v4: '.sp-admin-layout-brand',
  },
  {
    name: 'toggle',
    v3: `${HEAD} > button`,
    v4: '.sp-admin-layout-toggle',
    deep: true,
  },
  {
    name: 'nav',
    v3: `${ASIDE} > div:nth-child(2)`,
    v4: '.sp-admin-layout-nav',
  },
  {
    name: 'section-title',
    v3: `${ASIDE} h5`,
    v4: '.sp-admin-layout-section-title',
  },
  { name: 'links', v3: LINKS, v4: '.sp-admin-layout-links' },
  { name: 'link-current', v3: LINK(1), v4: V4_LINK(1), deep: true },
  { name: 'link-badge', v3: LINK(2), v4: V4_LINK(2), deep: true },
  { name: 'link-plain', v3: LINK(3), v4: V4_LINK(3), deep: true },
  {
    name: 'footer',
    v3: `${ASIDE} > div:nth-child(3)`,
    v4: '.sp-admin-layout-sidebar-footer',
    styles: false,
  },
  {
    name: 'main',
    v3: '.sf-admin-main',
    v4: '.sp-admin-layout-main',
    skip: ['height', 'rect-size'],
    pixels: false,
  },
  { name: 'header', v3: HEADER, v4: '.sp-admin-layout-header' },
  {
    name: 'header-start',
    v3: `${HEADER} > div:nth-child(1)`,
    v4: '.sp-admin-layout-header-start',
  },
  {
    name: 'breadcrumbs',
    v3: `${HEADER} > div:nth-child(1) > div`,
    v4: '.sp-admin-layout-breadcrumbs',
  },
  {
    name: 'header-end',
    v3: `${HEADER} > div:nth-child(2)`,
    v4: '.sp-admin-layout-header-end',
  },
  {
    name: 'content',
    v3: '.sf-admin-content',
    v4: '.sp-admin-layout-content',
    skip: ['height', 'rect-size'],
    pixels: false,
  },
];

export const COLLAPSED_PARTS: readonly Part[] = SHELL_PARTS.filter(
  (part) =>
    !['section-title', 'link-current', 'link-badge', 'link-plain'].includes(
      part.name,
    ),
).map((part) => (part.name === 'toggle' ? part : { ...part, deep: false }));

export const COLLAPSED_LINKS: readonly Part[] = [
  { name: 'link-current', v3: LINK(1), v4: V4_LINK(1), styles: false },
  { name: 'link-badge', v3: LINK(2), v4: V4_LINK(2), styles: false },
  { name: 'link-plain', v3: LINK(3), v4: V4_LINK(3), styles: false },
];

export const INTERACTIONS: readonly Interaction[] = [
  { name: 'link-hover', action: 'hover', v3: LINK(2), v4: V4_LINK(2) },
  { name: 'current-link-hover', action: 'hover', v3: LINK(1), v4: V4_LINK(1) },
  {
    name: 'toggle-hover',
    action: 'hover',
    v3: `${HEAD} > button`,
    v4: '.sp-admin-layout-toggle',
  },
  {
    name: 'toggle-focus',
    action: 'focus',
    v3: `${HEAD} > button`,
    v4: '.sp-admin-layout-toggle',
  },
];

export type PageCase = {
  name: string;
  v3: string;
  v4: string;
  width: number;
  v3Page?: string;
  accents?: boolean;
  hover?: string;
  focus?: string;
};

const glyph = (name: string) =>
  `<span class="material-symbols-outlined">${name}</span>`;
const slot = (size?: string) =>
  `<span class="docs-admin-glyph"${size === undefined ? '' : ` data-size="${size}"`}></span>`;

const PAGE_HEAD = (prefix: 'sf' | 'sp-admin-layout') => {
  const head = prefix === 'sf' ? 'sf-page-head' : 'sp-admin-layout-page-head';
  const sub = prefix === 'sf' ? 'sf-sub' : 'sp-admin-layout-page-sub';
  const actions =
    prefix === 'sf' ? 'sf-actions' : 'sp-admin-layout-page-actions';
  return `<div class="${head}"><div><h1>Documents</h1><div class="${sub}">Plans and proposals in one place.</div></div><div class="${actions}"><span>Export</span><span>New proposal</span></div></div>`;
};

const FILTERS = (v3: boolean) =>
  v3
    ? `<div class="sf-filters"><div class="sf-search">${glyph('search')}<input placeholder="Search documents" aria-label="Search"></div><button class="sf-icon-btn" aria-label="Filters">${glyph('tune')}</button></div>`
    : `<div class="sp-admin-layout-filters"><div class="sp-admin-layout-search">${slot()}<input placeholder="Search documents" aria-label="Search"></div><button class="sp-admin-layout-icon-button" aria-label="Filters">${slot('xl')}</button></div>`;

const DOC_TITLES = (v3: boolean) => {
  const title = v3 ? 'doc-title' : 'sp-admin-layout-doc-title';
  const icon = (kind: string) =>
    v3
      ? `<div class="dot${kind === '' ? '' : ` ${kind}`}">${glyph('description')}</div>`
      : `<div class="sp-admin-layout-doc-icon"${kind === '' ? '' : ` data-kind="${kind}"`}>${slot('lg')}</div>`;
  const row = (kind: string, name: string, meta: string) =>
    `<div class="${title}">${icon(kind)}<div><b>${name}</b><small>${meta}</small></div></div>`;
  return `<div style="display:grid;gap:12px;padding:12px">${row('proposal', 'Cloud migration', 'Acme Holdings')}${row('plan', 'Support plan', 'Northwind Traders')}${row('', 'Audit notes', 'Internal')}</div>`;
};

const ROW_ACTIONS = (v3: boolean) =>
  v3
    ? `<div style="padding:12px;width:240px"><div class="sf-row-actions"><button aria-label="Edit">${glyph('edit')}</button><button aria-label="Archive">${glyph('inventory_2')}</button></div></div>`
    : `<div style="padding:12px;width:240px"><div class="sp-admin-layout-row-actions"><button aria-label="Edit">${slot()}</button><button aria-label="Archive">${slot()}</button></div></div>`;

const PASS = (v3: boolean) =>
  v3
    ? `<div style="padding:12px"><span class="sf-pass">Passphrase <span class="dots">&bull;&bull;&bull;&bull;&bull;&bull;</span><button aria-label="Copy">${glyph('content_copy')}</button></span></div>`
    : `<div style="padding:12px"><span class="sp-admin-layout-pass">Passphrase <span class="sp-admin-layout-pass-dots">&bull;&bull;&bull;&bull;&bull;&bull;</span><button aria-label="Copy">${slot('sm')}</button></span></div>`;

export const PAGE_CASES: readonly PageCase[] = [
  {
    name: 'page-head',
    v3: PAGE_HEAD('sf'),
    v4: PAGE_HEAD('sp-admin-layout'),
    width: WIDE,
  },
  {
    name: 'page-head-narrow',
    v3: PAGE_HEAD('sf'),
    v4: PAGE_HEAD('sp-admin-layout'),
    width: NARROW,
  },
  {
    name: 'filters',
    v3: FILTERS(true),
    v4: FILTERS(false),
    width: WIDE,
    hover: 'button',
  },
  {
    name: 'filters-narrow',
    v3: FILTERS(true),
    v4: FILTERS(false),
    width: NARROW,
  },
  {
    name: 'doc-title',
    v3: DOC_TITLES(true),
    v4: DOC_TITLES(false),
    width: WIDE,
  },
  {
    name: 'row-actions',
    v3: ROW_ACTIONS(true),
    v4: ROW_ACTIONS(false),
    width: WIDE,
    hover: 'button:nth-child(2)',
  },
  {
    name: 'pass',
    v3: PASS(true),
    v4: PASS(false),
    width: WIDE,
    hover: 'button',
  },
];

const PROPOSAL_BODY = (v3: boolean) => {
  const c = (v3Name: string, v4Name: string) => (v3 ? v3Name : v4Name);
  return `<div class="${c('doc-bar', 'sp-document-bar')}"><div class="${c('sf-mark', 'sp-document-mark')}">S</div><div class="${c('wm', 'sp-document-wordmark')}">Sapphire <small>Proposals</small></div>${v3 ? '<span class="material-symbols-outlined doc-bar-sep" aria-hidden="true">chevron_right</span>' : '<span class="sp-document-bar-separator" aria-hidden="true"></span>'}<div class="${c('crumb', 'sp-document-crumb')}">Cloud migration</div><div class="${c('doc-meta', 'sp-document-bar-meta')}"><span>Prepared <b>3 Nov 2026</b></span><span class="${c('sf-pill locked', 'sp-document-pill')}">Locked</span></div></div><div class="${c('doc-shell', 'sp-document-shell')}"><div class="${c('doc-hero', 'sp-document-hero')}"><div class="${c('eyebrow', 'sp-document-eyebrow')}">Proposal</div><h1>Cloud migration for Acme Holdings</h1><p class="${c('lede', 'sp-document-lede')}">A phased move from two data centres to managed cloud.</p></div><section class="${c('doc-section', 'sp-document-section')}"><div class="${c('sec-no', 'sp-document-section-number')}">01</div><h2>Scope of work</h2><p>We move the workloads in three waves.</p></section></div>`;
};

export const PROPOSAL_CASE: PageCase = {
  name: 'proposal-layout',
  v3: `<div class="min-h-screen bg-page font-sans text-primary">${PROPOSAL_BODY(true)}</div>`,
  v4: `<div class="sp-proposal-layout">${PROPOSAL_BODY(false)}</div>`,
  width: WIDE,
  v3Page: '/extended',
  accents: true,
};
