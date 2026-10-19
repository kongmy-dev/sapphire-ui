import { writeFile } from 'node:fs/promises';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';
import {
  CASES,
  type Case,
  NARROW,
  SHARED_CSS,
  THEME_TOGGLE_V4,
  WIDE,
} from './page-layout-pairs';

const V3_PAGE = '/layouts';
const V3_HOME = '/';
const V4_PAGE = 'components/container/container.examples.html';
const V4_NAV = 'components/mobile-nav/mobile-nav.examples.html';
const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const GLYPHS =
  '#parity .material-symbols-outlined, #parity .sp-theme-toggle-icon, .material-symbols-outlined, .sp-mobile-nav-icon';
const MAX_LINES = 40;

const PROPERTIES = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
  'text-align',
  'text-decoration-line',
  'white-space',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'align-items',
  'justify-content',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'overflow-x',
  'overflow-y',
  'opacity',
  'visibility',
  'translate',
  'scale',
  'clip',
  'backdrop-filter',
  'cursor',
  'pointer-events',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
] as const;

type Style = { tag: string; values: Record<string, string> };
type Capture = { styles: Style[]; pixels: Buffer };
type Tokens = {
  brandText: string;
  background: string;
  scrim: string;
  version: string;
};
type Side = 'v3' | 'v4';

const schemeOf = (testInfo: TestInfo): Scheme => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};

async function open(page: Page, path: string, scheme: Scheme) {
  await page.goto(path);
  await page.locator('section.docs-section, .sp-mobile-nav').first().waitFor({
    state: 'attached',
  });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}

const settled = async (page: Page) => {
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.waitForFunction(() => document.getAnimations().length === 0);
};

const readTokens = (page: Page): Promise<Tokens> =>
  page.evaluate(() => {
    const probe = document.createElement('i');
    probe.style.color = 'var(--brand-text)';
    probe.style.backgroundColor = 'var(--background)';
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const tokens = {
      brandText: style.color,
      background: style.backgroundColor,
      scrim: '',
      version: '',
    };
    probe.remove();
    return tokens;
  });

const decidedChanges = (tokens: Tokens) =>
  `#parity .pl-brand-text { color: ${tokens.brandText} !important }`;

async function mount(page: Page, kase: Case, side: Side, tokens: Tokens) {
  await page.evaluate(
    (spec) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      holder.style.cssText = `position:absolute;top:0;left:0;width:${spec.width}px;z-index:99999;background:${spec.background};${spec.holder}`;
      holder.innerHTML = spec.markup;
      document.body.append(holder);
      if (spec.holder === '')
        holder.style.height = `${Math.ceil(holder.getBoundingClientRect().height)}px`;
      holder.scrollTop = spec.scroll;
    },
    {
      markup: side === 'v3' ? kase.v3 : kase.v4,
      width: kase.width ?? WIDE,
      holder: kase.holder ?? '',
      scroll: kase.scroll ?? 0,
      background: tokens.background,
    },
  );
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await document.fonts.ready;
  });
}

const readStyles = (target: Locator, deep: boolean): Promise<Style[]> =>
  target.evaluate(
    (element, spec) => {
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
      const dropZeroBorders = (values: Record<string, string>) => {
        for (const side of ['top', 'right', 'bottom', 'left']) {
          if (values[`border-${side}-width`] !== '0px') continue;
          values[`border-${side}-style`] = 'none';
          values[`border-${side}-color`] = 'none';
        }
        return values;
      };
      const glyphProperties = [
        'font-family',
        'font-weight',
        'white-space',
        'flex-shrink',
      ];
      const origin = element.getBoundingClientRect();
      const read = (node: Element): Style => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        const shadow = style.boxShadow.replace(
          new RegExp(spec.colour, 'g'),
          '',
        );
        const values: Record<string, string> = {
          ...Object.fromEntries(
            spec.properties.map((name) => [name, style.getPropertyValue(name)]),
          ),
          ...Object.fromEntries(
            spec.colours.map((name) => [
              name,
              rgba(style.getPropertyValue(name)),
            ]),
          ),
          'rect-offset': `${(box.left - origin.left).toFixed(4)},${(box.top - origin.top).toFixed(4)}`,
          'shadow-geometry': shadow
            .split(',')
            .map((part) => part.trim().replace(/\s+/g, ' '))
            .filter(
              (part) =>
                part !== '' && part !== 'none' && part !== spec.noShadow,
            )
            .join(', '),
        };
        if (values['text-align'] === 'start') values['text-align'] = 'left';
        if (node.matches(spec.glyphs))
          for (const name of glyphProperties) values[name] = 'glyph';
        return {
          tag: node.tagName.toLowerCase(),
          values: dropZeroBorders(values),
        };
      };
      const nodes = spec.deep
        ? [element, ...element.querySelectorAll('*')]
        : [element];
      return nodes.map(read);
    },
    {
      properties: [...PROPERTIES],
      colours: [...COLOURS],
      colour: COLOUR.source,
      noShadow: '0px 0px 0px 0px',
      glyphs: GLYPHS,
      deep,
    },
  );

