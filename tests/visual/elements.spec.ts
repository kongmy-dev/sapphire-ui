import { join } from 'node:path';
import { exampleUrl } from '../../tooling/examples/catalog';
import { readElementExamples } from '../../tooling/examples/elements';
import { SCHEMES } from '../../tooling/source/token-values';
import { expect, test } from './fixtures';

for (const example of readElementExamples(join(import.meta.dirname, '../..'))) {
  test(`native/${example.component}/${example.name}`, async ({
    page,
  }, testInfo) => {
    const scheme = SCHEMES.find((name) => name === testInfo.project.name);
    if (!scheme) throw new Error('Unknown color scheme');
    await page.goto(exampleUrl(example, scheme));
    await page.locator('#example > *').first().waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    if (example.component === 'toast') {
      await page.clock.install();
      await page
        .getByRole('button', { name: 'Show success', exact: true })
        .click();
    }
    await expect(page).toHaveScreenshot(
      ['native', example.component, `${example.name}.${scheme}.png`],
      { fullPage: true },
    );
  });
}
