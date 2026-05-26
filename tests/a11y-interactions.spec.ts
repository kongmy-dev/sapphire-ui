import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Initial-render a11y is covered in a11y.spec.ts. This suite exercises the
// *open* state of portaled primitives — focus traps, role wiring, contrast
// in popover / sheet / menu bodies — which axe can only see while the
// component is mounted.
//
// Mode mirrors a11y.spec.ts: default reports violations, STRICT_A11Y=1
// hard-fails.

const strict = process.env.STRICT_A11Y === '1';

async function runAxe(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
}

test.describe('Extended page interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/extended');
    await page.waitForSelector('main.docs-main', { timeout: 10_000 });
  });

  test('a11y: Accordion (expanded)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /What is Sapphire UI/i });
    await trigger.click();
    await page.waitForTimeout(300);
    const results = await runAxe(page);
    if (results.violations.length > 0) {
      console.warn('[a11y] accordion-open', results.violations.map((v) => v.id));
    }
    if (strict) expect(results.violations).toEqual([]);
  });
});

test.describe('Interactive page interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/interactive');
    await page.waitForSelector('main.docs-main', { timeout: 10_000 });
  });

  test('a11y: Popover (open)', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit profile' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 2_000 });
    const results = await runAxe(page);
    if (results.violations.length > 0) {
      console.warn('[a11y] popover-open', results.violations.map((v) => v.id));
    }
    if (strict) expect(results.violations).toEqual([]);
  });

  test('a11y: Sheet (open)', async ({ page }) => {
    await page.getByRole('button', { name: 'right', exact: true }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 2_000 });
    const results = await runAxe(page);
    if (results.violations.length > 0) {
      console.warn('[a11y] sheet-open', results.violations.map((v) => v.id));
    }
    if (strict) expect(results.violations).toEqual([]);
  });

  test('a11y: DropdownMenu (open)', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.waitForSelector('[role="menu"]', { timeout: 2_000 });
    const results = await runAxe(page);
    if (results.violations.length > 0) {
      console.warn('[a11y] dropdown-open', results.violations.map((v) => v.id));
    }
    if (strict) expect(results.violations).toEqual([]);
  });
});

test.describe('App shell interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.docs-main', { timeout: 10_000 });
  });

  test('a11y: Command Palette (open)', async ({ page }) => {
    await page.getByRole('button', { name: 'Open command palette' }).click();
    await page.waitForSelector('[role="listbox"]', { timeout: 2_000 });
    const results = await runAxe(page);
    if (results.violations.length > 0) {
      console.warn('[a11y] command-palette-open', results.violations.map((v) => v.id));
    }
    if (strict) expect(results.violations).toEqual([]);
  });
});
