import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SITE = 'http://localhost:4178';

for (const scheme of ['light', 'dark'] as const) {
  test(`six real hook demos respond and survive navigation in ${scheme}`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(`${SITE}/hooks/`);
    const debounce = page.locator('#use-debounce');
    await debounce
      .getByRole('textbox', { name: 'Search query' })
      .fill('Updated query');
    await expect(debounce.getByRole('status')).toHaveText('Sapphire');
    await expect(debounce.getByRole('status')).toHaveText('Updated query');
    const storage = page.locator('#use-local-storage');
    await storage
      .getByRole('button', { name: 'Compact preference' })
      .press('Enter');
    await expect(storage.getByRole('status')).toHaveText('Compact');
    await page.reload();
    await expect(storage.getByRole('status')).toHaveText('Compact');
    const outside = page.locator('#use-on-click-outside');
    const toggle = outside.getByRole('button', { name: 'Toggle sample panel' });
    await toggle.press('Enter');
    await expect(outside.getByRole('status')).toHaveText('Panel open');
    await toggle.press('Tab');
    await expect(
      outside.getByRole('textbox', { name: 'Outside focus target' }),
    ).toBeFocused();
    await expect(outside.getByRole('status')).toHaveText('Panel closed');
    await toggle.click();
    await outside
      .getByRole('textbox', { name: 'Outside focus target' })
      .click();
    await expect(outside.getByRole('status')).toHaveText('Panel closed');
    const copy = page.locator('#use-copy-to-clipboard');
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            document.documentElement.dataset.copied = text;
          },
        },
      }),
    );
    await copy.getByRole('button', { name: 'Copy sample text' }).click();
    await expect(copy.getByRole('status')).toHaveText('Copied sample text');
    await expect(page.locator('html')).toHaveAttribute(
      'data-copied',
      'Hello from Sapphire',
    );
    await expect(copy.getByRole('status')).toHaveText('Ready to copy', {
      timeout: 4000,
    });
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error('Denied');
          },
        },
      }),
    );
    await copy.getByRole('button', { name: 'Copy sample text' }).click();
    await expect(copy.getByRole('status')).toContainText('Copy failed.');
    const media = page.locator('#use-media-query');
    const layout = page.locator('#use-isomorphic-layout-effect');
    await expect(media.getByRole('status')).toHaveText('Wide viewport');
    const width = await layout.getByRole('status').textContent();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(media.getByRole('status')).toHaveText('Narrow viewport');
    await layout.getByRole('button', { name: 'Measure card' }).click();
    await expect(layout.getByRole('status')).not.toHaveText(width ?? '');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: info.outputPath(`${scheme}-hooks-mobile.png`),
      fullPage: true,
    });
    await page.goto(`${SITE}/components/button/`);
    await page.goto(`${SITE}/hooks/`);
    await expect(storage.getByRole('status')).toHaveText('Compact');
    await storage.getByRole('button', { name: 'Compact preference' }).click();
    await expect(storage.getByRole('status')).toHaveText('Comfortable');
    await expect(outside.getByRole('status')).toHaveText('Panel closed');
    await expect(debounce.getByRole('status')).toHaveText('Sapphire');
  });
}
