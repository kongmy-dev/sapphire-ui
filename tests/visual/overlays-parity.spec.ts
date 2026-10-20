import type { Locator, Page } from '@playwright/test';
import type { Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { captureState } from './capture-state';
import { expect, test } from './fixtures';
import {
  CASES,
  type Case,
  GROUPS,
  type Kind,
  SPECIMENS,
  schemeOf,
} from './overlays-cases';

const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const NO_SHADOW = /^(?:0px ){3}0px$/;
const PANEL = '[data-parity-panel]';
const COVER_ID = 'parity-cover';
const HOLDER_ID = 'parity-holder';
const GLYPHS = 'svg, .material-symbols-outlined, .sp-command-palette-icon';
const POINTER = { x: 1275, y: 715 };
const PILL_RADIUS = 9999;
const GLYPH_TYPOGRAPHY = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'white-space',
  'overflow-x',
  'overflow-y',
] as const;
const KBD_SKIPPED = ['line-height'] as const;
const HIGHLIGHTED = '[data-highlighted]';
const PROPERTIES = [
  'display',
  'position',
  'flex-direction',
  'flex-grow',
  'flex-shrink',
  'align-items',
  'justify-content',
  'gap',
  'width',
  'height',
  'min-width',
  'max-width',
  'max-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'top',
  'right',
  'bottom',
  'left',
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
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
  'text-align',
  'text-decoration-line',
  'white-space',
  'list-style-type',
  'opacity',
  'cursor',
  'translate',
  'overflow-x',
  'overflow-y',
  'user-select',
  'pointer-events',
  'z-index',
  'box-sizing',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
] as const;
type Entry = {
  tag: string;
  text: string;
  rect: string;
  style: Record<string, string>;
};
type Overlay = {
  filter: string;
  alpha: string;
  position: string;
  inset: string;
};
type Observed = {
  tree: Entry[];
  shadow: string[];
  overlay: Overlay | null;
  pixels: Buffer;
};
async function open(page: Page, path: string, scheme: Scheme) {
  await page.goto(path);
  await page.locator('section.docs-section').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}
const settle = (page: Page) =>
  page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    );
  });
const shadowGeometry = (shadow: string): string[] =>
  shadow
    .replace(COLOUR, '')
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter((part) => part !== '' && !NO_SHADOW.test(part));
const mount = (panel: Locator, kind: Kind) =>
  panel.evaluate(
    (element, spec) => {
      for (const old of document.querySelectorAll(spec.stale)) old.remove();
      const cover = document.createElement('div');
      cover.id = spec.cover;
      cover.style.cssText = 'position:fixed;inset:0;background:#f0f;z-index:49';
      const holder = document.createElement('div');
      holder.id = spec.holder;
      holder.style.cssText =
        'position:fixed;top:24px;left:24px;width:max-content;z-index:50;will-change:transform';
      const copy = element.cloneNode(true);
      if (!(copy instanceof Element)) throw new Error('cannot clone');
      copy.setAttribute(spec.mark, '');
      copy.normalize();
      document.body.append(cover, holder);
      (spec.kind === 'floating' ? holder : document.body).append(copy);
      element.remove();
    },
    {
      cover: COVER_ID,
      holder: HOLDER_ID,
      mark: PANEL.slice(1, -1),
      stale: `#${COVER_ID}, #${HOLDER_ID}, ${PANEL}`,
      kind,
    },
  );
const readOverlay = (panel: Locator): Promise<Overlay> =>
  panel.locator('xpath=preceding-sibling::*[1]').evaluate((element) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context === null) throw new Error('no 2d context');
    const style = getComputedStyle(element);
    context.fillStyle = style.backgroundColor;
    context.fillRect(0, 0, 1, 1);
    return {
      filter: style.backdropFilter,
      alpha: String(context.getImageData(0, 0, 1, 1).data[3]),
      position: style.position,
      inset: [style.top, style.right, style.bottom, style.left].join(' '),
    };
  });
