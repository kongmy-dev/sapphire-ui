import { expect, type Page } from '@playwright/test';

export async function cookiePreferences(page: Page) {
  const notice = page.getByRole('complementary', {
    name: 'We value your privacy',
  });
  await expect(notice).toBeVisible();
  await page.getByRole('button', { name: 'Decline', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(notice).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.getAttribute('data-sapphire-consent'),
      ),
    )
    .toBe('false');
  await page.getByRole('button', { name: 'Cookie preferences' }).focus();
  await page.keyboard.press('Enter');
  await expect(notice).toBeVisible();
  await page.getByRole('button', { name: 'Accept', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.getAttribute('data-sapphire-consent'),
      ),
    )
    .toBe('true');
  await page.getByRole('button', { name: 'Cookie preferences' }).focus();
  await page.keyboard.press('Enter');
  await expect(notice).toBeVisible();
}

export async function banner(page: Page) {
  const link = page.getByRole('link', { name: 'Read release notes' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#release-notes$/);
  await page.getByRole('button', { name: 'Dismiss' }).focus();
  await page.keyboard.press('Enter');
  await expect(link).not.toBeVisible();
  await page.getByRole('button', { name: 'Show announcement' }).focus();
  await page.keyboard.press('Enter');
  await expect(link).toBeVisible();
}
