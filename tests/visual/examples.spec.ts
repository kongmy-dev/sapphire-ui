import { join } from 'node:path';
import type { Page } from '@playwright/test';
import { exampleUrl, readVisualExamples } from '../../tooling/examples/catalog';
import { SCHEMES } from '../../tooling/source/token-values';
import { expect, test } from './fixtures';

const cases = readVisualExamples(join(import.meta.dirname, '../..'));

async function openExample(page: Page, component: string) {
  if (component === 'hover-card') {
    await page.getByRole('link').focus();
    await expect(page.locator('.sp-hover-card')).toBeVisible();
    return;
  }
  const role = component === 'select' ? 'combobox' : 'button';
  await page.locator('#example').getByRole(role).first().focus();
  if (component === 'tooltip') {
    await expect(page.getByRole('tooltip')).toBeAttached();
    return;
  }
  await page.keyboard.press('Enter');
  if (component === 'toast') {
    await page.clock.runFor(100);
    await expect(page.locator('.sp-toast[data-state="open"]')).toBeVisible();
    return;
  }
  if (component === 'dropdown-menu') {
    await expect(page.getByRole('menu')).toBeVisible();
    return;
  }
  await expect(
    page.getByRole(component === 'select' ? 'listbox' : 'dialog'),
  ).toBeVisible();
}

async function settleAvatar(page: Page, component: string) {
  if (!['avatar', 'avatar-group'].includes(component)) return;
  await expect
    .poll(() =>
      page.locator('.sp-avatar:not(:has(img, .sp-avatar-fallback))').count(),
    )
    .toBe(0);
  await page.locator('.sp-avatar:has(img)').evaluateAll(async (avatars) => {
    const originals = avatars.map((avatar) => ({
      avatar,
      style: avatar.getAttribute('style'),
    }));
    for (const avatar of avatars) {
      avatar.setAttribute(
        'style',
        `${avatar.getAttribute('style') ?? ''};visibility:hidden`,
      );
    }
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    for (const { avatar, style } of originals) {
      if (style === null) avatar.removeAttribute('style');
      else avatar.setAttribute('style', style);
    }
  });
}

for (const { example, open, name } of cases) {
  test(name, async ({ page }, testInfo) => {
    const scheme = SCHEMES.find((name) => name === testInfo.project.name);
    if (!scheme) throw new Error('Unknown color scheme');
    if (example.component === 'toast') await page.clock.install();
    if (example.component === 'mobile-nav')
      await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(exampleUrl(example, scheme));
    await page.locator('#example > *').first().waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    await settleAvatar(page, example.component);
    if (open) await openExample(page, example.component);
    await expect(page).toHaveScreenshot(
      [
        'react',
        example.component,
        `${example.name}${open ? '-open' : ''}.${scheme}.png`,
      ],
      { fullPage: true },
    );
  });
}
