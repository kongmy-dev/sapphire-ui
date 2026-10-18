import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SCHEMES } from '../tooling/source/token-values';
import { readSpecimens, specimenUrl } from '../tooling/visual/specimens';

const ROOT = join(import.meta.dirname, '..');

for (const { file } of readSpecimens(ROOT)) {
  for (const scheme of SCHEMES) {
    test(`a11y specimen: ${file} (${scheme})`, async ({ page }) => {
      await page.goto(specimenUrl(file, scheme));
      await page.locator('section[data-pin]').first().waitFor();
      await page.evaluate(() => document.fonts.ready);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const found = results.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      }));
      expect(found).toEqual([]);
    });
  }
}
