import { expect, test } from '@playwright/test';

const SITE = 'http://localhost:4178';

test('visual foundations expose current colors, type specimens and spacing', async ({
  page,
}) => {
  await page.goto(`${SITE}/colors/`);
  await expect(page.locator('.docs-swatch')).toHaveCount(42);
  const brand = page.locator('.docs-swatch').filter({
    has: page.getByRole('button', {
      name: 'Copy token --brand',
      exact: true,
    }),
  });
  await expect(brand).toContainText('Light #c5a065');
  await expect(brand).toContainText('Dark #c5a065');
  await expect(brand.locator('[data-theme]')).toHaveCount(2);
  const surfaces = await brand
    .locator('[data-theme]')
    .evaluateAll((halves) =>
      halves.map((half) => getComputedStyle(half).backgroundColor),
    );
  expect(surfaces[0]).not.toBe(surfaces[1]);
  await page.goto(`${SITE}/typography/`);
  await expect(page.locator('.docs-type-families .docs-type-card')).toHaveCount(
    3,
  );
  await expect(page.locator('.docs-type-sample')).toHaveCount(8);
  await expect(
    page.getByRole('heading', { name: 'Newsreader', exact: true }),
  ).toBeVisible();
  await page.goto(`${SITE}/spacing/`);
  await expect(page.locator('.docs-space-bar')).toHaveCount(12);
  await expect(
    page.getByRole('heading', { name: 'Control density', exact: true }),
  ).toBeVisible();
});

test('token copy reports both success and browser denial', async ({ page }) => {
  await page.goto(`${SITE}/colors/`);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copied = text;
        },
      },
    }),
  );
  const button = page.getByRole('button', {
    name: 'Copy token --brand',
    exact: true,
  });
  await button.click();
  await expect(page.getByRole('status')).toHaveText('Copied --brand.');
  await expect(page.locator('html')).toHaveAttribute('data-copied', '--brand');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Denied');
        },
      },
    }),
  );
  await button.click();
  await expect(page.getByRole('status')).toHaveText(
    'Could not copy. Select and copy --brand manually.',
  );
});

test('component API replaces source dumps with supported props and platform details', async ({
  page,
}) => {
  await page.goto(`${SITE}/components/button/`);
  await page.getByRole('link', { name: 'Props', exact: true }).click();
  const api = page.locator('#props');
  await expect(api.getByRole('cell', { name: /"primary"/ })).toBeVisible();
  await expect(
    api.getByRole('rowheader', { name: 'variant', exact: true }),
  ).toBeVisible();
  await expect(
    api.getByRole('rowheader', { name: 'asChild', exact: true }),
  ).toBeVisible();
  await api.locator('summary').click();
  await expect(
    api.getByRole('rowheader', { name: 'onClick', exact: true }),
  ).toHaveCount(0);
  await expect(api.locator('.docs-prop-names')).toContainText('onClick');
  await expect(
    api.getByRole('rowheader', { name: 'disabled', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#source')).toHaveCount(0);
  await page.goto(`${SITE}/native/banner/`);
  await expect(page.locator('#props')).toContainText('dismiss()');
  await expect(page.locator('#props')).toContainText('storage-key');
  await page.goto(`${SITE}/components/toast/#props`);
  await expect(
    page
      .locator('#props')
      .getByRole('heading', { name: 'ToastRef', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#props')).toContainText('durationMs');
  await page.goto(`${SITE}/components/wizard-layout/#props`);
  await expect(
    page
      .locator('#props')
      .getByRole('heading', { name: 'StepItem', exact: true }),
  ).toBeVisible();
  await page.goto(`${SITE}/components/theme-provider/#props`);
  await expect(
    page
      .locator('#props')
      .getByRole('region', { name: 'ThemePreference definition', exact: true }),
  ).toContainText('"system"');
});

test('props and expanded platform details stay inside a narrow viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of [
    'input',
    'accordion',
    'dialog',
    'theme-toggle',
    'wizard-layout',
  ]) {
    await page.goto(`${SITE}/components/${name}/#props`);
    await page.locator('#props summary').first().click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      name,
    ).toBe(true);
  }
});
