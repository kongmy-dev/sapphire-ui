import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import packageMetadata from '../package.json' with { type: 'json' };

const SITE = 'http://localhost:4178';

for (const scheme of ['light', 'dark'] as const) {
  test(`mobile docs shell retains the compact header and overlay drawer in ${scheme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(`${SITE}/components/button/`);
    const bar = page.locator('.docs-mobile-bar');
    const open = page.getByRole('button', {
      name: 'Open navigation',
      exact: true,
    });
    const brand = bar.getByRole('link', { name: 'Sapphire UI' });
    const menuBox = await open.boundingBox();
    const brandBox = await brand.boundingBox();
    expect(menuBox).not.toBeNull();
    expect(brandBox).not.toBeNull();
    if (!menuBox || !brandBox) throw new Error('Mobile header must render');
    expect(menuBox.width).toBeGreaterThanOrEqual(44);
    expect(menuBox.height).toBeGreaterThanOrEqual(44);
    expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(brandBox.x);
    await expect(bar).toContainText(`v${packageMetadata.version}`);
    await expect(bar).toHaveCSS('height', '64px');
    await open.click();
    const drawer = page.getByRole('dialog', {
      name: 'Documentation navigation',
    });
    const close = drawer.getByRole('button', {
      name: 'Close navigation',
      exact: true,
    });
    await expect(close).toBeVisible();
    const drawerBox = await drawer.boundingBox();
    const closeBox = await close.boundingBox();
    expect(drawerBox).toMatchObject({ x: 0, y: 0, width: 280 });
    expect(drawerBox?.height).toBeCloseTo(844, 0);
    expect(closeBox?.y).toBeLessThan(64);
    expect(closeBox?.width).toBeGreaterThanOrEqual(44);
    expect(closeBox?.height).toBeGreaterThanOrEqual(44);
    await expect(page.locator('#main')).toHaveAttribute('inert', '');
    await expect(bar).toHaveAttribute('inert', '');
    const targets = await drawer
      .locator('nav > a, nav > details > summary, .docs-search, .docs-theme')
      .evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().height),
      );
    expect(targets.length).toBeGreaterThan(10);
    expect(Math.min(...targets)).toBeGreaterThanOrEqual(44);
    const backdrop = page.getByRole('button', {
      name: 'Close navigation overlay',
    });
    await expect(backdrop).toHaveCSS('backdrop-filter', 'blur(8px)');
    expect(
      await page.evaluate(
        () => document.elementFromPoint(34, 34)?.closest('#docs-sidebar')?.id,
      ),
    ).toBe('docs-sidebar');
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await close.click();
    await expect(open).toBeFocused();
    await expect(drawer).toHaveCount(0);
    await expect(bar).not.toHaveAttribute('inert');
  });
}

test('mobile drawer traps focus, closes from its backdrop and resets on desktop resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${SITE}/components/button/`);
  const open = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  });
  await open.click();
  const sidebar = page.locator('#docs-sidebar');
  const brand = sidebar.getByRole('link', { name: 'Sapphire UI' });
  const footer = sidebar.getByRole('link', { name: 'KONGMY.DEV' });
  await footer.focus();
  await page.keyboard.press('Tab');
  await expect(brand).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(footer).toBeFocused();
  await page
    .getByRole('button', { name: 'Close navigation overlay' })
    .click({ position: { x: 370, y: 200 } });
  await expect(open).toBeFocused();
  await expect(sidebar).not.toBeInViewport();
  await open.click();
  await sidebar
    .getByRole('button', { name: 'Close navigation', exact: true })
    .focus();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('body')).not.toHaveAttribute('data-nav-open');
  await expect(sidebar).not.toHaveAttribute('aria-modal');
  await expect(
    sidebar.getByRole('button', {
      name: 'Search documentation… ⌘K',
      exact: true,
    }),
  ).toBeFocused();
  await expect(page.locator('#main')).not.toHaveAttribute('inert');
  await expect(sidebar).toBeInViewport();
});

test('short mobile drawers keep controls reachable while only the page list scrolls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto(`${SITE}/typography/`);
  await page
    .getByRole('button', { name: 'Open navigation', exact: true })
    .click();
  const sidebar = page.locator('#docs-sidebar');
  const close = sidebar.getByRole('button', {
    name: 'Close navigation',
    exact: true,
  });
  const theme = sidebar.getByRole('button', {
    name: 'Theme: light. Switch to dark theme',
    exact: true,
  });
  await expect(close).toBeInViewport();
  await expect(theme).toBeInViewport();
  const nav = sidebar.getByRole('navigation', { name: 'Documentation' });
  const last = nav.getByRole('link', { name: 'Native elements', exact: true });
  await last.focus();
  await expect(last).toBeInViewport();
  await expect(close).toBeInViewport();
  await expect(theme).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(sidebar).not.toBeInViewport();
});
