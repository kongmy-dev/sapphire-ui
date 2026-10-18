import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SCHEMES } from '../tooling/source/token-values';
import { readSpecimens, specimenUrl } from '../tooling/visual/specimens';

const ROOT = join(import.meta.dirname, '..');

const KNOWN_VIOLATIONS = [
  {
    file: 'components/button/button.examples.html',
    scheme: 'dark',
    found: 'color-contrast button[data-variant="destructive-outline"]',
    reason: '--error on the dark card is 2.44:1; the pin keeps the v3 look',
  },
  {
    file: 'components/dialog/dialog.examples.html',
    scheme: 'dark',
    found: 'color-contrast .sp-button[data-variant="outline"]:nth-child(3)',
    reason: '--error on the dark card is 2.44:1; the pin keeps the v3 look',
  },
  {
    file: 'components/badge/badge.examples.html',
    scheme: 'dark',
    found: 'color-contrast span[data-variant="success"]',
    reason: '#15803d on #133243 is 2.67:1; the pin keeps the v3 look',
  },
  {
    file: 'components/badge/badge.examples.html',
    scheme: 'dark',
    found: 'color-contrast span[data-variant="error"]',
    reason: '#b91c1c on #272540 is 2.27:1; the pin keeps the v3 look',
  },
  {
    file: 'components/badge/badge.examples.html',
    scheme: 'dark',
    found: 'color-contrast span[data-variant="warning"]',
    reason: '#b45309 on #282e3b is 2.70:1; the pin keeps the v3 look',
  },
  {
    file: 'components/badge/badge.examples.html',
    scheme: 'dark',
    found: 'color-contrast span[data-variant="info"]',
    reason: '#1d4ed8 on #152c52 is 2.06:1; the pin keeps the v3 look',
  },
] as const;

for (const { file } of readSpecimens(ROOT)) {
  for (const scheme of SCHEMES) {
    test(`a11y specimen: ${file} (${scheme})`, async ({ page }) => {
      await page.goto(specimenUrl(file, scheme));
      await page.locator('section[data-pin]').first().waitFor();
      await page.evaluate(() => document.fonts.ready);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const found = results.violations.flatMap((violation) =>
        violation.nodes.map(
          (node) => `${violation.id} ${node.target.join(' ')}`,
        ),
      );
      const known: string[] = KNOWN_VIOLATIONS.filter(
        (entry) => entry.file === file && entry.scheme === scheme,
      ).map((entry) => entry.found);
      expect(found.filter((entry) => !known.includes(entry))).toEqual([]);
      expect(known.filter((entry) => !found.includes(entry))).toEqual([]);
    });
  }
}
