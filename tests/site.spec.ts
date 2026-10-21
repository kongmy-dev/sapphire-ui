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

test('overview groups component links and component pages lead with current setup', async ({
  page,
}) => {
  await page.goto(SITE);
  const main = page.locator('#main');
  await expect(
    main.getByRole('heading', { name: 'Architecture', exact: true }),
  ).toBeVisible();
  await main.getByRole('link', { name: 'Button', exact: true }).click();
  const setup = page.locator('#setup');
  await expect(setup).toContainText(
    'bun add @kongmy-dev/sapphire-ui react react-dom',
  );
  await expect(setup).toContainText('@kongmy-dev/sapphire-ui/sapphire.css');
  await page.getByRole('link', { name: 'Examples', exact: true }).click();
  await expect(page).toHaveURL(/#examples$/);
  await expect(
    page
      .frameLocator('iframe[title="button variants light"]')
      .getByRole('button', { name: 'Primary', exact: true }),
  ).toBeVisible();
  await page.goto(`${SITE}/native/banner/`);
  await expect(page.locator('#setup')).toContainText(
    'import "@kongmy-dev/sapphire-ui/elements/banner";',
  );
  await expect(page.locator('#setup')).not.toContainText(
    'import { BannerElement }',
  );
});

for (const scheme of ['light', 'dark'] as const) {
  for (const route of [
    '/',
    '/components/button/',
    '/components/card/',
    '/native/banner/',
    '/tokens/',
    '/layout/',
    '/prose/',
  ]) {
    test(`site accessibility ${scheme} ${route}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
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

test('resizing a closed navigation preserves keyboard focus', async ({
  page,
}) => {
  await page.goto(`${SITE}/components/button/`);
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await skip.focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('documentation search opens a keyboard command palette and restores focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${SITE}/components/button/`);
  const trigger = page.getByRole('button', {
    name: 'Search documentation',
    exact: true,
  });
  const dialog = page.getByRole('dialog', { name: 'Search documentation' });
  const search = dialog.getByRole('combobox', { name: 'Search documentation' });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(search).toBeFocused();
  await search.fill('no-such-sapphire-component');
  await expect(dialog.getByRole('status')).toHaveText('No matching pages.');
  await expect(search).not.toHaveAttribute('aria-activedescendant');
  await search.press('Enter');
  await expect(dialog).toBeVisible();
  await search.fill('card');
  await expect(
    dialog.getByRole('option', { name: 'Card Content', exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await search.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  const nav = page.getByRole('navigation', { name: 'Documentation' });
  await expect(
    nav.getByRole('link', { name: 'Button', exact: true }),
  ).toBeVisible();
  for (const shortcut of ['Control+k', 'Meta+k']) {
    await trigger.press(shortcut);
    await expect(search).toBeFocused();
    await search.press(shortcut);
    await expect(dialog).toBeHidden();
  }
  await trigger.click();
  await search.fill('');
  await search.press('ArrowDown');
  await expect(dialog.getByRole('option').nth(1)).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await search.press('ArrowUp');
  await expect(dialog.getByRole('option').first()).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await search.fill('card');
  await search.press('Enter');
  await expect(page).toHaveURL(`${SITE}/components/card/`);
});

test('documentation theme toggle changes and persists the selected scheme', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(`${SITE}/components/button/`);
  const sidebar = page.locator('#docs-sidebar');
  const lightCanvas = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  const lightSurface = await sidebar.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page
    .getByRole('button', { name: 'Switch to dark theme', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const darkSurface = await sidebar.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(darkSurface).toBe(lightSurface);
  expect(
    await page
      .locator('body')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).not.toBe(lightCanvas);
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
  await page
    .getByRole('button', { name: 'Search documentation', exact: true })
    .click();
  const search = page.getByRole('combobox', { name: 'Search documentation' });
  await expect(search).toBeFocused();
  await search.press('Escape');
  await expect(sidebar).toBeInViewport();
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

test('search supports dark mode, mobile resize and pointer selection', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${SITE}/components/button/`);
  await page
    .getByRole('button', { name: 'Search documentation', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Search documentation' });
  const search = dialog.getByRole('combobox');
  await search.fill('card');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(dialog).toBeInViewport();
  await dialog.getByRole('button', { name: 'Close search' }).click();
  const menu = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  });
  await expect(menu).toBeFocused();
  await menu.press('Control+k');
  await expect(search).toBeFocused();
  await search.fill('card');
  await dialog
    .getByRole('option', { name: 'Card Content', exact: true })
    .click();
  await expect(page).toHaveURL(`${SITE}/components/card/`);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`native control contrast ${scheme} without component classes`, async ({
    page,
  }) => {
    await page.setContent(
      `<!doctype html><html lang="en" data-theme="${scheme}"><head><title>Native control contrast</title><link rel="stylesheet" href="${SITE}/assets/sapphire.css"></head><body><main><button type="button">Native action</button><label>Name<input value="Ada"></label><label>Choice<select><option>One</option></select></label><label>Notes<textarea>Details</textarea></label></main></body></html>`,
    );
    const result = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}
