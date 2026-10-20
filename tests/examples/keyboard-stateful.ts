import { expect, type Page } from '@playwright/test';

export async function checkboxes(page: Page) {
  for (const control of await page.getByRole('checkbox').all()) {
    if (await control.isDisabled()) continue;
    const before = await control.getAttribute('aria-checked');
    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).toHaveAttribute(
      'aria-checked',
      String(before !== 'true'),
    );
  }
  const reset = page.getByRole('button', { name: 'Reset mixed selection' });
  if (await reset.count()) {
    await expect(page.locator('output')).toHaveText('true');
    await reset.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  }
}

export async function switches(page: Page) {
  for (const control of await page.getByRole('switch').all()) {
    if (await control.isDisabled()) continue;
    const before = await control.getAttribute('aria-checked');
    await control.focus();
    await page.keyboard.press('Space');
    await expect(control).toHaveAttribute(
      'aria-checked',
      String(before !== 'true'),
    );
  }
  if (await page.locator('output').count())
    await expect(page.locator('output')).toHaveText('Enabled');
}

export async function radios(page: Page) {
  const controls = page.getByRole('radio').filter({ visible: true });
  await controls.first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(controls.nth(1)).toBeChecked();
  await expect(controls.nth(1)).toBeFocused();
  if (await page.locator('output').count())
    await expect(page.locator('output')).toHaveText('annual');
  await page.keyboard.press('ArrowDown');
  await expect(controls.first()).toBeChecked();
}

export async function sliders(page: Page) {
  for (const control of await page.getByRole('slider').all()) {
    if ((await control.getAttribute('data-disabled')) !== null) continue;
    const before = Number(await control.getAttribute('aria-valuenow'));
    await control.focus();
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(async () => Number(await control.getAttribute('aria-valuenow')))
      .toBeGreaterThan(before);
    await page.keyboard.press('ArrowLeft');
    await expect(control).toHaveAttribute('aria-valuenow', String(before));
  }
}

export async function selectOptions(page: Page) {
  const controls = page.getByRole('combobox');
  for (const control of await controls.all()) {
    if (await control.isDisabled()) continue;
    await control.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await expect(
      page.getByRole('option', { name: 'Pro', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(control).toBeFocused();
    await expect(control).toHaveText('Pro');
  }
  if (await page.locator('output').count())
    await expect(page.locator('output')).toHaveText('pro');
  await controls.first().focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(controls.first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
}

export async function notifications(page: Page) {
  for (const control of await page.getByRole('button').all()) {
    await control.focus();
    await page.keyboard.press('Enter');
    await expect(control).toBeFocused();
  }
  const toasts = page.locator('.sp-toast');
  if (
    await page.getByRole('button', { name: 'Show short notification' }).count()
  ) {
    await expect(page.getByRole('status')).toContainText('Copied to clipboard');
    await expect(toasts).toHaveCount(0);
  } else {
    await expect(toasts).toHaveCount(4);
    for (const toast of await toasts.all())
      await expect(toast).toHaveCSS('opacity', '1');
    await expect(page.getByRole('status')).toContainText(
      'Unable to save changes',
    );
  }
}
