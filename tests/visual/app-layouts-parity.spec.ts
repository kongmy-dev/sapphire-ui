import { writeFile } from 'node:fs/promises';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { GATE_CASES, type GateCase } from './app-layouts-pairs';
import { expect, test } from './fixtures';

const V3_PAGE = '/layouts';
const SPLIT = 'components/split-layout/split-layout.examples.html';
const WIZARD = 'components/wizard-layout/wizard-layout.examples.html';
const TABS =
  'components/vertical-tabs-layout/vertical-tabs-layout.examples.html';
const GATE = 'components/passphrase-gate/passphrase-gate.examples.html';
const GLYPHS = '.material-symbols-outlined';
const WIDE = 1280;
const NARROW = 500;
const CORNER_PX = 8;
const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const NO_SHADOW = /^(?:0px ){3}0px$/;
const MAX_LINES = 40;
const MODAL_TOLERANCE = 3;
const INLINE_TOLERANCE = 1;
const SPLIT_TOLERANCE = 2;

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
  'min-height',
  'max-width',
  'margin-top',
  'margin-bottom',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-bottom-width',
  'border-top-style',
  'border-bottom-style',
  'border-top-left-radius',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
  'flex-direction',
  'flex-grow',
  'flex-shrink',
  'align-items',
  'justify-content',
  'column-gap',
  'text-align',
  'opacity',
  'backdrop-filter',
  'cursor',
  'pointer-events',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-bottom-color',
] as const;

type Style = { tag: string; values: Record<string, string> };
type Capture = { styles: Style[]; pixels: Buffer };
type Side = 'v3' | 'v4';
type Decisions = { errorText: string; fieldBackground: string } | null;
type Box = { x: number; y: number; width: number; height: number };

const schemeOf = (testInfo: TestInfo): Scheme => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};

async function open(page: Page, path: string, scheme: Scheme) {
  await page.goto(path);
  await page
    .locator('section.docs-section')
    .first()
    .waitFor({ state: 'attached' });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}

const settled = async (page: Page) => {
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.waitForFunction(() => document.getAnimations().length === 0);
};

const v3Section = (page: Page, title: RegExp): Locator =>
  page.locator('section.docs-section').filter({
    has: page.locator('h2.docs-section-title', { hasText: title }),
  });

const differingPixels = (
  page: Page,
  left: Buffer,
  right: Buffer,
  tolerance = 0,
) =>
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
            Math.abs(
              (first.data[index + offset] ?? 0) -
                (second.data[index + offset] ?? 0),
            ) > images.tolerance,
        );
        if (differs) count += 1;
      }
      return count;
    },
    {
      left: left.toString('base64'),
      right: right.toString('base64'),
      tolerance,
    },
  );

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

async function comparePixels(
  page: Page,
  testInfo: TestInfo,
  label: string,
  v3: Buffer,
  v4: Buffer,
  tolerance = 0,
): Promise<string[]> {
  const differing = await differingPixels(page, v3, v4, tolerance);
  if (differing === 0) return [];
  await attach(testInfo, label, { expected: v3, actual: v4 });
  return [`${label}: ${differing} pixels differ (tolerance ${tolerance})`];
}

const readStyles = (target: Locator): Promise<Style[]> =>
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
      const origin = element.getBoundingClientRect();
      const read = (node: Element): Style => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
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
          rect: [
            box.left - origin.left,
            box.top - origin.top,
            box.width,
            box.height,
          ]
            .map((part) => part.toFixed(3))
            .join(','),
          shadow: style.boxShadow.replace(new RegExp(spec.colour, 'g'), ''),
        };
        if (values['text-align'] === 'start') values['text-align'] = 'left';
        if (Number.parseFloat(values['border-top-left-radius'] ?? '') >= 999)
          values['border-top-left-radius'] = 'pill';
        for (const side of ['top', 'bottom']) {
          if (values[`border-${side}-width`] !== '0px') continue;
          values[`border-${side}-style`] = 'none';
          values[`border-${side}-color`] = 'none';
        }
        return { tag: node.tagName.toLowerCase(), values };
      };
      return [element, ...element.querySelectorAll('*')].map(read);
    },
    {
      properties: [...PROPERTIES],
      colours: [...COLOURS],
      colour: COLOUR.source,
    },
  );

