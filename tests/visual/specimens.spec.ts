import { join } from 'node:path';
import type { Page } from '@playwright/test';
import { SCHEMES } from '../../tooling/source/token-values';
import { readSpecimens, specimenUrl } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';
import { fitViewportToPage } from './viewport';

const ROOT = join(import.meta.dirname, '../..');

async function openSpecimen(page: Page, file: string, scheme: string) {
  const known = SCHEMES.find((name) => name === scheme);
  if (known === undefined) throw new Error(`unknown scheme ${scheme}`);
  await page.goto(specimenUrl(file, known));
  await page.locator('section[data-pin]').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}

for (const { file, pins } of readSpecimens(ROOT)) {
  for (const pin of pins) {
    test(pin, async ({ page }, testInfo) => {
      const scheme = testInfo.project.name;
      const [route, slug] = pin.split('/');
      await openSpecimen(page, file, scheme);
      const section = page.locator(`section[data-pin="${pin}"]`);
      await fitViewportToPage(page, section);
      await expect(section).toHaveScreenshot([
        route ?? '',
        `${slug}.${scheme}.png`,
      ]);
    });
  }
}
