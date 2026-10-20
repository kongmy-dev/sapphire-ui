import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { captureState } from './capture-state';
import { expect, test } from './fixtures';

const HOLDER = '#parity';
const AWAY = { x: 1100, y: 700 };
const HOLDER_STYLE =
  'position:fixed;top:0;left:0;width:960px;z-index:99999;border-radius:0;';
const PROPERTIES = [
  'display',
  'position',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'align-items',
  'justify-items',
  'justify-content',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'width',
  'height',
  'min-width',
  'max-width',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'scroll-margin-top',
  'overflow-x',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-variant-numeric',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-decoration-line',
  'text-decoration-thickness',
  'text-underline-offset',
  'list-style-type',
  'white-space',
  'vertical-align',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
] as const;
const GROUPS = ['prose', 'document', 'table', 'key-value-list'] as const;
type Group = (typeof GROUPS)[number];
const SPECIMENS: Record<Group, string> = {
  prose: 'components/prose/prose.examples.html',
  document: 'components/document/document.examples.html',
  table: 'components/table/table.examples.html',
  'key-value-list': 'components/key-value-list/key-value-list.examples.html',
};
type Fixture = {
  name: string;
  group: Group;
  title: string;
  pick: string;
  v3: string | ((v4Html: string) => string);
  probes: Record<string, readonly [string, string]>;
  only?: Record<string, readonly string[]>;
  hover?: string;
};
type Probe = {
  style: Record<string, string>;
  box: string;
};
type Observation = {
  html: string;
  text: string;
  probes: Record<string, Probe>;
  box: string;
  pixels: Buffer;
};
const GLYPH = '.material-symbols-outlined';
const V4_GLYPHS =
  '#parity .sp-document-bar-separator, #parity .sp-document-card-icon > .sp-icon';
const proseV3 = (size: string) => (v4Html: string) =>
  v4Html.replace(
    /class="sp-prose"(?: data-size="(?:sm|lg)")?/,
    `class="prose${size}"`,
  );