const shoot = (target: Locator) =>
  target.screenshot({ animations: 'disabled', caret: 'hide' });

async function capture(target: Locator): Promise<Capture> {
  return { styles: await readStyles(target), pixels: await shoot(target) };
}

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

async function mount(
  page: Page,
  markup: string,
  spec: { width: number; height: number },
) {
  await page.evaluate(
    (input) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      holder.style.cssText = `position:absolute;top:0;left:0;z-index:99999;overflow:hidden;contain:layout;background:#fff;width:${input.width}px;height:${input.height}px`;
      holder.innerHTML = input.markup;
      document.body.append(holder);
    },
    { markup, ...spec },
  );
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await document.fonts.ready;
  });
}

async function steps(page: Page, kase: GateCase): Promise<Capture[]> {
  const holder = page.locator('#parity');
  const seen = [await capture(holder)];
  if (kase.hover !== undefined) {
    await page.locator(`#parity ${kase.hover}`).first().hover();
    await settled(page);
    seen.push(await capture(holder));
    await page.mouse.move(0, 0);
    await settled(page);
  }
  if (kase.focus !== undefined) {
    await page.locator(`#parity ${kase.focus}`).first().focus();
    await settled(page);
    seen.push(await capture(holder));
  }
  return seen;
}

const readDecisions = (page: Page): Promise<Decisions> =>
  page.evaluate(() => {
    const error = document.querySelector('.sp-passphrase-gate-error');
    const input = document.querySelector('.sp-passphrase-gate-input');
    if (error === null || input === null) return null;
    return {
      errorText: getComputedStyle(error).color,
      fieldBackground: getComputedStyle(input).backgroundColor,
    };
  });

async function observeGate(
  page: Page,
  kase: GateCase,
  side: Side,
  scheme: Scheme,
  decisions: Decisions,
  isFirstSide: boolean,
) {
  await page.setViewportSize({ width: kase.viewport ?? WIDE, height: 900 });
  await open(page, side === 'v3' ? V3_PAGE : specimenUrl(GATE, scheme), scheme);
  if (decisions !== null && !isFirstSide)
    await page.addStyleTag({
      content: `#parity .gate-err { color: ${decisions.errorText} !important } #parity .gate input { background-color: ${decisions.fieldBackground} !important }`,
    });
  await mount(page, side === 'v3' ? kase.v3 : kase.v4, kase);
  const read = isFirstSide ? await readDecisions(page) : null;
  return { seen: await steps(page, kase), read };
}

for (const kase of GATE_CASES) {
  test(`app-layouts-parity/${kase.name}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    const v4 = await observeGate(page, kase, 'v4', scheme, null, true);
    const v3 = await observeGate(page, kase, 'v3', scheme, v4.read, false);
    const problems: string[] = [];
    for (const [index, left] of v3.seen.entries()) {
      const right = v4.seen[index];
      if (right === undefined) throw new Error('missing step');
      const label = `${kase.name}#${index}`;
      problems.push(
        ...styleProblems(label, left.styles, right.styles),
        ...(await comparePixels(
          page,
          testInfo,
          label,
          left.pixels,
          right.pixels,
          kase.tolerance,
        )),
      );
    }
    expect(problems.slice(0, MAX_LINES)).toEqual([]);
  });
}

const finishAnimations = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    ),
  );

const shadowGeometry = (shadow: string): string[] =>
  shadow
    .replace(COLOUR, '')
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter((part) => part !== '' && !NO_SHADOW.test(part));

