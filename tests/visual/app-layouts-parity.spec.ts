import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { GATE_CASES, type GateCase } from './app-layouts-pairs';
import { captureState } from './capture-state';
import { expect, test } from './fixtures';

const SPLIT = 'components/split-layout/split-layout.examples.html';
const WIZARD = 'components/wizard-layout/wizard-layout.examples.html';
const TABS =
  'components/vertical-tabs-layout/vertical-tabs-layout.examples.html';
const GATE = 'components/passphrase-gate/passphrase-gate.examples.html';
const WIDE = 1280;
const NARROW = 500;
const CORNER_PX = 8;
const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const NO_SHADOW = /^(?:0px ){3}0px$/;
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
type Style = {
  tag: string;
  values: Record<string, string>;
};
type Capture = {
  styles: Style[];
  pixels: Buffer;
};
type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};
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
  captureState(target, { animations: 'disabled', caret: 'hide' });
async function capture(target: Locator): Promise<Capture> {
  return { styles: await readStyles(target), pixels: await shoot(target) };
}
async function mount(
  page: Page,
  markup: string,
  spec: {
    width: number;
    height: number;
  },
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
async function observeGate(page: Page, kase: GateCase, scheme: Scheme) {
  await page.setViewportSize({ width: kase.viewport ?? WIDE, height: 900 });
  await open(page, specimenUrl(GATE, scheme), scheme);
  await mount(page, kase.v4, kase);
  return { seen: await steps(page, kase) };
}
for (const kase of GATE_CASES) {
  test(`app-layouts-parity/${kase.name}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    const v4 = await observeGate(page, kase, scheme);
    expect(v4.seen).toHaveLength(
      1 + Number(kase.hover !== undefined) + Number(kase.focus !== undefined),
    );
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
  const pixels = await captureState(page, {
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
    const v4 = await modalV4(page, scheme, width);
    expect(v4.box.width).toBeGreaterThan(0);
    expect(v4.box.width).toBeLessThanOrEqual(width);
    expect(v4.footer).toHaveLength(2);
    expect(
      await page
        .locator('#wizard-dialog')
        .evaluate((element) => element.contains(document.activeElement)),
    ).toBe(true);
  });
}
async function wizardRoot(page: Page, mode: string) {
  const root = await page.evaluate((value) => {
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
    await page.setViewportSize({ width: WIDE, height: 900 });
    await open(page, specimenUrl(WIZARD, scheme), scheme);
    const root = await wizardRoot(page, mode);
    await shoot(root);
    await expect(root).toBeVisible();
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
  await open(page, specimenUrl(SPLIT, scheme), scheme);
  await page.addStyleTag({
    content: '.sp-split-layout-grip > .sp-icon { visibility: hidden }',
  });
  const v4Frame = page.locator('.docs-split-frame');
  const v4Rects = await readSplit(v4Frame);
  await shoot(v4Frame);
  expect(v4Rects.frame?.width).toBeGreaterThan(0);
  expect(v4Rects.first?.width).toBeGreaterThan(0);
  expect(v4Rects.separator?.height).toBeGreaterThan(0);
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
    await open(page, specimenUrl(TABS, scheme), scheme);
    const v4 = await readTabs(page.locator('.sp-vertical-tabs-layout'));
    await shoot(page.locator('.sp-vertical-tabs-layout'));
    expect(v4.list).toBeGreaterThan(0);
    await expect(
      page.locator('.sp-vertical-tabs-layout').getByRole('tabpanel'),
    ).toBeVisible();
  });
}