const PROSE_PARTS = {
  h1: ' h1',
  h2: ' h2',
  h3: ' h3',
  h4: ' h4',
  p: ' p',
  link: ' a',
  strong: ' strong',
  code: ' p code',
  ul: ' ul',
  ol: ' ol',
  li: ' li',
  blockquote: ' blockquote',
  pre: ' pre',
  'pre-code': ' pre code',
  hr: ' hr',
  img: ' img',
} as const;
const pairOf = (v3: string, v4: string): readonly [string, string] => [v3, v4];
const PROSE_PROBES: Record<string, readonly [string, string]> = {
  root: pairOf('.prose', '.sp-prose'),
  ...Object.fromEntries(
    Object.entries(PROSE_PARTS).map(([name, part]) => [
      name,
      pairOf(`.prose${part}`, `.sp-prose${part}`),
    ]),
  ),
};
const BAR_V3 = `<div class="doc-bar">
  <div class="sf-mark">S</div>
  <div class="wm">Sapphire <small>Proposals</small></div>
  <span class="material-symbols-outlined doc-bar-sep" aria-hidden="true">chevron_right</span>
  <div class="crumb">Cloud migration</div>
  <div class="doc-meta">
    <span>Prepared <b>3 Nov 2026</b></span>
    <span>Revision <b>1.2</b></span>
    <span class="sf-pill locked">Locked</span>
  </div>
</div>`;
const HERO_V3 = `<div class="doc-shell">
  <div class="doc-hero">
    <div class="eyebrow">Proposal</div>
    <h1>Cloud migration for Acme Holdings</h1>
    <p class="lede">A phased move from two data centres to managed cloud, with no downtime for customers.</p>
    <dl class="meta-row">
      <div>
        <dt>Prepared for</dt>
        <dd>Acme Holdings</dd>
      </div>
      <div>
        <dt>Prepared by</dt>
        <dd>Platform team</dd>
      </div>
      <div>
        <dt>Valid until</dt>
        <dd>30 November 2026</dd>
      </div>
    </dl>
  </div>
</div>`;
const SECTION_V3 = `<div class="doc-shell">
  <section class="doc-section">
    <div class="sec-no">01</div>
    <h2>Scope of work</h2>
    <p class="lede">What we will build, and what we will leave alone.</p>
    <p>We move <span class="tab-num">1,240</span> workloads in three waves. Run costs fall by <span class="num-pos tab-num">12.4%</span> while support requests rise by <span class="num-neg tab-num">3.1%</span> during the cutover.</p>
    <h3>Delivery</h3>
    <p>Each wave ends with a review. <span class="muted">Dates move only with the client's written approval.</span></p>
    <h4>Assumptions</h4>
    <p>The client provides access to both data centres before the first wave starts.</p>
    <hr class="rule">
    <p>Everything below the rule is optional work.</p>
  </section>
  <section class="doc-section">
    <div class="sec-no">02</div>
    <h2>Timeline</h2>
    <p>Three waves over twelve weeks.</p>
  </section>
</div>`;
const CARD_V3 = `<div class="doc-card">
  <div class="ic"><span class="material-symbols-outlined">cloud</span></div>
  <h3>Managed hosting</h3>
  <p>Servers, patches and backups run by us, with a monthly report.</p>
</div>`;
const DARK_CARD_V3 = `<div class="doc-card dark">
  <div class="ic"><span class="material-symbols-outlined">support_agent</span></div>
  <h3>Premium support</h3>
  <h4>Included</h4>
  <div>Four-hour response on every ticket, any day of the week.</div>
</div>`;
const FOOT_V3 = `<div class="doc-shell">
  <div class="doc-foot">
    <div class="sf-mark">S</div>
    <div>Prepared by Sapphire Studio. This proposal is confidential.</div>
    <div class="muted">Valid for 30 days</div>
  </div>
</div>`;
const row = (cells: readonly string[], kind = '') =>
  `<tr${kind === '' ? '' : ` class="${kind}"`}>${cells
    .map((cell) => `<td>${cell}</td>`)
    .join('')}</tr>`;
const sectionRow = (label: string) =>
  `<tr class="section"><td colspan="4">${label}</td></tr>`;
