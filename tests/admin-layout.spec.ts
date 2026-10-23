import { expect, type Page, test } from '@playwright/test';
import { exampleUrl } from '../tooling/examples/catalog';
import { audit } from './examples/audit';

async function openWorkspace(page: Page, scheme: 'light' | 'dark') {
  await page.goto(
    exampleUrl(
      {
        component: 'admin-layout',
        name: 'workspace',
        file: 'components/admin-layout/admin-layout.examples.tsx',
      },
      scheme,
    ),
  );
  await expect(
    page.getByRole('heading', { level: 1, name: 'Workspace overview' }),
  ).toBeVisible();
}

for (const scheme of ['light', 'dark'] as const) {
  test(`desktop compact navigation preserves names, iconless links and grouped navigation in ${scheme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openWorkspace(page, scheme);
    const sidebar = page.getByRole('complementary', {
      name: 'Workspace navigation',
    });
    const toggle = page.getByRole('button', { name: 'Collapse sidebar' });
    await toggle.press('Enter');
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const projects = sidebar.getByRole('link', { name: 'Projects 6' });
    await projects.focus();
    await expect(page.getByRole('tooltip')).toContainText('Projects');
    await page.keyboard.press('Escape');
    const help = sidebar.getByRole('link', { name: 'Help', exact: true });
    await expect(help).toBeVisible();
    await expect(help.locator('.sp-admin-layout-label')).toBeVisible();
    const helpHref = await help.getAttribute('href');
    await help.press('Enter');
    expect(new URL(page.url()).hash).toBe(helpHref);
    const library = sidebar.getByRole('button', {
      name: 'Library',
      exact: true,
    });
    await library.press('Enter');
    const flyout = page.getByRole('dialog', { name: 'Library' });
    await expect(flyout).toBeVisible();
    await flyout
      .getByRole('link', { name: 'Archived projects', exact: true })
      .press('Enter');
    await expect(flyout).toHaveCount(0);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Archived projects' }),
    ).toBeVisible();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(
      sidebar.getByRole('navigation', { name: 'Library' }),
    ).toBeVisible();
    await sidebar.getByRole('link', { name: 'All projects' }).press('Enter');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeVisible();
    await audit(page);
  });

  test(`mobile navigation closes after selection and restores its header trigger in ${scheme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openWorkspace(page, scheme);
    const open = page.getByRole('button', {
      name: 'Open navigation',
      exact: true,
    });
    await expect(page.getByRole('complementary')).toHaveCount(0);
    await open.press('Enter');
    const drawer = page.getByRole('dialog', { name: 'Workspace navigation' });
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    const sidebar = drawer.getByRole('complementary', {
      name: 'Workspace navigation',
    });
    await expect(sidebar).not.toHaveAttribute('data-collapsed');
    for (let step = 0; step < 8; step++) {
      await page.keyboard.press('Tab');
      await expect(drawer.locator(':focus')).toHaveCount(1);
    }
    await audit(page);
    await drawer.getByRole('link', { name: 'Projects 6' }).press('Enter');
    await expect(drawer).toHaveCount(0);
    await expect(open).toBeFocused();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeVisible();
    await open.click();
    await drawer
      .getByRole('button', { name: 'Close navigation', exact: true })
      .click();
    await expect(drawer).toHaveCount(0);
    await expect(open).toBeFocused();
  });
}

test('mobile Escape and backdrop dismissal restore focus without hiding desktop navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWorkspace(page, 'light');
  const open = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  });
  const drawer = page.getByRole('dialog', { name: 'Workspace navigation' });
  await open.press('Enter');
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(open).toBeFocused();
  await open.click();
  await expect(drawer).toBeVisible();
  const overlay = page.locator('.sp-sheet-overlay');
  const bounds = await overlay.boundingBox();
  if (!bounds) throw new Error('Open navigation overlay has no bounds');
  await overlay.click({
    position: { x: bounds.width - 8, y: bounds.height / 2 },
  });
  await expect(drawer).toHaveCount(0);
  await expect(open).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(
    page.getByRole('complementary', { name: 'Workspace navigation' }),
  ).toBeVisible();
});

test('viewport round trips close the mobile drawer and retain the desktop compact preference', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openWorkspace(page, 'light');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  const open = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  });
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  await open.click();
  await expect(
    page.getByRole('dialog', { name: 'Workspace navigation' }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const sidebar = page.getByRole('complementary', {
    name: 'Workspace navigation',
  });
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  await expect(
    page.getByRole('button', { name: 'Expand sidebar' }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
