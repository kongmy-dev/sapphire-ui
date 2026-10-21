import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SITE = 'http://localhost:4178';

for (const scheme of ['light', 'dark'] as const) {
  test(`usage copy, keyboard focus and repeated navigation in ${scheme}`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ colorScheme: scheme });
    for (const component of ['button', 'dialog', 'button']) {
      await page.goto(`${SITE}/components/${component}/`);
      const example = page.locator('.docs-example').first();
      await expect(example.locator('[data-html-source] code')).toHaveCount(1);
      const jsx = example.getByText('JSX usage', { exact: true });
      await jsx.focus();
      await jsx.press('Enter');
      const button = example.getByRole('button', {
        name: 'Copy JSX',
        exact: true,
      });
      const sourceBlock = button.locator('..');
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
      await button.focus();
      await button.press('Enter');
      await expect(button).toBeFocused();
      await expect(sourceBlock.locator('[role="status"]')).toHaveText(
        'Copied.',
      );
      const source = await sourceBlock.locator('code').textContent();
      await expect(page.locator('html')).toHaveAttribute(
        'data-copied',
        source ?? '',
      );
      await expect(sourceBlock.locator('code')).toContainText(
        `@kongmy-dev/sapphire-ui/${component}`,
      );
      await example.getByText('HTML markup', { exact: true }).click();
      await example
        .getByRole('button', { name: 'Copy HTML', exact: true })
        .click();
      await expect(page.locator('html')).toHaveAttribute(
        'data-copied',
        /<button/,
      );
      await page.evaluate(() =>
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: undefined,
        }),
      );
      await button.click();
      await expect(sourceBlock.locator('[role="status"]')).toContainText(
        'Could not copy.',
      );
      await page.setViewportSize({ width: 390, height: 844 });
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
      if (component === 'button')
        await page.screenshot({
          path: info.outputPath(`${scheme}-usage-mobile.png`),
          fullPage: true,
        });
      await page.setViewportSize({ width: 1280, height: 720 });
    }
  });
}

test('native and CSS-only examples expose copyable rendered HTML', async ({
  page,
}) => {
  for (const route of ['native/banner', 'components/document']) {
    await page.goto(`${SITE}/${route}/`);
    const example = page.locator('.docs-example').first();
    await example.getByText('HTML markup', { exact: true }).click();
    await expect(example.locator('[data-html-source] code')).toContainText('<');
    await expect(
      example.getByRole('button', { name: 'Copy HTML', exact: true }),
    ).toBeVisible();
    if (route.startsWith('native'))
      await expect(example.getByText('JSX usage', { exact: true })).toHaveCount(
        0,
      );
  }
});

test('pasted native markup upgrades once and retains its behavior', async ({
  page,
}) => {
  await page.goto(`${SITE}/native/banner/`);
  const example = page.locator('.docs-example').first();
  const source = await example.locator('[data-html-source] code').textContent();
  expect(source).not.toContain('data-sapphire-banner-dismiss');
  const result = await page.evaluate((html) => {
    const holder = document.createElement('div');
    holder.innerHTML = html ?? '';
    document.querySelector('main')?.append(holder);
    const dismiss = holder.querySelector('button');
    const count = holder.querySelectorAll('button').length;
    dismiss?.click();
    const hidden = holder
      .querySelector('sapphire-banner')
      ?.hasAttribute('hidden');
    holder.remove();
    return { count, hidden };
  }, source);
  expect(result).toEqual({ count: 1, hidden: true });
});

test('copied icon and navy surface examples include their extra requirements', async ({
  page,
}) => {
  await page.goto(`${SITE}/components/button/`);
  const icons = page.locator('#example-icons');
  await icons.getByText('JSX usage', { exact: true }).click();
  await expect(
    icons
      .getByRole('button', { name: 'Copy install command' })
      .locator('..')
      .locator('code'),
  ).toContainText('lucide-react');
  const dark = page.locator('#example-on-dark');
  await dark.getByText('Example CSS', { exact: true }).click();
  await expect(
    dark
      .getByRole('button', { name: 'Copy CSS' })
      .locator('..')
      .locator('code'),
  ).toContainText('.sp-button-demo-dark');
  await expect(
    dark
      .getByRole('button', { name: 'Copy CSS' })
      .locator('..')
      .locator('code'),
  ).toContainText('var(--primary)');
});

test('page metadata describes its purpose and is isolated from SEO examples', async ({
  page,
}) => {
  for (const component of ['button', 'dialog', 'seo-head']) {
    await page.goto(`${SITE}/components/${component}/`);
    const lead = await page.locator('.docs-lead').textContent();
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
      'content',
      lead ?? '',
    );
    await expect(page.locator('head title')).toHaveCount(1);
    await expect(page).toHaveTitle(
      new RegExp(
        `${component === 'seo-head' ? 'Seo Head' : component[0]?.toUpperCase() + component.slice(1)} · Sapphire UI`,
      ),
    );
  }
});
