import type { Page, TestInfo } from '@playwright/test';
import { SCHEMES } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { captureState } from './capture-state';
import {
  GROUPS,
  HOLDER,
  PAIRS,
  type Pair,
  SPECIMENS,
} from './data-views-pairs';
import { expect, test } from './fixtures';

const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const PROPERTIES = [
  'display',
  'position',
  'width',
  'height',
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
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
  'text-align',
  'white-space',
  'opacity',
  'cursor',
  'gap',
  'flex-direction',
  'justify-content',
  'translate',
  'z-index',
  'top',
  'left',
  'overflow-x',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
] as const;
type Observation = {
  styles: Record<string, Record<string, string>>;
  focusVisible: boolean;
  pixels: Buffer;
};
async function inject(page: Page, html: string, scroll: string | undefined) {
  await page.evaluate(
    ({ markup, scrolling }) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      holder.className = 'docs-preview';
      holder.style.cssText =
        'position:fixed;top:0;left:0;width:480px;z-index:99999;border-radius:0';
      holder.innerHTML = markup;
      document.body.append(holder);
      const scroller = scrolling ? holder.querySelector(scrolling) : null;
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    },
    { markup: html, scrolling: scroll },
  );
}
const settle = (page: Page) =>
  page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    );
  });
const readStyles = (page: Page, selectors: readonly string[]) =>
  page.evaluate(
    ({ list, properties, colours, source }) => {
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
        return context.getImageData(0, 0, 1, 1).data.join('|');
      };
      const drawn = (style: CSSStyleDeclaration, name: string) =>
        !name.startsWith('border-') ||
        Number.parseFloat(
          style.getPropertyValue(name.replace('color', 'width')),
        ) > 0;
      return Object.fromEntries(
        list.map((selector) => {
          const element = document.querySelector(selector);
          if (element === null) throw new Error(`no ${selector}`);
          const style = getComputedStyle(element);
          const shadows = style.boxShadow
            .replace(new RegExp(source, 'g'), rgba)
            .split(', ')
            .filter((part) => !/^\d+\|\d+\|\d+\|0 /.test(part));
          return [
            selector,
            {
              ...Object.fromEntries(
                properties.map((name) => [name, style.getPropertyValue(name)]),
              ),
              ...Object.fromEntries(
                colours.map((name) => [
                  name,
                  drawn(style, name)
                    ? rgba(style.getPropertyValue(name))
                    : 'none',
                ]),
              ),
              'box-shadow': shadows.join(', '),
            },
          ];
        }),
      );
    },
    {
      list: [...selectors],
      properties: [...PROPERTIES],
      colours: [...COLOURS],
      source: COLOUR.source,
    },
  );
async function observe(
  page: Page,
  html: string,
  pair: Pair,
): Promise<Observation> {
  await inject(page, html, pair.scroll);
  await page.mouse.move(1000, 700);
  const target = page.locator(pair.target || HOLDER).first();
  if (pair.interaction === 'hover') await target.hover();
  if (pair.interaction === 'focus') await target.focus();
  await settle(page);
  return {
    styles: await readStyles(page, pair.observe),
    focusVisible: await target.evaluate((element) =>
      element.matches(':focus-visible'),
    ),
    pixels: await captureState(page.locator(HOLDER), {
      animations: 'disabled',
      caret: 'hide',
    }),
  };
}
async function open(page: Page, url: string, scheme: string) {
  await page.goto(url);
  await page.locator('section').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}
async function observeAll(
  page: Page,
  pairs: readonly Pair[],
): Promise<Map<string, Observation>> {
  const seen = new Map<string, Observation>();
  for (const pair of pairs)
    seen.set(pair.name, await observe(page, pair.v4, pair));
  return seen;
}
const schemeOf = (testInfo: TestInfo) => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};
for (const group of GROUPS) {
  test(`data views parity: ${group}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    const pairs = PAIRS.filter((pair) => pair.group === group);
    await open(page, specimenUrl(SPECIMENS[group], scheme), scheme);
    const v4 = await observeAll(page, pairs);
    for (const pair of pairs) {
      const seen = v4.get(pair.name);
      expect(seen).toBeDefined();
      if (pair.interaction === 'focus')
        expect(seen?.focusVisible, pair.name).toBe(true);
    }
  });
}
test('data views parity: a disabled tab is dimmed, not clickable-looking and does not react to hover', async ({
  page,
}, testInfo) => {
  const scheme = schemeOf(testInfo);
  await open(page, specimenUrl(SPECIMENS.tabs, scheme), scheme);
  const disabled = page.locator('#pills-trigger-settings');
  await expect(disabled).toBeDisabled();
  const before = await disabled.evaluate((element) => ({
    color: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor,
  }));
  await disabled.hover({ force: true });
  await settle(page);
  const after = await disabled.evaluate((element) => ({
    color: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor,
    opacity: getComputedStyle(element).opacity,
    cursor: getComputedStyle(element).cursor,
  }));
  expect({ color: after.color, background: after.background }).toEqual(before);
  expect({ opacity: after.opacity, cursor: after.cursor }).toEqual({
    opacity: '0.5',
    cursor: 'not-allowed',
  });
});
