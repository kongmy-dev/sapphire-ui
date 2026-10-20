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
  await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('output')).toHaveText('Duplicated');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();
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
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();
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
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function proposal(page: Page) {
  await page.getByRole('link', { name: 'Review proposal' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#proposal-approval$/);
}

async function passphrase(page: Page) {
  const input = page.getByLabel('Passphrase', { exact: true });
  await input.fill('incorrect');
  await page.keyboard.press('Enter');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('alert')).toHaveText(
    'Incorrect passphrase. Try demo.',
  );
  await input.fill('demo');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Document unlocked.')).toBeVisible();
  const lock = page.getByRole('button', { name: 'Lock document' });
  await lock.focus();
  await page.keyboard.press('Enter');
  await expect(input).toBeVisible();
}

async function wizard(page: Page) {
  const launcher = page.getByRole('button', { name: 'Open setup wizard' });
  const modal = (await launcher.count()) > 0;
  if (modal) {
    await launcher.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
  }
  const next = page.getByRole('button', { name: 'Next', exact: true });
  await next.focus();
  await page.keyboard.press('Enter');
  const back = page.getByRole('button', { name: 'Back', exact: true });
  await back.focus();
  await page.keyboard.press('Enter');
  await next.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Finish', exact: true }).focus();
  await page.keyboard.press('Enter');
  if (!modal) {
    await expect(page.getByRole('status')).toHaveText('Workspace created');
    return;
  }
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(launcher).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
}

export const keyboardCases: Readonly<
  Record<string, (page: Page) => Promise<void>>
> = {
  'proposal-layout/complete': proposal,
  'passphrase-gate/document': passphrase,
  'wizard-layout/inline': wizard,
  'wizard-layout/modal': wizard,
  'dropdown-menu/actions': dropdownActions,
  'dropdown-menu/preferences': dropdownPreferences,
  'command-palette/navigation': commands,
  'command-palette/actions': commands,
};