const shoot = (target: Locator) =>
  target.screenshot({ animations: 'disabled', caret: 'hide' });

async function capture(target: Locator, deep: boolean): Promise<Capture> {
  return {
    styles: await readStyles(target, deep),
    pixels: await shoot(target),
  };
}

const differingPixels = (page: Page, left: Buffer, right: Buffer) =>
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
        return -1;
      let count = 0;
      for (let index = 0; index < first.data.length; index += 4) {
        const differs = [0, 1, 2, 3].some(
          (offset) =>
            first.data[index + offset] !== second.data[index + offset],
        );
        if (differs) count += 1;
      }
      return count;
    },
    { left: left.toString('base64'), right: right.toString('base64') },
  );

function styleProblems(label: string, v3: Style[], v4: Style[]): string[] {
  if (v3.length !== v4.length)
    return [`${label}: ${v3.length} v3 elements, ${v4.length} v4 elements`];
  return v3.flatMap((left, index) =>
    Object.keys(left.values)
      .filter((key) => left.values[key] !== v4[index]?.values[key])
      .map(
        (key) =>
          `${label}[${index}] ${left.tag}/${v4[index]?.tag}: ${key} v3=${left.values[key]} v4=${v4[index]?.values[key]}`,
      ),
  );
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

async function compare(
  page: Page,
  testInfo: TestInfo,
  label: string,
  v3: Capture,
  v4: Capture,
  pixels = true,
): Promise<string[]> {
  const problems = styleProblems(label, v3.styles, v4.styles);
  if (!pixels) return problems;
  const differing = await differingPixels(page, v3.pixels, v4.pixels);
  if (differing === 0) return problems;
  await attach(testInfo, label, { expected: v3.pixels, actual: v4.pixels });
  return [...problems, `${label}: ${differing} pixels differ`];
}

async function steps(page: Page, kase: Case): Promise<Capture[]> {
  const holder = page.locator('#parity');
  const seen = [await capture(holder, true)];
  if (kase.hover !== undefined) {
    await page.locator(`#parity ${kase.hover}`).first().hover();
    await settled(page);
    seen.push(await capture(holder, true));
    await page.mouse.move(0, 0);
    await settled(page);
  }
  if (kase.focus !== undefined) {
    await page.locator(`#parity ${kase.focus}`).first().focus();
    await settled(page);
    seen.push(await capture(holder, true));
  }
  return seen;
}

async function observe(
  page: Page,
  kase: Case,
  side: Side,
  scheme: Scheme,
  tokens: Tokens,
) {
  const path = side === 'v3' ? V3_PAGE : specimenUrl(V4_PAGE, scheme);
  await open(page, path, scheme);
  const fresh = side === 'v4' ? await readTokens(page) : tokens;
  const decided = side === 'v3' ? decidedChanges(fresh) : '';
  await page.addStyleTag({
    content: `${SHARED_CSS}\n${GLYPHS} { visibility: hidden !important }\n${decided}`,
  });
  await mount(page, kase, side, fresh);
  return { seen: await steps(page, kase), tokens: fresh };
}

const EMPTY_TOKENS: Tokens = {
  brandText: '',
  background: '',
  scrim: '',
  version: '',
};

async function runCase(page: Page, testInfo: TestInfo, kase: Case) {
  const scheme = schemeOf(testInfo);
  await page.setViewportSize({ width: kase.width ?? WIDE, height: 900 });
  const v4 = await observe(page, kase, 'v4', scheme, EMPTY_TOKENS);
  const v3 = await observe(page, kase, 'v3', scheme, v4.tokens);
  const problems: string[] = [];
  for (const [index, left] of v3.seen.entries()) {
    const right = v4.seen[index];
    if (right === undefined) throw new Error('missing step');
    const pixels = index === 0 || kase.hoverPixels !== false;
    problems.push(
      ...(await compare(
        page,
        testInfo,
        `${kase.name}#${index}`,
        left,
        right,
        pixels,
      )),
    );
  }
  expect(problems.slice(0, MAX_LINES)).toEqual([]);
}

for (const kase of CASES) {
  test(`page-layout-parity/${kase.name}`, async ({ page }, testInfo) => {
    await runCase(page, testInfo, kase);
  });
}

async function themeToggleMarkup(page: Page): Promise<string> {
  const section = page.locator('section.docs-section').filter({
    has: page.locator('h2.docs-section-title', { hasText: /^Admin Layout$/ }),
  });
  const button = section.locator('button[aria-label^="Switch to"]').first();
  return button.evaluate((element) => element.outerHTML);
}

test('page-layout-parity/theme-toggle', async ({ page }, testInfo) => {
  const scheme = schemeOf(testInfo);
  await page.setViewportSize({ width: WIDE, height: 900 });
  await open(page, V3_PAGE, scheme);
  const source = await themeToggleMarkup(page);
  const pair = (disabled: boolean, markup: string) =>
    `<div style="display:flex;gap:24px;padding:12px">${markup}${markup.replace('<button', `<button${disabled ? ' disabled' : ''}`)}</div>`;
  await runCase(page, testInfo, {
    name: 'theme-toggle',
    hover: 'button:not([disabled])',
    focus: 'button:not([disabled])',
    v3: pair(true, source),
    v4: pair(true, THEME_TOGGLE_V4),
  });
});

type Part = {
  name: string;
  v3: string;
  v4: string;
  state: 'closed' | 'open';
  deep?: boolean;
  pixels?: boolean;
};

const BAR = ':scope > header';
const DRAWER = ':scope > aside';
const PARTS: readonly Part[] = [
  { name: 'bar', v3: BAR, v4: '.sp-mobile-nav-bar', state: 'closed' },
  {
    name: 'toggle',
    v3: `${BAR} > button`,
    v4: '.sp-mobile-nav-toggle',
    state: 'closed',
  },
  {
    name: 'brand',
    v3: `${BAR} > div`,
    v4: '.sp-mobile-nav-bar .sp-mobile-nav-brand',
    state: 'closed',
  },
  {
    name: 'scrim',
    v3: ':scope > div',
    v4: '.sp-mobile-nav-scrim',
    state: 'open',
    deep: false,
    pixels: false,
  },
  {
    name: 'drawer',
    v3: DRAWER,
    v4: '.sp-mobile-nav-drawer',
    state: 'open',
    deep: false,
    pixels: false,
  },
  {
    name: 'drawer-header',
    v3: `${DRAWER} > div:first-child`,
    v4: '.sp-mobile-nav-drawer-header',
    state: 'open',
  },
  {
    name: 'drawer-version',
    v3: `${DRAWER} > div:nth-child(2)`,
    v4: '.sp-mobile-nav-drawer-version',
    state: 'open',
  },
  {
    name: 'active-link',
    v3: `${DRAWER} nav a[aria-current="page"]`,
    v4: '.sp-mobile-nav-link[aria-current="page"]',
    state: 'open',
  },
  {
    name: 'link',
    v3: `${DRAWER} nav a:not([aria-current])`,
    v4: 'a.sp-mobile-nav-link:not([aria-current])',
    state: 'open',
  },
  {
    name: 'extras',
    v3: `${DRAWER} nav > div`,
    v4: '.sp-mobile-nav-extras',
    state: 'open',
    pixels: false,
  },
  {
    name: 'cookie-settings',
    v3: `${DRAWER} nav > div button:nth-of-type(2)`,
    v4: '.sp-mobile-nav-extras button:nth-of-type(2)',
    state: 'open',
  },
  {
    name: 'footer',
    v3: `${DRAWER} > div:last-child`,
    v4: '.sp-mobile-nav-footer',
    state: 'open',
  },
];

type NavStates = Record<Part['state'], Map<string, Capture>>;

const navRoot = (page: Page, side: Side): Locator =>
  side === 'v3'
    ? page
        .locator('div.md\\:hidden')
        .filter({ has: page.getByLabel('Toggle navigation menu') })
    : page.locator('.sp-mobile-nav');

async function observeParts(page: Page, side: Side, state: Part['state']) {
  const root = navRoot(page, side);
  const found = new Map<string, Capture>();
  for (const part of PARTS.filter((entry) => entry.state === state)) {
    const target = root.locator(side === 'v3' ? part.v3 : part.v4).first();
    found.set(part.name, await capture(target, part.deep !== false));
  }
  return found;
}

async function openDrawer(page: Page, side: Side) {
  const root = navRoot(page, side);
  if (side === 'v3') await root.getByLabel('Toggle navigation menu').click();
  else
    await root.evaluate((element) =>
      element.setAttribute('data-state', 'open'),
    );
  await settled(page);
  await page.mouse.move(0, 0);
}

async function applyNavDecisions(
  page: Page,
  side: Side,
  scheme: Scheme,
  tokens: Tokens,
) {
  if (side === 'v3') {
    await navRoot(page, 'v3')
      .locator(':scope > div')
      .evaluate((element, scrim) => {
        element.style.setProperty('background-color', scrim, 'important');
      }, tokens.scrim);
    return;
  }
  await page.evaluate(
    (spec) => {
      for (const node of document.querySelectorAll(
        '.sp-mobile-nav-version, .sp-mobile-nav-drawer-version',
      ))
        node.textContent = spec.version;
      const theme = document.querySelector('.sp-mobile-nav-extras button');
      if (theme?.lastChild)
        theme.lastChild.textContent = `Theme: ${spec.scheme}`;
    },
    { version: tokens.version, scheme },
  );
}

async function hideClosedDrawer(page: Page, side: Side, hidden: boolean) {
  if (side === 'v4') return;
  await navRoot(page, 'v3')
    .locator(':scope > aside')
    .evaluate((element, value) => {
      element.style.visibility = value ? 'hidden' : '';
    }, hidden);
}

async function observeNav(
  page: Page,
  side: Side,
  scheme: Scheme,
  tokens: Tokens,
): Promise<NavStates> {
  const path = side === 'v3' ? V3_HOME : specimenUrl(V4_NAV, scheme);
  await open(page, path, scheme);
  await page.addStyleTag({
    content: `${GLYPHS} { visibility: hidden !important }`,
  });
  await applyNavDecisions(page, side, scheme, tokens);
  await hideClosedDrawer(page, side, true);
  const closed = await observeParts(page, side, 'closed');
  await hideClosedDrawer(page, side, false);
  await openDrawer(page, side);
  return { closed, open: await observeParts(page, side, 'open') };
}

async function readNavTokens(page: Page, scheme: Scheme): Promise<Tokens> {
  await open(page, specimenUrl(V4_NAV, scheme), scheme);
  const scrim = await page
    .locator('.sp-mobile-nav-scrim')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await open(page, V3_HOME, scheme);
  const version = await page
    .locator('div.md\\:hidden header span.font-mono')
    .first()
    .innerText();
  return { ...(await readTokens(page)), scrim, version };
}

async function navProblems(
  page: Page,
  testInfo: TestInfo,
  v3: NavStates,
  v4: NavStates,
) {
  const problems: string[] = [];
  for (const part of PARTS) {
    const left = v3[part.state].get(part.name);
    const right = v4[part.state].get(part.name);
    if (left === undefined || right === undefined) throw new Error(part.name);
    const label = `mobile-nav/${part.name}`;
    problems.push(
      ...(await compare(
        page,
        testInfo,
        label,
        left,
        right,
        part.pixels !== false,
      )),
    );
  }
  return problems;
}

test('page-layout-parity/mobile-nav', async ({ page }, testInfo) => {
  const scheme = schemeOf(testInfo);
  await page.setViewportSize({ width: NARROW, height: 800 });
  const tokens = await readNavTokens(page, scheme);
  const v3 = await observeNav(page, 'v3', scheme, tokens);
  const v4 = await observeNav(page, 'v4', scheme, tokens);
  const problems = await navProblems(page, testInfo, v3, v4);
  expect(problems.slice(0, MAX_LINES)).toEqual([]);
});
