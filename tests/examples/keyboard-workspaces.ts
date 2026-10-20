import { expect, type Page } from '@playwright/test';

async function resizePanels(page: Page) {
  const handle = page.getByRole('separator');
  const vertical =
    (await handle.getAttribute('aria-orientation')) === 'horizontal';
  const panel = page.locator('.sp-split-layout-panel').first();
  const dimension = () =>
    panel.evaluate((element, isVertical) => {
      const bounds = element.getBoundingClientRect();
      return isVertical ? bounds.height : bounds.width;
    }, vertical);
  const before = await dimension();
  await handle.focus();
  await page.keyboard.press(vertical ? 'ArrowDown' : 'ArrowRight');
  await expect.poll(dimension).toBeGreaterThan(before);
  const keyboardSize = await dimension();
  const box = await handle.boundingBox();
  if (!box) throw new Error('Resize handle has no bounds');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + (vertical ? 0 : 30), y + (vertical ? 30 : 0), {
    steps: 6,
  });
  await page.mouse.up();
  await expect.poll(dimension).toBeGreaterThan(keyboardSize);
}

async function adminNavigation(page: Page) {
  const sidebar = page.getByRole('complementary');
  const toggle = sidebar.getByRole('button');
  const initiallyCollapsed =
    (await sidebar.getAttribute('data-collapsed')) !== null;
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAccessibleName(
    initiallyCollapsed ? 'Collapse sidebar' : 'Expand sidebar',
  );
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAccessibleName(
    initiallyCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
  );
  for (const link of await sidebar.getByRole('link').all()) {
    const href = await link.getAttribute('href');
    await link.focus();
    await page.keyboard.press('Enter');
    expect(new URL(page.url()).hash).toBe(href);
  }
}

async function verticalTabs(page: Page) {
  const profile = page.getByRole('tab', { name: 'Profile' });
  const security = page.getByRole('tab', { name: 'Security' });
  await profile.focus();
  await page.keyboard.press('ArrowDown');
  await expect(security).toBeFocused();
  await expect(security).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Security settings');
  await page.keyboard.press('ArrowDown');
  await expect(profile).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Billing' })).toBeDisabled();
  const link = page.getByRole('link', { name: 'Edit profile' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#profile-details$/);
}

export const keyboardCases: Readonly<
  Record<string, (page: Page) => Promise<void>>
> = {
  'split-layout/workspace': resizePanels,
  'split-layout/vertical': resizePanels,
  'admin-layout/workspace': adminNavigation,
  'admin-layout/collapsed': adminNavigation,
  'vertical-tabs-layout/settings': verticalTabs,
};
