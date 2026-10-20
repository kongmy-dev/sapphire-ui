import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { exampleUrl, readExamples } from '../tooling/examples/catalog';
import { SCHEMES } from '../tooling/source/token-values';
import { audit } from './examples/audit';
import { keyboardCases } from './examples/keyboard-cases';

const root = join(import.meta.dirname, '..');
const actionable = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="slider"]',
  '[role="tab"]',
  '[role="menuitem"]',
].join(',');

for (const example of readExamples(root)) {
  for (const scheme of SCHEMES) {
    test(`react/${example.component}/${example.name}/${scheme}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      if (example.component === 'mobile-nav')
        await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(exampleUrl(example, scheme));
      await page.locator('#example > *').first().waitFor({ state: 'attached' });
      await page.evaluate(() => document.fonts.ready);
      await audit(page);
      const controls = page.locator(actionable);
      const enabled = await controls.evaluateAll((elements) =>
        elements.some(
          (element) =>
            !element.matches(
              ':disabled, [aria-disabled="true"], [tabindex="-1"]',
            ) && element.getBoundingClientRect().width > 0,
        ),
      );
      const run = keyboardCases[`${example.component}/${example.name}`];
      if (enabled)
        expect(run, 'Interactive examples need a keyboard case').toBeDefined();
      if (run) await run(page);
      await audit(page);
      expect(errors).toEqual([]);
    });
  }
}