const FIN_V3 = `<table class="fin-table">
  <thead>
    <tr><th>Line item</th><th>Q1</th><th>Q2</th><th>Total</th></tr>
  </thead>
  <tbody>
    ${sectionRow('Revenue')}
    ${row(['Subscriptions', '$48,200', '$52,900', '$101,100'])}
    ${row(['Services', '$12,400', '$9,750', '$22,150'])}
    ${row(['Total revenue', '$60,600', '$62,650', '$123,250'], 'subtotal')}
    ${sectionRow('Costs')}
    ${row(['Hosting', '$8,100', '$8,450', '$16,550'])}
    ${row(['Support', '$14,300', '$15,900', '$30,200'])}
    ${row(['Net income', '$38,200', '$38,300', '$76,500'], 'total')}
  </tbody>
</table>`;
const KVS_V3 = `<dl class="kvs">
  <dt>Client</dt>
  <dd>Acme Holdings</dd>
  <dt>Engagement</dt>
  <dd>Cloud migration</dd>
  <dt>Start date</dt>
  <dd>3 November 2026</dd>
  <dt>Owner</dt>
  <dd>Platform team</dd>
</dl>`;
const FIXTURES: readonly Fixture[] = [
  {
    name: 'prose/default',
    group: 'prose',
    title: 'Prose',
    pick: '.sp-prose',
    v3: proseV3(''),
    probes: PROSE_PROBES,
    hover: 'link',
  },
  {
    name: 'prose/small',
    group: 'prose',
    title: 'Prose \\(small\\)',
    pick: '.sp-prose',
    v3: proseV3(' prose-sm'),
    probes: PROSE_PROBES,
  },
  {
    name: 'prose/large',
    group: 'prose',
    title: 'Prose \\(large\\)',
    pick: '.sp-prose',
    v3: proseV3(' prose-lg'),
    probes: PROSE_PROBES,
  },
  {
    name: 'document/bar',
    group: 'document',
    title: 'Document bar',
    pick: '.sp-document-bar',
    v3: BAR_V3,
    probes: {
      bar: ['.doc-bar', '.sp-document-bar'],
      mark: ['.sf-mark', '.sp-document-mark'],
      wordmark: ['.wm', '.sp-document-wordmark'],
      'wordmark-small': ['.wm small', '.sp-document-wordmark small'],
      separator: ['.doc-bar-sep', '.sp-document-bar-separator'],
      crumb: ['.crumb', '.sp-document-crumb'],
      meta: ['.doc-meta', '.sp-document-bar-meta'],
      'meta-b': ['.doc-meta b', '.sp-document-bar-meta b'],
      pill: ['.sf-pill', '.sp-document-pill'],
    },
    only: { separator: ['width', 'height', 'display', 'flex-grow'] },
  },
  {
    name: 'document/hero',
    group: 'document',
    title: 'Document hero',
    pick: '.sp-document-shell',
    v3: HERO_V3,
    probes: {
      shell: ['.doc-shell', '.sp-document-shell'],
      hero: ['.doc-hero', '.sp-document-hero'],
      eyebrow: ['.eyebrow', '.sp-document-eyebrow'],
      h1: ['.doc-hero h1', '.sp-document-hero h1'],
      lede: ['.lede', '.sp-document-lede'],
      meta: ['.meta-row', '.sp-document-hero-meta'],
      term: ['.meta-row dt', '.sp-document-hero-meta dt'],
      description: ['.meta-row dd', '.sp-document-hero-meta dd'],
    },
  },
  {
    name: 'document/section',
    group: 'document',
    title: 'Document section',
    pick: '.sp-document-shell',
    v3: SECTION_V3,
    probes: {
      section: ['.doc-section', '.sp-document-section'],
      last: ['.doc-section:last-of-type', '.sp-document-section:last-of-type'],
      number: ['.sec-no', '.sp-document-section-number'],
      h2: ['.doc-section > h2', '.sp-document-section > h2'],
      lede: [
        '.doc-section > h2 + .lede',
        '.sp-document-section > h2 + .sp-document-lede',
      ],
      p: [
        '.doc-section > p:nth-of-type(2)',
        '.sp-document-section > p:nth-of-type(2)',
      ],
      figure: ['.tab-num', '.sp-document-figure[data-tabular]'],
      positive: ['.num-pos', '.sp-document-figure[data-tone="positive"]'],
      negative: ['.num-neg', '.sp-document-figure[data-tone="negative"]'],
      h3: ['.doc-section h3', '.sp-document-section h3'],
      muted: ['.muted', '.sp-document-muted'],
      h4: ['.doc-section h4', '.sp-document-section h4'],
      rule: ['hr.rule', 'hr.sp-document-rule'],
    },
  },
  {
    name: 'document/card',
    group: 'document',
    title: 'Document cards',
    pick: '.sp-document-card:not([data-variant])',
    v3: CARD_V3,
    probes: {
      card: ['.doc-card', '.sp-document-card'],
      icon: ['.ic', '.sp-document-card-icon'],
      h3: ['.doc-card h3', '.sp-document-card h3'],
      p: ['.doc-card p', '.sp-document-card p'],
    },
  },
  {
    name: 'document/card-on-dark',
    group: 'document',
    title: 'Document cards',
    pick: '.sp-document-card[data-variant="on-dark"]',
    v3: DARK_CARD_V3,
    probes: {
      card: ['.doc-card', '.sp-document-card'],
      icon: ['.ic', '.sp-document-card-icon'],
      h3: ['.doc-card h3', '.sp-document-card h3'],
      h4: ['.doc-card h4', '.sp-document-card h4'],
      body: [
        '.doc-card > div:last-child',
        '.sp-document-card > div:last-child',
      ],
    },
  },
  {
    name: 'document/foot',
    group: 'document',
    title: 'Document footer',
    pick: '.sp-document-shell',
    v3: FOOT_V3,
    probes: {
      foot: ['.doc-foot', '.sp-document-foot'],
      mark: ['.sf-mark', '.sp-document-mark'],
      text: [
        '.doc-foot > div:nth-child(2)',
        '.sp-document-foot > div:nth-child(2)',
      ],
      muted: ['.muted', '.sp-document-muted'],
    },
  },
  {
    name: 'table/financial',
    group: 'table',
    title: 'Financial table',
    pick: 'table.sp-table',
    v3: FIN_V3,
    probes: {
      table: ['.fin-table', '.sp-table'],
      head: ['.fin-table thead th:first-child', '.sp-table-head:first-child'],
      'head-number': [
        '.fin-table thead th:nth-child(2)',
        '.sp-table-head:nth-child(2)',
      ],
      cell: [
        '.fin-table tr:nth-child(2) td:first-child',
        'tr:nth-child(2) .sp-table-cell:first-child',
      ],
      'cell-number': [
        '.fin-table tr:nth-child(2) td:nth-child(2)',
        'tr:nth-child(2) .sp-table-cell:nth-child(2)',
      ],
      section: [
        '.fin-table tr.section td',
        '.sp-table-row[data-row="section"] .sp-table-cell',
      ],
      subtotal: [
        '.fin-table tr.subtotal td:first-child',
        '.sp-table-row[data-row="subtotal"] .sp-table-cell:first-child',
      ],
      'subtotal-number': [
        '.fin-table tr.subtotal td:nth-child(2)',
        '.sp-table-row[data-row="subtotal"] .sp-table-cell:nth-child(2)',
      ],
      total: [
        '.fin-table tr.total td:first-child',
        '.sp-table-row[data-row="total"] .sp-table-cell:first-child',
      ],
      'total-number': [
        '.fin-table tr.total td:nth-child(4)',
        '.sp-table-row[data-row="total"] .sp-table-cell:nth-child(4)',
      ],
    },
  },
  {
    name: 'key-value-list/default',
    group: 'key-value-list',
    title: 'Key-value list',
    pick: '.sp-key-value-list',
    v3: KVS_V3,
    probes: {
      list: ['.kvs', '.sp-key-value-list'],
      term: ['.kvs dt', '.sp-key-value-list dt'],
      description: ['.kvs dd', '.sp-key-value-list dd'],
    },
  },
];
const section = (page: Page, title: string) =>
  page.locator('section.docs-section').filter({
    has: page.locator('h2.docs-section-title', {
      hasText: new RegExp(`^${title}$`),
    }),
  });
