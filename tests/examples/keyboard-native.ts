import { expect, type Page } from '@playwright/test';

async function activate(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).focus();
  await page.keyboard.press('Enter');
}

async function banner(page: Page, name: string) {
  await activate(page, 'Dismiss');
  await expect(page.locator('sapphire-banner')).toBeHidden();
  if (name !== 'persistent') return;
  await page.reload();
  await expect(page.locator('sapphire-banner')).toBeHidden();
}

async function navigate(page: Page, label: string) {
  await page.getByRole('link', { name: label, exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`#${label.toLowerCase()}$`));
}

async function analytics(page: Page) {
  await activate(page, 'Allow analytics');
  await expect(page.locator('html')).toHaveAttribute(
    'data-sapphire-consent',
    'true',
  );
  await activate(page, 'Withdraw analytics');
  await expect(page.locator('html')).toHaveAttribute(
    'data-sapphire-consent',
    'false',
  );
}

async function consent(page: Page, name: string) {
  await activate(page, name === 'localized' ? 'Tolak' : 'Decline');
  await expect(page.locator('cookie-banner .sp-cookie-banner')).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute(
    'data-sapphire-consent',
    'false',
  );
  if (name !== 'choices') return;
  await activate(page, 'Reopen privacy choices');
  await expect(page.locator('cookie-banner .sp-cookie-banner')).toBeVisible();
  await activate(page, 'Accept');
  await expect(page.locator('html')).toHaveAttribute(
    'data-sapphire-consent',
    'true',
  );
}

async function toast(page: Page) {
  for (const status of ['success', 'info', 'warning', 'error']) {
    await activate(page, `Show ${status}`);
    await expect(page.locator(`.sp-toast[data-variant="${status}"]`)).toHaveCSS(
      'opacity',
      '1',
    );
  }
}

const cases: Record<string, (page: Page, name: string) => Promise<void>> = {
  banner,
  'site-header': (page) => navigate(page, 'Features'),
  'site-footer': (page) => navigate(page, 'Privacy'),
  analytics,
  'cookie-banner': consent,
  toast,
};

export async function nativeKeyboard(
  page: Page,
  component: string,
  name: string,
) {
  const run = cases[component];
  if (!run)
    throw new Error(`Missing native keyboard coverage: ${component}/${name}`);
  await run(page, name);
}
