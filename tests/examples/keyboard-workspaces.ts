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
  const sidebar = page.getByRole('complementary', {
    name: 'Workspace navigation',
  });
  const initiallyCollapsed =
    (await sidebar.getAttribute('data-collapsed')) !== null;
  const toggle = page.getByRole('button', {
    name: /^(Expand|Collapse) sidebar$/,
  });
  await toggle.press('Enter');
  await expect(toggle).toHaveAccessibleName(
    initiallyCollapsed ? 'Collapse sidebar' : 'Expand sidebar',
  );
  await toggle.press('Space');
  await expect(toggle).toHaveAccessibleName(
    initiallyCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
  );
  await sidebar.getByRole('link', { name: 'Projects 6' }).press('Enter');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Projects' }),
  ).toBeVisible();
  await sidebar.getByRole('button', { name: 'Library' }).press('Enter');
  await page
    .getByRole('link', { name: 'Archived projects', exact: true })
    .press('Enter');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Archived projects' }),
  ).toBeVisible();
  await sidebar
    .getByRole('link', { name: 'Overview', exact: true })
    .press('Enter');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Workspace overview' }),
  ).toBeVisible();
  const help = sidebar.getByRole('link', { name: 'Help', exact: true });
  const href = await help.getAttribute('href');
  await help.press('Enter');
  expect(new URL(page.url()).hash).toBe(href);
}

async function adminRecords(page: Page) {
  await page.getByRole('button', { name: 'Next', exact: true }).press('Enter');
  await expect(page.getByRole('status')).toHaveText('6 projects · Page 2 of 2');
  await page
    .getByRole('button', { name: 'Previous', exact: true })
    .press('Enter');
  const search = page.getByRole('searchbox', { name: 'Search projects' });
  await search.focus();
  await search.pressSequentially('nothing');
  await expect(
    page.getByRole('heading', { name: 'No projects found' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).press('Enter');
  await expect(search).toHaveValue('');
  const create = page.getByRole('button', { name: 'New project' });
  await create.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Create project' });
  await expect(
    dialog.getByRole('textbox', { name: 'Project name' }),
  ).toBeFocused();
  await dialog
    .getByRole('textbox', { name: 'Project name' })
    .pressSequentially('Keyboard project');
  await dialog
    .getByRole('button', { name: 'Create project', exact: true })
    .press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('row', { name: /Keyboard project/ }),
  ).toBeVisible();
}

async function adminSettings(page: Page) {
  const name = page.getByRole('textbox', { name: 'Workspace name' });
  await name.fill('');
  await page.getByRole('button', { name: 'Save changes' }).press('Enter');
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await name.focus();
  await name.pressSequentially('Sapphire team');
  await page
    .getByRole('checkbox', { name: 'Weekly project summary' })
    .press('Space');
  await page.getByRole('button', { name: 'Save changes' }).press('Enter');
  await expect(page.getByRole('status')).toHaveText(
    'Workspace settings saved.',
  );
  await name.pressSequentially(' updated');
  await expect(page.getByRole('status')).toBeEmpty();
}

async function compoundSelect(page: Page) {
  const trigger = page.getByRole('combobox', { name: 'Billing country' });
  await trigger.press('Enter');
  await expect(
    page.getByRole('option', { name: 'Malaysia', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('option', { name: 'Singapore', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText('Singapore');
}

async function businessFields(page: Page) {
  const name = page.getByRole('textbox', { name: 'Business name' });
  await name.focus();
  await name.press('End');
  await name.pressSequentially(' team');
  await expect(name).toHaveValue('Acme Trading team');
  await page.getByRole('textbox', { name: 'Billing email' }).focus();
  await expect(
    page.getByRole('textbox', { name: 'Billing email' }),
  ).toBeFocused();
}

async function headerAction(page: Page) {
  const action = page.getByRole('button', { name: 'New invoice' });
  await action.press('Enter');
  await expect(action).toBeFocused();
}

async function headerBreadcrumb(page: Page) {
  await page.getByRole('link', { name: 'Settings' }).press('Enter');
  await expect(page).toHaveURL(/#settings$/);
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
  'admin-layout/records': adminRecords,
  'admin-layout/settings': adminSettings,
  'form-field/compound-control': compoundSelect,
  'form-section/business-details': businessFields,
  'page-header/records': headerAction,
  'page-header/breadcrumbs': headerBreadcrumb,
  'vertical-tabs-layout/settings': verticalTabs,
};