async function open(page: Page, path: string, scheme: string) {
  await page.goto(path);
  await page.locator('section.docs-section').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}
async function mount(page: Page, html: string) {
  await page.evaluate(
    async (spec) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      holder.style.cssText = `${spec.style}background:${getComputedStyle(document.body).backgroundColor}`;
      holder.innerHTML = spec.html;
      document.body.append(holder);
      await document.fonts.ready;
      holder.style.height = `${Math.ceil(holder.getBoundingClientRect().height)}px`;
    },
    { html, style: HOLDER_STYLE },
  );
}
const readProbes = (
  page: Page,
  selectors: Record<string, string>,
  only: Record<string, readonly string[]>,
) =>
  page.evaluate(
    ({ wanted, restrict, properties, colours }) => {
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
      const borderStyles = (style: CSSStyleDeclaration) =>
        Object.fromEntries(
          ['top', 'right', 'bottom', 'left'].map((side) => [
            `border-${side}-style`,
            Number.parseFloat(
              style.getPropertyValue(`border-${side}-width`),
            ) === 0
              ? 'none'
              : style.getPropertyValue(`border-${side}-style`),
          ]),
        );
      const holder = document.getElementById('parity');
      if (holder === null) throw new Error('no holder');
      const origin = holder.getBoundingClientRect();
      const read = (name: string, element: Element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        const keep = restrict[name];
        const names = keep ?? properties;
        return {
          style: {
            ...Object.fromEntries(
              names.map((property) => [
                property,
                style.getPropertyValue(property),
              ]),
            ),
            ...(keep === undefined
              ? {
                  ...borderStyles(style),
                  ...Object.fromEntries(
                    colours.map((property) => [
                      property,
                      visibleColour(style, property),
                    ]),
                  ),
                }
              : {}),
          },
          box: JSON.stringify([
            box.x - origin.x,
            box.y - origin.y,
            box.width,
            box.height,
          ]),
        };
      };
      return Object.fromEntries(
        Object.entries(wanted).map(([name, selector]) => {
          const element = document.querySelector(`#parity ${selector}`);
          if (element === null) throw new Error(`no ${name}: ${selector}`);
          return [name, read(name, element)];
        }),
      );
    },
    {
      wanted: selectors,
      restrict: only,
      properties: [...PROPERTIES],
      colours: [...COLOURS],
    },
  );
