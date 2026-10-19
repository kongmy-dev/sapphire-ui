import type { Page } from '@playwright/test';
import { specimenUrl } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';
import { schemeOf } from './overlays-cases';

const SPECIMEN = 'components/dialog/dialog.examples.html';

const MOTION: Record<string, string> = {
  'dialog closed': 'sp-dialog-out',
  'dialog open': 'sp-dialog-in',
  'backdrop open': 'sp-dialog-fade-in',
  'panel closed': 'sp-dialog-out',
  'panel open': 'sp-dialog-in',
  'overlay closed': 'sp-dialog-fade-out',
  'overlay open': 'sp-dialog-fade-in',
};

const motionOf = (page: Page) =>
  page.evaluate(() => {
    const seen: Record<string, string> = {};
    const dialog = document.createElement('dialog');
    dialog.className = 'sp-dialog';
    document.body.append(dialog);
    seen['dialog closed'] = getComputedStyle(dialog).animationName;
    dialog.showModal();
    seen['dialog open'] = getComputedStyle(dialog).animationName;
    seen['backdrop open'] = getComputedStyle(
      dialog,
      '::backdrop',
    ).animationName;
    dialog.close();
    const parts: [string, string][] = [
      ['panel', 'sp-dialog'],
      ['overlay', 'sp-dialog-overlay'],
    ];
    for (const [name, className] of parts) {
      const element = document.createElement('div');
      element.className = className;
      document.body.append(element);
      for (const state of ['closed', 'open']) {
        element.dataset.state = state;
        seen[`${name} ${state}`] = getComputedStyle(element).animationName;
      }
    }
    return seen;
  });

test('dialog-motion', async ({ page }, testInfo) => {
  await page.goto(specimenUrl(SPECIMEN, schemeOf(testInfo)));
  await page.locator('section.docs-section').first().waitFor();
  expect(await motionOf(page)).toEqual(MOTION);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const still = Object.fromEntries(
    Object.keys(MOTION).map((name) => [name, 'none']),
  );
  expect(await motionOf(page)).toEqual(still);
});
