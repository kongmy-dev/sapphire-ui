import type { Locator, Page } from '@playwright/test';

const sectionHeight = (section: Locator) =>
  section.evaluate((element) => element.getBoundingClientRect().height);

export async function fitViewportToPage(page: Page, section: Locator) {
  const standard = page.viewportSize();
  if (standard === null) throw new Error('the page has no viewport');
  const before = await sectionHeight(section);
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  await page.setViewportSize({ width: standard.width, height });
  await page.evaluate(() => new Promise(requestAnimationFrame));
  if ((await sectionHeight(section)) !== before)
    await page.setViewportSize(standard);
}
