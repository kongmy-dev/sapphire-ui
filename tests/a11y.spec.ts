import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Each route in the docs SPA is exercised. The smoke goal is zero
// WCAG 2.1 A/AA violations on initial render. Per-component interactive
// state (open dialogs, expanded accordions) is covered by component-specific
// tests added as Phase 2 work lands.
//
// Mode:
//   default          → reports violations, passes (captures baseline without
//                      blocking CI on pre-existing debt).
//   STRICT_A11Y=1    → hard-fails on any violation. Flip this on once the
//                      known violations are fixed (Phase 2 quality pass).
const ROUTES = [
  { path: '/', name: 'overview' },
  { path: '/colors', name: 'colors' },
  { path: '/typography', name: 'typography' },
  { path: '/buttons', name: 'buttons' },
  { path: '/cards', name: 'cards' },
  { path: '/forms', name: 'forms' },
  { path: '/feedback', name: 'feedback' },
  { path: '/data', name: 'data' },
  { path: '/interactive', name: 'interactive' },
  { path: '/extended', name: 'extended' },
  { path: '/hooks', name: 'hooks' },
];

const strict = process.env.STRICT_A11Y === '1';

for (const { path, name } of ROUTES) {
  test(`a11y: ${name} (${path})`, async ({ page }, testInfo) => {
    await page.goto(path);
    await page.waitForSelector('main.docs-main', { timeout: 10_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      help: v.helpUrl,
    }));

    await testInfo.attach('a11y-summary.json', {
      body: JSON.stringify({ route: path, summary }, null, 2),
      contentType: 'application/json',
    });

    if (results.violations.length > 0) {
      console.warn(
        `[a11y] ${path}: ${results.violations.length} violation(s)`,
        summary,
      );
    }

    if (strict) {
      expect(results.violations).toEqual([]);
    }
  });
}
