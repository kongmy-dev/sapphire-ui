import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { exampleUrl } from '../tooling/examples/catalog';
import { readElementExamples } from '../tooling/examples/elements';
import { SCHEMES } from '../tooling/source/token-values';
import { audit } from './examples/audit';
import { nativeKeyboard } from './examples/keyboard-native';

for (const example of readElementExamples(join(import.meta.dirname, '..'))) {
  for (const scheme of SCHEMES) {
    test(`native/${example.component}/${example.name}/${scheme}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(exampleUrl(example, scheme));
      await page.locator('#example > *').first().waitFor({ state: 'attached' });
      await page.evaluate(() => document.fonts.ready);
      await audit(page);
      await nativeKeyboard(page, example.component, example.name);
      await audit(page);
      expect(errors).toEqual([]);
    });
  }
}