const readTree = (panel: Locator): Promise<Entry[]> =>
  panel.evaluate(
    (root, wanted) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context === null) throw new Error('no 2d context');
      const resolve = (value: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#000';
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        return context.getImageData(0, 0, 1, 1).data.join(',');
      };
      const colourOf = (computed: CSSStyleDeclaration, name: string) => {
        const width = computed.getPropertyValue(name.replace('color', 'width'));
        const hidden =
          name.startsWith('border-') && !(Number.parseFloat(width) > 0);
        return hidden ? 'none' : resolve(computed.getPropertyValue(name));
      };
      const styleValue = (computed: CSSStyleDeclaration, name: string) => {
        const value = computed.getPropertyValue(name);
        if (name.endsWith('-radius') && Number.parseFloat(value) >= wanted.pill)
          return `${wanted.pill}px`;
        const laidOut = /flex|grid/.test(computed.display);
        return name.endsWith('gap') && !laidOut ? 'none' : value;
      };
      const textOf = (element: Element) =>
        element.matches(wanted.glyphs)
          ? ''
          : [...element.childNodes]
              .filter((node) => node.nodeType === Node.TEXT_NODE)
              .map((node) => node.textContent ?? '')
              .join('')
              .trim();
      const origin = root.getBoundingClientRect();
      const rectOf = (element: Element) => {
        const box = element.getBoundingClientRect();
        return [
          box.left - origin.left,
          box.top - origin.top,
          box.width,
          box.height,
        ]
          .map((value) => Math.round(value * 100) / 100)
          .join(',');
      };
      const skippedFor = (element: Element): string[] => {
        if (element.matches(wanted.glyphs)) return wanted.glyphTypography;
        return element.matches('kbd') ? wanted.kbdSkipped : [];
      };
      const describe = (element: Element) => {
        const computed = getComputedStyle(element);
        const skipped = skippedFor(element);
        const style: Record<string, string> = {};
        for (const name of wanted.properties)
          style[name] = skipped.includes(name)
            ? 'skipped'
            : styleValue(computed, name);
        for (const name of wanted.colours)
          style[name] = colourOf(computed, name);
        return {
          tag: element.matches(wanted.glyphs)
            ? 'glyph'
            : element.tagName.toLowerCase(),
          text: textOf(element),
          rect: rectOf(element),
          style,
        };
      };
      return [root, ...root.querySelectorAll('*')]
        .filter(
          (element) =>
            !(element instanceof SVGElement) ||
            element.matches('.sp-command-palette-icon'),
        )
        .map(describe);
    },
    {
      properties: [...PROPERTIES],
      colours: [...COLOURS],
      glyphs: GLYPHS,
      glyphTypography: [...GLYPH_TYPOGRAPHY],
      kbdSkipped: [...KBD_SKIPPED],
      pill: PILL_RADIUS,
    },
  );
async function observe(
  page: Page,
  panel: Locator,
  item: Case,
): Promise<Observed> {
  await settle(page);
  const overlay = item.group === 'sheet' ? await readOverlay(panel) : null;
  await mount(panel, item.kind);
  await page.mouse.move(POINTER.x, POINTER.y);
  const copy = page.locator(PANEL);
  const highlighted = copy.locator(HIGHLIGHTED);
  if ((await highlighted.count()) > 0) await highlighted.first().focus();
  await settle(page);
  const shadow = await copy.evaluate(
    (element) => getComputedStyle(element).boxShadow,
  );
  return {
    tree: await readTree(copy),
    shadow: shadowGeometry(shadow),
    overlay,
    pixels: await captureState(copy, { animations: 'disabled', caret: 'hide' }),
  };
}
const readErrorText = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const probe = document.createElement('i');
    probe.style.color = 'var(--error-text)';
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  });
async function observeV4(
  page: Page,
  items: readonly Case[],
  scheme: Scheme,
  group: (typeof GROUPS)[number],
) {
  await open(page, specimenUrl(SPECIMENS[group], scheme), scheme);
  await page.addStyleTag({
    content: `${PANEL} :is(${GLYPHS}) { visibility: hidden !important }`,
  });
  const seen = new Map<string, Observed>();
  for (const item of items)
    seen.set(item.name, await observe(page, page.locator(item.v4), item));
  return { seen, errorText: await readErrorText(page) };
}
const lookup = (seen: Map<string, Observed>, name: string): Observed => {
  const found = seen.get(name);
  if (found === undefined) throw new Error(name);
  return found;
};
for (const group of GROUPS) {
  test(`overlays-parity/${group}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    const items = CASES.filter((item) => item.group === group);
    const v4 = await observeV4(page, items, scheme, group);
    for (const item of items)
      expect(lookup(v4.seen, item.name).tree.length).toBeGreaterThan(0);
  });
}
