import { expect, type Page } from '@playwright/test';

const forwardTab = (page: Page) =>
  page.context().browser()?.browserType().name() === 'webkit'
    ? 'Alt+Tab'
    : 'Tab';

async function overviewTabs(page: Page) {
  const first = page.getByRole('tab', { name: 'Overview', exact: true });
  const second = page.getByRole('tab', { name: 'Activity', exact: true });
  const disabled = page.getByRole('tab', { name: 'Billing', exact: true });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await expect(disabled).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await expect(first).toBeFocused();
  await page.keyboard.press('End');
  await expect(second).toBeFocused();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  await page.keyboard.press(forwardTab(page));
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).toBeFocused();
}

async function controlledTabs(page: Page) {
  const first = page.getByRole('tab', { name: 'Profile', exact: true });
  const second = page.getByRole('tab', { name: 'Security', exact: true });
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(second).toBeFocused();
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Enter');
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press(forwardTab(page));
  await expect(page.getByRole('tabpanel', { name: 'Security' })).toBeFocused();
}

async function chartValues(page: Page) {
  const bars = page.locator('#example .sp-bar-chart-column');
  for (const bar of await bars.all()) {
    await bar.focus();
    await expect(bar).toBeFocused();
    await expect(bar).toHaveAccessibleName(/^\d+%? .+$/);
    await expect(bar.locator('.sp-bar-chart-value')).toHaveCSS('opacity', '1');
    await page.keyboard.press('Enter');
    await expect(bar).toBeFocused();
  }
}

async function tableLink(page: Page) {
  const link = page.getByRole('link', { name: 'Sapphire', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#sapphire$/);
}

export const keyboardCases: Readonly<
  Record<string, (page: Page) => Promise<void>>
> = {
  'tabs/overview': overviewTabs,
  'tabs/controlled': controlledTabs,
  'bar-chart/monthly': chartValues,
  'bar-chart/unlabelled': chartValues,
  'table/projects': tableLink,
};
