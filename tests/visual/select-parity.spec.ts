import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { captureState } from './capture-state';
import { expect, test } from './fixtures';

const SPECIMEN = 'components/select/select.examples.html';
const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const NO_SHADOW = /^(?:0px ){3}0px$/;
const OPTION = 'us-west-2 (Oregon)';
const COVER = 'parity-cover';
const PICKS = [
  { name: 'default', picked: false, id: 'open-content' },
  { name: 'picked', picked: true, id: 'picked-content' },
] as const;
const PROPERTIES = [
  'display',
  'position',
  'flex-direction',
  'align-items',
  'width',
  'height',
  'min-width',
  'max-height',
  'margin-top',
  'margin-bottom',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-top-left-radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
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
const COLOURS = ['color', 'background-color', 'border-top-color'] as const;
type Entry = {
  tag: string;
  text: string;
  rect: string;
  style: Record<string, string>;
};
type Observed = {
  tree: Entry[];
  highlighted: string;
  shadow: string[];
  pixels: Buffer;
};
const scheme = (testInfo: TestInfo) => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};
async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}
const coverPage = (page: Page) =>
  page.evaluate((id) => {
    const cover = document.createElement('div');
    cover.id = id;
    cover.style.cssText = 'position:fixed;inset:0;background:#f0f;z-index:49';
    document.body.append(cover);
  }, COVER);
const shadowGeometry = (shadow: string): string[] =>
  shadow
    .replace(COLOUR, '')
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter((part) => part !== '' && !NO_SHADOW.test(part));
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
      const origin = root.getBoundingClientRect();
      const elements = [root, ...root.querySelectorAll('*')].filter(
        (element) => element.tagName !== 'STYLE',
      );
      return elements.map((element) => {
        const computed = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        const style: Record<string, string> = {};
        for (const name of wanted.properties)
          style[name] = computed.getPropertyValue(name);
        for (const name of wanted.colours)
          style[name] = resolve(computed.getPropertyValue(name));
        const own = element.firstChild;
        return {
          tag: element.tagName.toLowerCase(),
          text:
            element.childNodes.length === 1 && own?.nodeType === Node.TEXT_NODE
              ? (own.textContent ?? '')
              : '',
          rect: [
            box.left - origin.left,
            box.top - origin.top,
            box.width,
            box.height,
          ]
            .map((value) => Math.round(value * 100) / 100)
            .join(','),
          style,
        };
      });
    },
    { properties: PROPERTIES, colours: COLOURS },
  );
async function observe(panel: Locator): Promise<Observed> {
  const shadow = await panel.evaluate(
    (element) => getComputedStyle(element).boxShadow,
  );
  const highlighted = await panel
    .locator('[data-highlighted]')
    .evaluateAll((items) => items.map((item) => item.textContent ?? ''));
  return {
    tree: await readTree(panel),
    highlighted: highlighted.join('|'),
    shadow: shadowGeometry(shadow),
    pixels: await captureState(panel, {
      animations: 'disabled',
      caret: 'hide',
    }),
  };
}
async function observeSpecimen(
  page: Page,
  id: string,
  testInfo: TestInfo,
): Promise<Observed> {
  await page.goto(specimenUrl(SPECIMEN, scheme(testInfo)));
  await page.locator('section[data-pin]').first().waitFor();
  await settle(page);
  const panel = page.locator(`#${id}`);
  await panel.locator('xpath=..').evaluate((popup) => {
    popup.style.position = 'fixed';
    popup.style.left = '24px';
    popup.style.top = '24px';
    popup.style.zIndex = '50';
  });
  await coverPage(page);
  return observe(panel);
}
for (const pick of PICKS) {
  test(`select-parity/${pick.name}`, async ({ page }, testInfo) => {
    const specimen = await observeSpecimen(page, pick.id, testInfo);
    expect(specimen.tree.length).toBeGreaterThan(0);
    expect(specimen.highlighted).toBe(
      pick.picked ? OPTION : 'us-east-1 (Virginia)',
    );
    await expect(page.locator(`#${pick.id}`)).toBeVisible();
  });
}
