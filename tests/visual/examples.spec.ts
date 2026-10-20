import { join } from 'node:path';
import { exampleUrl, readExamples } from '../../tooling/examples/catalog';
import { SCHEMES } from '../../tooling/source/token-values';
import { expect, test } from './fixtures';

const cases = readExamples(join(import.meta.dirname, '../..')).flatMap(
  (example) =>
    (example.component === 'dialog' ? ['closed', 'open'] : ['closed']).map(
      (state) => ({ example, state }),
    ),
);

for (const { example, state } of cases) {
  const suffix = state === 'open' ? '/open' : '';
  test(`react/${example.component}/${example.name}${suffix}`, async ({
    page,
  }, testInfo) => {
    const scheme = SCHEMES.find((name) => name === testInfo.project.name);
    if (!scheme) throw new Error('Unknown color scheme');
    await page.goto(exampleUrl(example, scheme));
    await page.locator('#example > *').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    if (state === 'open') {
      await page.locator('#example').getByRole('button').first().focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
    }
    await expect(page).toHaveScreenshot(
      [
        'react',
        example.component,
        `${example.name}${suffix.replace('/', '-')}.${scheme}.png`,
      ],
      { fullPage: true },
    );
  });
}
