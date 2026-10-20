import { expect, test } from '@playwright/test';
import { EXAMPLE_URL } from '../tooling/examples/catalog';
import { SCHEMES } from '../tooling/source/token-values';

for (const component of [
  'analytics',
  'banner',
  'cookie-banner',
  'site-header',
  'site-footer',
  'toast',
]) {
  for (const scheme of SCHEMES) {
    test(`element equivalence/${component}/${scheme}`, async ({ page }) => {
      await page.goto(
        `${EXAMPLE_URL}/equivalence?component=${component}&scheme=${scheme}`,
      );
      await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
      if (component === 'toast')
        await expect(page.locator('.sp-toast[data-state="open"]')).toHaveCount(
          2,
        );
      const signatures = await page.evaluate(readSignatures, component);
      expect(signatures[0]).toEqual(signatures[1]);
    });
  }
}

function readSignatures(name: string) {
  const signature = (root: Element | null) => {
    if (!root) throw new Error('Missing equivalence root');
    return Array.from(root.querySelectorAll('[class]'), (node) => ({
      classes: node.getAttribute('class'),
      data: Array.from(node.attributes)
        .filter(({ name }) =>
          [
            'data-slot',
            'data-variant',
            'data-size',
            'data-sticky',
            'data-state',
          ].includes(name),
        )
        .map(({ name, value }) => [name, value])
        .sort(),
    }));
  };
  const native = document.querySelector('#native');
  if (name === 'toast')
    return [
      signature(native?.querySelector('.sp-toast-viewport') ?? null),
      signature(document.querySelector('body > .sp-toast-viewport')),
    ];
  return [signature(native), signature(document.querySelector('#react'))];
}
