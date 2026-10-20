import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readExamples } from '../tooling/examples/catalog';
import { readElementExamples } from '../tooling/examples/elements';

const SITE = 'http://localhost:4178';
const routes = [
  '/',
  '/foundations/',
  '/tokens/',
  '/layout/',
  '/prose/',
  '/native/',
  ...[...new Set(readExamples(process.cwd()).map((row) => row.component))].map(
    (name) => `/components/${name}/`,
  ),
  ...[
    ...new Set(readElementExamples(process.cwd()).map((row) => row.component)),
  ].map((name) => `/native/${name}/`),
];

test('static site serves every independently discovered component and native page', async ({
  request,
}) => {
  for (const route of routes) {
    const response = await request.get(`${SITE}${route}`);
    expect(response.status(), route).toBe(200);
    expect(await response.text()).toContain('<main id="main"');
  }
  expect((await request.get(`${SITE}/missing-page`)).status()).toBe(404);
});

for (const route of [
  '/',
  '/components/button/',
  '/components/card/',
  '/native/banner/',
  '/tokens/',
  '/layout/',
  '/prose/',
]) {
  test(`site accessibility ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${SITE}${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole('link', { name: 'Skip to content' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    expect(errors).toEqual([]);
  });
}