async function observeDialog(page: Page, panel: Locator, overlay: Locator) {
  const box = await panel.boundingBox();
  if (box === null) throw new Error('the dialog has no box');
  const read = await panel.evaluate((element) => {
    const style = getComputedStyle(element);
    return { radius: style.borderRadius, shadow: style.boxShadow };
  });
  const scrim = await overlay.evaluate(
    (element, pseudo) => {
      const style = getComputedStyle(element, pseudo);
      return {
        background: style.backgroundColor,
        filter: style.backdropFilter,
      };
    },
    await overlay.evaluate((element) =>
      element instanceof HTMLDialogElement ? '::backdrop' : null,
    ),
  );
  const footer = await panel.evaluate((element) =>
    [...element.querySelectorAll('button')]
      .filter((button) =>
        /^(?:Back|Next)$/.test(button.textContent?.trim() ?? ''),
      )
      .map((button) => {
        const rect = button.getBoundingClientRect();
        const origin = element.getBoundingClientRect();
        return [rect.x - origin.x, rect.y - origin.y, rect.width, rect.height];
      }),
  );
  const focus = await page.evaluate(
    () => document.activeElement?.textContent?.trim() ?? '',
  );
  const pixels = await page.screenshot({
    clip: {
      x: box.x + CORNER_PX,
      y: box.y + CORNER_PX,
      width: box.width - CORNER_PX * 2,
      height: box.height - CORNER_PX * 2,
    },
    mask: [
      panel.getByRole('button', { name: 'Close' }),
      panel.getByRole('button', { name: 'Next' }).locator('xpath=..'),
    ],
    animations: 'disabled',
    caret: 'hide',
  });
  return {
    box,
    footer,
    shape: { radius: read.radius, shadow: shadowGeometry(read.shadow) },
    scrim,
    focus,
    pixels,
  };
}

async function modalV3(page: Page, scheme: Scheme, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await open(page, V3_PAGE, scheme);
  await page.getByRole('button', { name: 'Launch Modal Wizard' }).click();
  const panel = page.getByRole('dialog');
  await panel.waitFor();
  await finishAnimations(page);
  return observeDialog(
    page,
    panel,
    panel.locator('xpath=preceding-sibling::*[1]'),
  );
}

async function modalV4(page: Page, scheme: Scheme, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await open(page, specimenUrl(WIZARD, scheme), scheme);
  await page.evaluate(() => {
    const element = document.getElementById('wizard-dialog');
    if (!(element instanceof HTMLDialogElement)) throw new Error('no dialog');
    const launch = element.previousElementSibling;
    if (launch === null) throw new Error('no launch button');
    launch.addEventListener('click', () => element.showModal());
  });
  await page.getByRole('button', { name: 'Launch Modal Wizard' }).click();
  const panel = page.locator('#wizard-dialog');
  await finishAnimations(page);
  return observeDialog(page, panel, panel);
}

for (const [name, width] of [
  ['wizard-modal', WIDE],
  ['wizard-modal-narrow', NARROW],
] as const) {
  test(`app-layouts-parity/${name}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    const v3 = await modalV3(page, scheme, width);
    const v4 = await modalV4(page, scheme, width);
    const problems = await comparePixels(
      page,
      testInfo,
      name,
      v3.pixels,
      v4.pixels,
      MODAL_TOLERANCE,
    );
    expect(v4.box).toEqual(v3.box);
    expect(v4.footer).toEqual(v3.footer);
    expect(v4.shape).toEqual(v3.shape);
    expect(v4.scrim).toEqual(v3.scrim);
    expect(v4.focus).toEqual(v3.focus);
    expect(problems).toEqual([]);
  });
}

const INLINE_V3 =
  'flex min-h-[500px] flex-col overflow-hidden rounded-md border border-border bg-background font-sans';
const FULLSCREEN_V3 =
  'fixed inset-0 z-50 flex flex-col bg-background font-sans';

async function harvestWizardBody(page: Page, scheme: Scheme): Promise<string> {
  await page.setViewportSize({ width: WIDE, height: 900 });
  await open(page, V3_PAGE, scheme);
  await page.getByRole('button', { name: 'Launch Modal Wizard' }).click();
  const panel = page.getByRole('dialog');
  await panel.waitFor();
  return panel.evaluate((element) =>
    [1, 2].map((index) => element.children[index]?.outerHTML ?? '').join(''),
  );
}

async function wizardRoot(page: Page, side: Side, mode: string, body: string) {
  const root =
    side === 'v3'
      ? `<div class="${mode === 'inline' ? INLINE_V3 : FULLSCREEN_V3}">${body}</div>`
      : await page.evaluate((value) => {
          const source = document.querySelector(
            '.sp-wizard-layout[data-mode="inline"]',
          );
          if (source === null) throw new Error('no inline wizard');
          const copy = source.cloneNode(true);
          if (!(copy instanceof HTMLElement)) throw new Error('not an element');
          copy.dataset.mode = value;
          return copy.outerHTML;
        }, mode);
  const height = mode === 'inline' ? 640 : 560;
  await mount(page, root, { width: 900, height });
  const holder = page.locator('#parity');
  return mode === 'inline' ? holder.locator(':scope > *').first() : holder;
}

for (const mode of ['inline', 'fullscreen'] as const) {
  test(`app-layouts-parity/wizard-${mode}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    const body = await harvestWizardBody(page, scheme);
    await open(page, V3_PAGE, scheme);
    const v3 = await shoot(await wizardRoot(page, 'v3', mode, body));
    await open(page, specimenUrl(WIZARD, scheme), scheme);
    const v4 = await shoot(await wizardRoot(page, 'v4', mode, body));
    expect(
      await comparePixels(
        page,
        testInfo,
        `wizard-${mode}`,
        v3,
        v4,
        INLINE_TOLERANCE,
      ),
    ).toEqual([]);
  });
}

