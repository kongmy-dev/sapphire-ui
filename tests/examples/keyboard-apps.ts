import { expect, type Page } from '@playwright/test';

async function dropdownActions(page: Page) {
  const trigger = page.getByRole('button', { name: 'Project actions' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const first = page.getByRole('menuitem', { name: /^Edit/ });
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
  await expect(page.getByRole('menuitem', { name: 'Archive' })).toBeDisabled();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(page.locator('output')).toHaveText('Duplicated');
  await expect(trigger).toBeFocused();
}

async function dropdownPreferences(page: Page) {
  const trigger = page.getByRole('button', { name: 'View preferences' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const checkbox = page.getByRole('menuitemcheckbox', { name: 'Show sidebar' });
  await expect(checkbox).toBeFocused();
  await page.keyboard.press('Space');
  await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  await page.keyboard.press('End');
  const compact = page.getByRole('menuitemradio', { name: 'Compact' });
  await expect(compact).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('output')).toHaveText('Sidebar hidden; compact');
  await expect(trigger).toBeFocused();
}

async function commands(page: Page) {
  const trigger = page.locator('#example').getByRole('button');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const input = page.getByRole('combobox', { name: 'Search commands' });
  await expect(input).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option').nth(1)).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await input.fill('no-matching-command');
  await expect(page.getByRole('status')).toContainText('No matches');
  await page.keyboard.press('ArrowDown');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
}

export const keyboardCases: Readonly<
  Record<string, (page: Page) => Promise<void>>
> = {
  'dropdown-menu/actions': dropdownActions,
  'dropdown-menu/preferences': dropdownPreferences,
  'command-palette/navigation': commands,
  'command-palette/actions': commands,
};
