import { expect, type Page } from '@playwright/test';

export async function editFields(page: Page) {
  for (const field of await page
    .locator('input:not(:disabled), textarea:not(:disabled)')
    .all()) {
    const before = await field.inputValue();
    const readOnly = (await field.getAttribute('readonly')) !== null;
    await field.focus();
    await page.keyboard.press('End');
    await field.pressSequentially('example');
    await expect(field).toHaveValue(readOnly ? before : `${before}example`);
  }
}

export async function selectPlans(page: Page) {
  for (const select of await page.locator('select:not(:disabled)').all()) {
    await select.focus();
    await expect(select).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    const option = select.locator('option:checked');
    await expect(option).toHaveCount(1);
    await expect(option).not.toBeDisabled();
  }
}

export async function controlledField(page: Page) {
  await editFields(page);
  await expect(page.locator('output')).toHaveText('example');
}

export async function controlledPlan(page: Page) {
  await page.getByRole('combobox', { name: 'Controlled plan' }).focus();
  await page.keyboard.press('p');
  await page.keyboard.press('Tab');
  await expect(page.locator('output')).toHaveText('pro');
}

export async function validateEmail(page: Page) {
  const field = page.getByRole('textbox', { name: 'Validated email' });
  await field.focus();
  await field.pressSequentially('invalid');
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAccessibleDescription(
    'Use your work email. Enter an email with @.',
  );
  await field.pressSequentially('@example.com');
  await expect(field).not.toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAccessibleDescription('Use your work email.');
}