type Rects = Record<string, Box>;

const readSplit = (frame: Locator): Promise<Rects> =>
  frame.evaluate((element) => {
    const origin = element.getBoundingClientRect();
    const rectOf = (selector: string): Box => {
      const target = element.querySelector(selector);
      if (target === null) throw new Error(selector);
      const box = target.getBoundingClientRect();
      return {
        x: box.left - origin.left,
        y: box.top - origin.top,
        width: box.width,
        height: box.height,
      };
    };
    const separator = '[role="separator"]';
    return {
      frame: { x: 0, y: 0, width: origin.width, height: origin.height },
      first: rectOf(`[data-panel], .sp-split-layout-panel`),
      separator: rectOf(separator),
      grip: rectOf(`${separator} > div`),
    };
  });

test('app-layouts-parity/split-layout', async ({ page }, testInfo) => {
  const scheme = schemeOf(testInfo);
  await open(page, V3_PAGE, scheme);
  await page.addStyleTag({ content: `${GLYPHS} { visibility: hidden }` });
  const v3Frame = v3Section(page, /^Split Layout \(Draggable\)$/).locator(
    '.docs-preview > div',
  );
  const v3Rects = await readSplit(v3Frame);
  const v3Pixels = await shoot(v3Frame);
  await open(page, specimenUrl(SPLIT, scheme), scheme);
  await page.addStyleTag({
    content: '.sp-split-layout-grip > .sp-icon { visibility: hidden }',
  });
  const v4Frame = page.locator('.docs-split-frame');
  const v4Rects = await readSplit(v4Frame);
  const v4Pixels = await shoot(v4Frame);
  expect(v4Rects).toEqual(v3Rects);
  expect(
    await comparePixels(
      page,
      testInfo,
      'split-layout',
      v3Pixels,
      v4Pixels,
      SPLIT_TOLERANCE,
    ),
  ).toEqual([]);
});

const readTabs = (root: Locator) =>
  root.evaluate((element) => {
    const list = element.querySelector('[role="tablist"]');
    const panel = element.querySelector('[role="tabpanel"]:not([hidden])');
    if (list === null || panel === null) throw new Error('no tabs');
    const style = getComputedStyle(panel);
    return {
      list: list.getBoundingClientRect().width,
      padding: [style.paddingLeft, style.paddingRight],
      margin: style.marginTop,
      minHeight: getComputedStyle(element).minHeight,
    };
  });

for (const width of [NARROW, 700, WIDE]) {
  test(`app-layouts-parity/vertical-tabs-${width}`, async ({
    page,
  }, testInfo) => {
    const scheme = schemeOf(testInfo);
    await page.setViewportSize({ width, height: 900 });
    await open(page, V3_PAGE, scheme);
    const v3 = await readTabs(
      v3Section(page, /^Vertical Tabs Layout$/)
        .locator('[data-orientation]')
        .first(),
    );
    await open(page, specimenUrl(TABS, scheme), scheme);
    const v4 = await readTabs(page.locator('.sp-vertical-tabs-layout'));
    expect(v4).toEqual(v3);
  });
}
