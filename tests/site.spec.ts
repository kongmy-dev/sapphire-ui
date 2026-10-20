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
    const main = page.locator('#main');
    await expect(main.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(main.getByRole('heading', { level: 1 })).toBeVisible();
    const levels = await main
      .getByRole('heading')
      .evaluateAll((headings) =>
        headings.map((heading) => Number(heading.tagName.slice(1))),
      );
    expect(levels[0]).toBe(1);
    for (const [index, level] of levels.entries())
      expect(level).toBeLessThanOrEqual((levels[index - 1] ?? 0) + 1);
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

test('desktop documentation keeps a persistent sidebar beside the active page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${SITE}/components/button/`);
  const sidebar = page.locator('aside.docs-sidebar#docs-sidebar');
  const main = page.locator('main#main');
  const nav = sidebar.getByRole('navigation', { name: 'Documentation' });
  await expect(sidebar).toBeInViewport();
  await expect(
    nav.getByRole('link', { name: 'Button', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  const columns = await page.evaluate(() => {
    const sidebar = document
      .getElementById('docs-sidebar')
      ?.getBoundingClientRect();
    const main = document.getElementById('main')?.getBoundingClientRect();
    return sidebar && main
      ? { sidebarRight: sidebar.right, mainLeft: main.left }
      : null;
  });
  expect(columns).not.toBeNull();
  if (!columns) throw new Error('Documentation columns must exist');
  expect(columns.sidebarRight).toBeLessThanOrEqual(columns.mainLeft);
  await expect(main).toBeVisible();
  await page.getByRole('link', { name: 'Skip to content' }).focus();
  const focusedSidebar = await sidebar.boundingBox();
  expect(focusedSidebar?.x).toBe(0);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(sidebar).toBeInViewport();
  const after = await sidebar.boundingBox();
  expect(after).not.toBeNull();
  if (!after)
    throw new Error('Sidebar must remain visible after content scroll');
  expect(Math.abs(after.y)).toBeLessThan(1);
  expect(after.x + after.width).toBe(columns.sidebarRight);
});

test('documentation search filters links and both shortcuts focus it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${SITE}/components/button/`);
  const nav = page.getByRole('navigation', { name: 'Documentation' });
  const search = page.getByLabel('Find a component', { exact: true });
  const button = nav.getByRole('link', {
    name: 'Button',
    exact: true,
    includeHidden: true,
  });
  const card = nav.getByRole('link', {
    name: 'Card',
    exact: true,
    includeHidden: true,
  });
  await search.fill('button');
  await expect(button).toBeVisible();
  await expect(card).toBeHidden();
  await search.fill('card');
  await expect(card).toBeVisible();
  await expect(button).toBeHidden();
  await search.fill('no-such-sapphire-component');
  await expect(button).toBeHidden();
  const empty = nav.getByText('No matching components.', { exact: true });
  await expect(empty).toBeVisible();
  await search.fill('');
  await expect(empty).toBeHidden();
  await expect(card).toHaveJSProperty('hidden', false);
  await expect(card).toBeHidden();
  await nav
    .locator('summary')
    .filter({ hasText: /^Content$/ })
    .click();
  await expect(card).toBeVisible();
  await expect(button).toHaveAttribute('aria-current', 'page');
  for (const shortcut of ['Control+k', 'Meta+k']) {
    await button.focus();
    await page.keyboard.press(shortcut);
    await expect(search).toBeFocused();
  }
});

test('documentation theme toggle changes and persists the selected scheme', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(`${SITE}/components/button/`);
  await page
    .getByRole('button', { name: 'Switch to dark theme', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.getByRole('button', { name: 'Switch to light theme', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page
    .getByRole('button', { name: 'Switch to light theme', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('mobile navigation supports keyboard dismissal and page navigation without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${SITE}/components/button/`);
  const sidebar = page.locator('#docs-sidebar');
  const open = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  });
  await expect(open).toHaveAttribute('aria-controls', 'docs-sidebar');
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar).not.toBeInViewport();
  await open.focus();
  await page.keyboard.press('Enter');
  const close = page.getByRole('button', {
    name: 'Close navigation',
    exact: true,
  });
  await expect(close).toHaveAttribute('aria-expanded', 'true');
  await expect(sidebar).toBeInViewport();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  const search = page.getByLabel('Find a component', { exact: true });
  await search.focus();
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await expect(sidebar).not.toBeInViewport();
  await open.click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const nav = page.getByRole('navigation', { name: 'Documentation' });
  await nav
    .locator('summary')
    .filter({ hasText: /^Content$/ })
    .click();
  await nav.getByRole('link', { name: 'Card', exact: true }).click();
  await expect(page).toHaveURL(`${SITE}/components/card/`);
  await expect(
    page.getByRole('button', { name: 'Open navigation', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar).not.toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
