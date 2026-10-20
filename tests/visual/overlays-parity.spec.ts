import { writeFile } from 'node:fs/promises';
import type { Locator, Page, TestInfo } from '@playwright/test';
import type { Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
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
const PLACEHOLDER = 'color-mix(in oklab, currentcolor 65%, transparent)';
const DESTRUCTIVE_V3 = '[role="menuitem"][style*="--color-error"]';

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
    pixels: await copy.screenshot({ animations: 'disabled', caret: 'hide' }),
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

async function observeV3(
  page: Page,
  items: readonly Case[],
  scheme: Scheme,
  errorText: string,
) {
  const seen = new Map<string, Observed>();
  for (const item of items) {
    await open(page, '/interactive', scheme);
    await page.addStyleTag({
      content: `${PANEL} :is(${GLYPHS}) { visibility: hidden !important }\n${PANEL} ${DESTRUCTIVE_V3} { color: ${errorText} !important }\n${PANEL} ::placeholder { color: ${PLACEHOLDER} }`,
    });
    seen.set(item.name, await observe(page, await item.open(page), item));
  }
  return seen;
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

function entryProblems(name: string, index: number, v3: Entry, v4: Entry) {
  const where = `${name} #${index} <${v3.tag}>`;
  const found = Object.keys(v3.style)
    .filter((key) => v3.style[key] !== v4.style[key])
    .map((key) => `${where} ${key} v3=${v3.style[key]} v4=${v4.style[key]}`);
  if (v3.tag !== v4.tag) found.push(`${where} tag v3=${v3.tag} v4=${v4.tag}`);
  if (v3.text !== v4.text)
    found.push(`${where} text v3=${v3.text} v4=${v4.text}`);
  if (v3.rect !== v4.rect)
    found.push(`${where} rect v3=${v3.rect} v4=${v4.rect}`);
  return found;
}

function treeProblems(name: string, v3: Entry[], v4: Entry[]) {
  if (v3.length !== v4.length)
    return [`${name}: ${v3.length} elements in v3, ${v4.length} in v4`];
  return v3.flatMap((entry, index) =>
    entryProblems(name, index, entry, v4[index] ?? entry),
  );
}

const sideProblems = (name: string, v3: Observed, v4: Observed) => {
  const found = treeProblems(name, v3.tree, v4.tree);
  if (JSON.stringify(v3.shadow) !== JSON.stringify(v4.shadow))
    found.push(`${name}: shadow v3=${v3.shadow} v4=${v4.shadow}`);
  if (JSON.stringify(v3.overlay) !== JSON.stringify(v4.overlay))
    found.push(
      `${name}: overlay v3=${JSON.stringify(v3.overlay)} v4=${JSON.stringify(v4.overlay)}`,
    );
  return found;
};

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
    const v3 = await observeV3(page, items, scheme, v4.errorText);
    const problems: string[] = [];
    for (const item of items) {
      const seen = {
        v3: lookup(v3, item.name),
        v4: lookup(v4.seen, item.name),
      };
      problems.push(...sideProblems(item.name, seen.v3, seen.v4));
      const differing = await differingPixels(
        page,
        seen.v3.pixels,
        seen.v4.pixels,
      );
      if (differing === 0) continue;
      problems.push(`${item.name}: ${differing} pixels differ`);
      await attach(testInfo, item.name, {
        expected: seen.v3.pixels,
        actual: seen.v4.pixels,
      });
    }
    expect(problems).toEqual([]);
  });
}
