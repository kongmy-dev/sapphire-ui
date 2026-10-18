import { join } from 'node:path';
import type { Page } from '@playwright/test';
import { ROUTES, slugOf } from '../../tooling/visual/examples';
import { coveredPins } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';
import { fitViewportToPage } from './viewport';

const SECTION = 'section.docs-section';
const SPECIMEN_PINS = new Set(coveredPins(join(import.meta.dirname, '../..')));

const sectionSlugs = async (page: Page): Promise<string[]> => {
  const headings = await page.$$eval(SECTION, (sections) =>
    sections.map(
      (section) =>
        section.querySelector('.docs-section-title')?.textContent ?? '',
    ),
  );
  return headings.map(slugOf);
};

async function openRoute(page: Page, path: string, scheme: string) {
  await page.goto(path);
  await page.locator(SECTION).first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}

for (const route of ROUTES) {
  test(`manifest/${route.name}`, async ({ page }, testInfo) => {
    await openRoute(page, route.path, testInfo.project.name);
    const listed = [...route.pinned, ...Object.keys(route.skipped)].sort();
    expect((await sectionSlugs(page)).sort()).toEqual(listed);
  });

  for (const slug of route.pinned) {
    if (SPECIMEN_PINS.has(`${route.name}/${slug}`)) continue;
    test(`${route.name}/${slug}`, async ({ page }, testInfo) => {
      const scheme = testInfo.project.name;
      await openRoute(page, route.path, scheme);
      const index = (await sectionSlugs(page)).indexOf(slug);
      expect(index, `section ${slug} on ${route.path}`).toBeGreaterThanOrEqual(
        0,
      );
      const section = page.locator(SECTION).nth(index);
      await fitViewportToPage(page, section);
      await expect(section).toHaveScreenshot([
        route.name,
        `${slug}.${scheme}.png`,
      ]);
    });
  }
}
