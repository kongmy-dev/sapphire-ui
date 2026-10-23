export type Part = {
  name: string;
  selector: string;
  pixels?: boolean;
};

export type Interaction = {
  name: string;
  action: 'hover' | 'focus';
  selector: string;
};

export const WIDE = 1280;
export const NARROW = 500;

export const SHELL_PARTS: readonly Part[] = [
  {
    name: 'shell',
    selector: '.sp-admin-layout',
    pixels: false,
  },
  {
    name: 'aside',
    selector: '.sp-admin-layout-sidebar',
  },
  {
    name: 'aside-header',
    selector: '.sp-admin-layout-sidebar-header',
  },
  {
    name: 'brand',
    selector: '.sp-admin-layout-brand',
  },
  {
    name: 'toggle',
    selector: '.sp-admin-layout-toggle',
  },
  {
    name: 'nav',
    selector: '.sp-admin-layout-nav',
  },
  {
    name: 'section-title',
    selector: '.sp-admin-layout-section-title',
  },
  {
    name: 'links',
    selector: '.sp-admin-layout-links',
  },
  {
    name: 'link-current',
    selector: '.sp-admin-layout-link[href="#overview"]',
  },
  {
    name: 'link-badge',
    selector: '.sp-admin-layout-link[href="#projects"]',
  },
  {
    name: 'link-plain',
    selector: '.sp-admin-layout-link[href="#settings"]',
  },
  {
    name: 'footer',
    selector: '.sp-admin-layout-sidebar-footer',
  },
  {
    name: 'main',
    selector: '.sp-admin-layout-main',
    pixels: false,
  },
  {
    name: 'header',
    selector: '.sp-admin-layout-header',
  },
  {
    name: 'header-start',
    selector: '.sp-admin-layout-header-start',
  },
  {
    name: 'breadcrumbs',
    selector: '.sp-admin-layout-breadcrumbs',
  },
  {
    name: 'header-end',
    selector: '.sp-admin-layout-header-end',
  },
  {
    name: 'content',
    selector: '.sp-admin-layout-content',
    pixels: false,
  },
];

export const COLLAPSED_PARTS: readonly Part[] = SHELL_PARTS.filter(
  (part) =>
    !['section-title', 'link-current', 'link-badge', 'link-plain'].includes(
      part.name,
    ),
);

export const COLLAPSED_LINKS: readonly Part[] = [
  {
    name: 'link-current',
    selector: '.sp-admin-layout-link[href="#overview"]',
  },
  {
    name: 'link-badge',
    selector: '.sp-admin-layout-link[href="#projects"]',
  },
  {
    name: 'link-plain',
    selector: '.sp-admin-layout-link[href="#settings"]',
  },
];

export const INTERACTIONS: readonly Interaction[] = [
  {
    name: 'link-hover',
    action: 'hover',
    selector: '.sp-admin-layout-link[href="#projects"]',
  },
  {
    name: 'current-link-hover',
    action: 'hover',
    selector: '.sp-admin-layout-link[href="#overview"]',
  },
  {
    name: 'toggle-hover',
    action: 'hover',
    selector: '.sp-admin-layout-toggle',
  },
  {
    name: 'toggle-focus',
    action: 'focus',
    selector: '.sp-admin-layout-toggle',
  },
];

export type PageCase = {
  name: string;
  markup: string;
  width: number;
  hover?: string;
  focus?: string;
};

const PAGE_HEAD =
  '<div class="sp-admin-layout-page-head"><div><h1>Documents</h1><div class="sp-admin-layout-page-sub">Plans and proposals in one place.</div></div><div class="sp-admin-layout-page-actions"><span>Export</span><span>New proposal</span></div></div>';
const FILTERS =
  '<div class="sp-admin-layout-filters"><div class="demo-admin-search"><span class="docs-admin-glyph"></span><input placeholder="Search documents" aria-label="Search"></div><button class="demo-admin-icon-button" aria-label="Filters"><span class="docs-admin-glyph" data-size="xl"></span></button></div>';

export const PAGE_CASES: readonly PageCase[] = [
  {
    name: 'page-head',
    markup: PAGE_HEAD,
    width: WIDE,
  },
  {
    name: 'page-head-narrow',
    markup: PAGE_HEAD,
    width: NARROW,
  },
  {
    name: 'filters',
    markup: FILTERS,
    width: WIDE,
    hover: 'button',
  },
  {
    name: 'filters-narrow',
    markup: FILTERS,
    width: NARROW,
  },
  {
    name: 'doc-title',
    markup:
      '<div style="display:grid;gap:12px;padding:12px"><div class="demo-admin-doc-title"><div class="demo-admin-doc-icon" data-kind="proposal"><span class="docs-admin-glyph" data-size="lg"></span></div><div><b>Cloud migration</b><small>Acme Holdings</small></div></div><div class="demo-admin-doc-title"><div class="demo-admin-doc-icon" data-kind="plan"><span class="docs-admin-glyph" data-size="lg"></span></div><div><b>Support plan</b><small>Northwind Traders</small></div></div><div class="demo-admin-doc-title"><div class="demo-admin-doc-icon"><span class="docs-admin-glyph" data-size="lg"></span></div><div><b>Audit notes</b><small>Internal</small></div></div></div>',
    width: WIDE,
  },
  {
    name: 'row-actions',
    markup:
      '<div style="padding:12px;width:240px"><div class="demo-admin-row-actions"><button aria-label="Edit"><span class="docs-admin-glyph"></span></button><button aria-label="Archive"><span class="docs-admin-glyph"></span></button></div></div>',
    width: WIDE,
    hover: 'button:nth-child(2)',
  },
  {
    name: 'pass',
    markup:
      '<div style="padding:12px"><span class="demo-admin-pass">Passphrase <span class="demo-admin-pass-dots">&bull;&bull;&bull;&bull;&bull;&bull;</span><button aria-label="Copy"><span class="docs-admin-glyph" data-size="sm"></span></button></span></div>',
    width: WIDE,
    hover: 'button',
  },
];

export const PROPOSAL_CASE: PageCase = {
  name: 'proposal-layout',
  markup:
    '<div class="sp-proposal-layout"><div class="sp-document-bar"><div class="sp-document-mark">S</div><div class="sp-document-wordmark">Sapphire <small>Proposals</small></div><span class="sp-document-bar-separator" aria-hidden="true"></span><div class="sp-document-crumb">Cloud migration</div><div class="sp-document-bar-meta"><span>Prepared <b>3 Nov 2026</b></span><span class="sp-document-pill">Locked</span></div></div><div class="sp-document-shell"><div class="sp-document-hero"><div class="sp-document-eyebrow">Proposal</div><h1>Cloud migration for Acme Holdings</h1><p class="sp-document-lede">A phased move from two data centres to managed cloud.</p></div><section class="sp-document-section"><div class="sp-document-section-number">01</div><h2>Scope of work</h2><p>We move the workloads in three waves.</p></section></div></div>',
  width: WIDE,
};
