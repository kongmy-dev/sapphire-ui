import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { type ExampleRow, readExamples } from '../tooling/examples/catalog';
import { readElementExamples } from '../tooling/examples/elements';

const SITE = 'http://localhost:4178';

async function checkExamples(
  page: Page,
  route: string,
  examples: readonly ExampleRow[],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto(`${SITE}${route}`);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('.docs-example-stage')).toHaveCount(
      examples.length,
    );
    for (const { name } of examples) {
      const stage = page.locator(`#example-${name} .docs-example-stage`);
      await expect
        .poll(
          () => stage.evaluate((element) => element.childElementCount),
          name,
        )
        .toBeGreaterThan(0);
    }
    const duplicates = await page.locator('[id]').evaluateAll((elements) => {
      const ids = elements.map((element) => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicates).toEqual([]);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  expect(errors).toEqual([]);
}

for (const [prefix, rows] of [
  ['components', readExamples(process.cwd())],
  ['native', readElementExamples(process.cwd())],
] as const) {
  for (const component of new Set(rows.map((row) => row.component))) {
    const examples = rows.filter((row) => row.component === component);
    test(`inline examples ${prefix}/${component} retain all examples in both themes`, async ({
      page,
    }) => {
      await checkExamples(page, `/${prefix}/${component}/`, examples);
    });
  }
}

test('Avatar lifecycle uses a styled control and keeps both examples mounted', async ({
  page,
}) => {
  await page.goto(`${SITE}/components/avatar/`);
  const stage = page.locator('#example-lifecycle');
  const button = stage.getByRole('button', { name: 'Break portrait' });
  await expect(button).toHaveClass(/sp-button/);
  await button.click();
  await expect(stage.getByText('AP', { exact: true })).toBeVisible();
  await stage.getByRole('button', { name: 'Restore portrait' }).click();
  await expect(
    stage.getByRole('img', { name: 'Profile portrait' }),
  ).toBeVisible();
  await expect(page.locator('#example-sizes')).toContainText('AB');
});

test('inline command palettes have spacing and independent state with keyboard focus restored', async ({
  page,
}) => {
  await page.goto(`${SITE}/components/command-palette/`);
  const actions = page.locator('#example-actions');
  const navigation = page.locator('#example-navigation');
  const action = actions.getByRole('button', { name: 'Search actions' });
  const gap = await actions.locator('.sp-cluster').evaluate((element) => {
    const button = element.querySelector('button')?.getBoundingClientRect();
    const output = element.querySelector('output')?.getBoundingClientRect();
    return button && output ? output.left - button.right : 0;
  });
  expect(gap).toBeGreaterThanOrEqual(12);
  await action.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  const search = dialog.getByRole('combobox');
  await expect(search).toBeFocused();
  for (const shortcut of ['Control+k', 'Meta+k']) {
    await search.press(shortcut);
    await expect(page.locator('#docs-search-dialog')).not.toHaveAttribute(
      'open',
    );
    await expect(search).toBeFocused();
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await search.fill('save');
  await search.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(actions.getByRole('status')).toHaveText('Draft saved');
  await expect(navigation.getByRole('status')).toHaveText('No command');
  await expect(action).toBeFocused();
  const nav = navigation.getByRole('button', { name: 'Search navigation' });
  await nav.press('Enter');
  await expect(search).toBeFocused();
  await search.press('Escape');
  await expect(nav).toBeFocused();
  await page
    .getByRole('button', { name: 'Search documentation', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Search documentation' }),
  ).toBeVisible();
});

test('Prose explains article typography and expands without a scrolling frame', async ({
  page,
}) => {
  await page.goto(`${SITE}/components/prose/`);
  await expect(page.locator('.docs-lead')).toContainText(
    'Prose gives ordinary article HTML consistent typography and spacing',
  );
  await expect(page.locator('#example-article')).toContainText(
    'Make every detail earn its place.',
  );
  await expect(page.locator('a[href*="preview.html"]')).toHaveCount(0);
  await expect(page.locator('a[href="/v3-v4/"]')).toHaveCount(0);
});

test('SEO metadata output leaves the documentation head intact', async ({
  page,
}) => {
  await page.goto(`${SITE}/components/seo-head/`);
  await expect(page.locator('#example-metadata pre')).toContainText(
    '<title>Sapphire metadata example</title>',
  );
  await expect(page).toHaveTitle('Seo Head · Sapphire UI');
  await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
  await expect(page.locator('head title')).toHaveCount(1);
});

test('native cookie variants remain separate and clickable inline', async ({
  page,
}) => {
  await page.goto(`${SITE}/native/cookie-banner/`);
  const choices = page.locator('#example-choices');
  const localized = page.locator('#example-localized');
  await expect(
    choices.getByRole('button', { name: 'Decline', exact: true }),
  ).toBeVisible();
  await localized.getByRole('button', { name: 'Tolak', exact: true }).click();
  await expect(localized.locator('.sp-cookie-banner')).toHaveCount(0);
  await choices.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect(choices.locator('.sp-cookie-banner')).toHaveCount(0);
  await choices.getByRole('button', { name: 'Reopen privacy choices' }).click();
  await expect(
    choices.getByRole('button', { name: 'Decline', exact: true }),
  ).toBeVisible();
});

test('simultaneous Toast examples stack their notifications without overlap', async ({
  page,
}) => {
  await page.goto(`${SITE}/components/toast/`);
  await page.getByRole('button', { name: 'Show success', exact: true }).click();
  await page
    .getByRole('button', { name: 'Show short notification', exact: true })
    .click();
  await expect(page.locator('.sp-toast-viewport')).toHaveCount(1);
  const first = page.getByText('Changes saved', { exact: true });
  const second = page.getByText('Copied to clipboard', { exact: true });
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  const a = await first.boundingBox();
  const b = await second.boundingBox();
  if (!a || !b) throw new Error('Both notifications must be visible');
  expect(Math.max(a.y - b.y - b.height, b.y - a.y - a.height)).toBeGreaterThan(
    0,
  );
});