const textOf = (page: Page, withoutGlyphs: boolean) =>
  page.evaluate(
    (spec) => {
      const holder = document.getElementById('parity');
      if (holder === null) throw new Error('no holder');
      const copy = holder.cloneNode(true);
      if (!(copy instanceof Element)) throw new Error('cannot clone');
      if (spec.withoutGlyphs)
        for (const glyph of copy.querySelectorAll(spec.glyph)) glyph.remove();
      return (copy.textContent ?? '').replace(/\s+/g, '');
    },
    { withoutGlyphs, glyph: GLYPH },
  );
async function observe(
  page: Page,
  fixture: Fixture,
  html: string,
): Promise<Observation> {
  await mount(page, html);
  await page.mouse.move(AWAY.x, AWAY.y);
  const selectors = Object.fromEntries(
    Object.entries(fixture.probes).map(([name, both]) => [name, both[1]]),
  );
  const hovered = fixture.hover;
  if (hovered !== undefined) {
    await page
      .locator(`${HOLDER} ${selectors[hovered] ?? ''}`)
      .first()
      .hover();
  }
  const probes = await readProbes(page, selectors, fixture.only ?? {});
  const holder = page.locator(HOLDER);
  const box = await holder.boundingBox();
  const pixels = await captureState(holder, {
    animations: 'disabled',
    caret: 'hide',
  });
  return {
    html,
    text: await textOf(page, false),
    probes,
    box: JSON.stringify(box),
    pixels,
  };
}
const schemeOf = (testInfo: TestInfo): Scheme => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};
const pickOf = (page: Page, fixture: Fixture): Locator =>
  section(page, fixture.title).locator(fixture.pick).first();
const stickyProblems = (page: Page): Promise<string[]> =>
  page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector(selector);
      if (element === null) throw new Error(`no ${selector}`);
      const style = getComputedStyle(element);
      return `${style.position} ${style.top}`;
    };
    const sticky = read('.sp-document-bar[data-sticky]');
    const plain = read('.sp-document-bar:not([data-sticky])');
    return [
      ...(sticky === 'sticky 0px' ? [] : [`sticky bar is "${sticky}"`]),
      ...(plain.startsWith('static') ? [] : [`plain bar is "${plain}"`]),
    ];
  });
for (const group of GROUPS) {
  test(`document-parity/${group}`, async ({ page }, testInfo) => {
    test.setTimeout(180000);
    const scheme = schemeOf(testInfo);
    const fixtures = FIXTURES.filter((fixture) => fixture.group === group);
    await open(page, specimenUrl(SPECIMENS[group], scheme), scheme);
    await page.addStyleTag({
      content: `${V4_GLYPHS} { visibility: hidden !important }`,
    });
    const problems: string[] =
      group === 'document' ? await stickyProblems(page) : [];
    for (const fixture of fixtures) {
      const html = await pickOf(page, fixture).evaluate(
        (element) => element.outerHTML,
      );
      await observe(page, fixture, html);
    }
    expect(problems).toEqual([]);
  });
}
