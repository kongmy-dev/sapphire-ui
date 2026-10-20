import { writeFile } from 'node:fs/promises';
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

const finishAnimations = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    ),
  );

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

async function observeV3(
  page: Page,
  picked: boolean,
  testInfo: TestInfo,
): Promise<Observed> {
  await page.goto('/forms');
  await page.locator('section.docs-section').first().waitFor();
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    scheme(testInfo),
  );
  const trigger = page.getByRole('combobox', { name: 'Region' });
  await trigger.click();
  if (picked) {
    await page.getByRole('option', { name: OPTION }).click();
    await page.getByRole('listbox').waitFor({ state: 'detached' });
    await trigger.click();
  }
  const panel = page.getByRole('listbox');
  await panel.waitFor();
  await finishAnimations(page);
  await coverPage(page);
  return observe(panel);
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

async function attachMismatch(
  testInfo: TestInfo,
  name: string,
  images: Record<'expected' | 'actual', Buffer>,
) {
  for (const kind of ['expected', 'actual'] as const) {
    const path = testInfo.outputPath(`${name}-${kind}.png`);
    await writeFile(path, images[kind]);
    await testInfo.attach(`${name}-${kind}.png`, {
      path,
      contentType: 'image/png',
    });
  }
}

for (const pick of PICKS) {
  test(`select-parity/${pick.name}`, async ({ page }, testInfo) => {
    const v3 = await observeV3(page, pick.picked, testInfo);
    const specimen = await observeSpecimen(page, pick.id, testInfo);
    const differing = await differingPixels(page, v3.pixels, specimen.pixels);
    if (differing !== 0)
      await attachMismatch(testInfo, `select-parity-${pick.name}`, {
        expected: v3.pixels,
        actual: specimen.pixels,
      });
    expect(specimen.tree).toEqual(v3.tree);
    expect(specimen.highlighted).toBe(v3.highlighted);
    expect(specimen.shadow).toEqual(v3.shadow);
    expect(differing).toBe(0);
  });
}
