import { test } from '@playwright/test';
import { EXAMPLE_URL } from '../tooling/examples/catalog';
import {
  assertCoarseControlDensity,
  assertControlDensity,
} from './examples/density-assertions';

for (const scheme of ['light', 'dark'] as const) {
  test(`density/fine/${scheme}`, async ({ page }) => {
    await page.goto(
      `${EXAMPLE_URL}/?component=button&example=variants&scheme=${scheme}`,
    );
    await page.locator('#example button').first().waitFor();
    await assertControlDensity(page);
  });
  test(`density/coarse/${scheme}`, async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      colorScheme: scheme,
    });
    try {
      const page = await context.newPage();
      await page.goto(
        `${EXAMPLE_URL}/?component=button&example=variants&scheme=${scheme}`,
      );
      await page.locator('#example button').first().waitFor();
      await assertCoarseControlDensity(page);
    } finally {
      await context.close();
    }
  });
}
