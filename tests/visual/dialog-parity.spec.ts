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
type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type Focus = {
  tag: string;
  text: string;
  isFocusVisible: boolean;
  boxShadow: string;
};
type Overlay = {
  background: string;
  filter: string;
};
type Shape = {
  radius: string;
  shadow: string[];
};
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
for (const dialog of DIALOGS) {
  test(`dialog-parity/${dialog.name}`, async ({ page }, testInfo) => {
    const specimen = await observeSpecimen(page, dialog, testInfo);
    expect(specimen.box.width).toBeGreaterThan(0);
    expect(specimen.box.height).toBeGreaterThan(0);
    await expect(page.locator(`#${dialog.id}`)).toBeVisible();
    expect(
      await page
        .locator(`#${dialog.id}`)
        .evaluate((element) => element.contains(document.activeElement)),
    ).toBe(true);
  });
}
