import { expect, type Page } from '@playwright/test';

export async function badgeLink(page: Page) {
  await page.getByRole('link', { name: 'View details' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#badge-details$/);
}

export async function dismissChip(page: Page) {
  const remove = page.getByRole('button', { name: 'Remove design filter' });
  await remove.focus();
  await page.keyboard.press('Enter');
  await expect(remove).toHaveCount(0);
  await page.getByRole('button', { name: 'Restore filter' }).focus();
  await page.keyboard.press('Space');
  await expect(remove).toBeVisible();
}

export async function avatarLifecycle(page: Page) {
  const image = page.getByRole('img', { name: 'Profile portrait' });
  await expect(image).toBeVisible();
  await page.getByRole('button', { name: 'Break portrait' }).focus();
  await page.keyboard.press('Enter');
  await expect(image).toHaveCount(0);
  await expect(page.getByText('AP', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restore portrait' }).focus();
  await page.keyboard.press('Enter');
  await expect(image).toBeVisible();
}

export async function pagination(page: Page) {
  for (const nav of await page.getByRole('navigation').all()) {
    const target = nav.getByRole('button', {
      name: 'Go to page 2',
      exact: true,
    });
    await target.focus();
    await page.keyboard.press('Enter');
    await expect(target).toHaveAttribute('aria-current', 'page');
    const previous = nav.getByRole('button', { name: 'Go to previous page' });
    if (await previous.count()) {
      await previous.focus();
      await page.keyboard.press('Enter');
      await expect(previous).toBeDisabled();
      await expect(
        nav.getByRole('button', { name: 'Go to page 1', exact: true }),
      ).toHaveAttribute('aria-current', 'page');
    }
  }
}

export async function separatorLinks(page: Page) {
  for (const name of ['Overview', 'Details']) {
    await page.getByRole('link', { name }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
  }
}
