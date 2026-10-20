import { expect, type Page } from '@playwright/test';

export async function popover(page: Page) {
  const trigger = page.locator('#example').getByRole('button').first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const content = page.getByRole('dialog');
  await expect(content).toBeVisible();
  await expect(content.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(content).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(content).toBeVisible();
}

export async function hoverCard(page: Page) {
  const trigger = page.getByRole('link');
  await trigger.focus();
  await expect(page.locator('.sp-hover-card')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.sp-hover-card')).toHaveCount(0);
  await trigger.blur();
  await trigger.focus();
  await expect(page.locator('.sp-hover-card')).toBeVisible();
}

export async function tooltip(page: Page) {
  for (const trigger of await page.getByRole('button').all()) {
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeAttached();
    await expect(trigger).toHaveAttribute('aria-describedby', /.+/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  }
  await page.getByRole('button').first().blur();
  await page.getByRole('button').first().focus();
  await expect(page.getByRole('tooltip')).toBeAttached();
}
