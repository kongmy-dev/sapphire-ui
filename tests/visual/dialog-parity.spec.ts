import { writeFile } from 'node:fs/promises';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { captureState } from './capture-state';
import { expect, test } from './fixtures';

const SPECIMEN = 'components/dialog/dialog.examples.html';
const COLOUR = /(?:rgba?|color)\([^)]*\)/g;
const NO_SHADOW = /^(?:0px ){3}0px$/;
const CORNER_PX = 8;

const DIALOGS = [
  { name: 'confirm', trigger: 'Confirm Dialog', id: 'confirm-dialog' },
  { name: 'danger', trigger: 'Danger Dialog', id: 'danger-dialog' },
] as const;

type Box = { x: number; y: number; width: number; height: number };
type Focus = {
  tag: string;
  text: string;
  isFocusVisible: boolean;
  boxShadow: string;
};
type Overlay = { background: string; filter: string };
type Shape = { radius: string; shadow: string[] };
type Observed = {
  box: Box;
  overlay: Overlay;
  shape: Shape;
  focus: Focus;
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

const readFocus = (page: Page): Promise<Focus> =>
  page.evaluate(() => {
    const active = document.activeElement;
    if (active === null) throw new Error('nothing has focus');
    return {
      tag: active.tagName,
      text: active.textContent?.trim() ?? '',
      isFocusVisible: active.matches(':focus-visible'),
      boxShadow: getComputedStyle(active).boxShadow,
    };
  });

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error('the dialog has no box');
  return box;
}

const shadowGeometry = (shadow: string): string[] =>
  shadow
    .replace(COLOUR, '')
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter((part) => part !== '' && !NO_SHADOW.test(part));

async function capture(page: Page, panel: Locator, box: Box) {
  return captureState(page, {
    clip: {
      x: box.x + CORNER_PX,
      y: box.y + CORNER_PX,
      width: box.width - CORNER_PX * 2,
      height: box.height - CORNER_PX * 2,
    },
    mask: [panel.getByRole('button', { name: 'Close' })],
    animations: 'disabled',
    caret: 'hide',
  });
}

const readShape = async (panel: Locator): Promise<Shape> => {
  const { radius, shadow } = await panel.evaluate((element) => {
    const style = getComputedStyle(element);
    return { radius: style.borderRadius, shadow: style.boxShadow };
  });
  return { radius, shadow: shadowGeometry(shadow) };
};

async function observeV3(
  page: Page,
  trigger: string,
  testInfo: TestInfo,
): Promise<Observed> {
  await page.goto('/interactive');
  await page.locator('section.docs-section').first().waitFor();
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    scheme(testInfo),
  );
  await page.getByRole('button', { name: trigger }).click();
  const panel = page.getByRole('dialog');
  await panel.waitFor();
  await finishAnimations(page);
  const overlayElement = panel.locator('xpath=preceding-sibling::*[1]');
  const overlay = await overlayElement.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, filter: style.backdropFilter };
  });
  const focus = await readFocus(page);
  const box = await boxOf(panel);
  const shape = await readShape(panel);
  const pixels = await capture(page, panel, box);
  return { box, overlay, shape, focus, pixels };
}

async function observeSpecimen(
  page: Page,
  dialog: (typeof DIALOGS)[number],
  testInfo: TestInfo,
): Promise<Observed> {
  await page.goto(specimenUrl(SPECIMEN, scheme(testInfo)));
  await page.locator('section[data-pin]').first().waitFor();
  await settle(page);
  await page.getByRole('button', { name: dialog.trigger }).click();
  await page.evaluate((id) => {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLDialogElement)) throw new Error(id);
    element.showModal();
  }, dialog.id);
  const panel = page.locator(`#${dialog.id}`);
  await finishAnimations(page);
  const overlay = await panel.evaluate((element) => {
    const style = getComputedStyle(element, '::backdrop');
    return { background: style.backgroundColor, filter: style.backdropFilter };
  });
  const focus = await readFocus(page);
  const box = await boxOf(panel);
  const shape = await readShape(panel);
  const pixels = await capture(page, panel, box);
  return { box, overlay, shape, focus, pixels };
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

for (const dialog of DIALOGS) {
  test(`dialog-parity/${dialog.name}`, async ({ page }, testInfo) => {
    const v3 = await observeV3(page, dialog.trigger, testInfo);
    const specimen = await observeSpecimen(page, dialog, testInfo);
    const differing = await differingPixels(page, v3.pixels, specimen.pixels);
    if (differing !== 0)
      await attachMismatch(testInfo, `dialog-parity-${dialog.name}`, {
        expected: v3.pixels,
        actual: specimen.pixels,
      });
    expect(specimen.box).toEqual(v3.box);
    expect(specimen.overlay).toEqual(v3.overlay);
    expect(specimen.shape).toEqual(v3.shape);
    expect(specimen.focus).toEqual(v3.focus);
    expect(differing).toBe(0);
  });
}
