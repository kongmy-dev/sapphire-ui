import { expect, type Locator, type Page, test } from '@playwright/test';
import { exampleUrl } from '../tooling/examples/catalog';

const headingExamples = [
  {
    component: 'dialog',
    example: 'uncontrolled',
    trigger: 'Open dialog',
    productSize: '18px',
    editorialSize: '52px',
  },
  {
    component: 'sheet',
    example: 'settings',
    trigger: 'Open workspace settings',
    productSize: '18px',
    editorialSize: '52px',
  },
  {
    component: 'empty',
    example: 'message',
    trigger: '',
    productSize: '16px',
    editorialSize: '32px',
  },
  {
    component: 'cookie-banner',
    example: 'preferences',
    trigger: '',
    productSize: '16px',
    editorialSize: '32px',
  },
  {
    component: 'wizard-layout',
    example: 'inline',
    trigger: '',
    productSize: '18px',
    editorialSize: '52px',
  },
  {
    component: 'page-section',
    example: 'heading',
    trigger: '',
    productSize: '18px',
    editorialSize: '52px',
  },
  {
    component: 'callout',
    example: 'notice',
    trigger: '',
    productSize: '16px',
    editorialSize: '32px',
  },
  {
    component: 'passphrase-gate',
    example: 'document',
    trigger: '',
    productSize: '28px',
    editorialSize: '72px',
  },
] as const;

type HeadingExample = (typeof headingExamples)[number];

async function openExample(
  page: Page,
  example: HeadingExample,
  scheme: 'light' | 'dark',
) {
  await page.setViewportSize({ width: 1300, height: 800 });
  await page.goto(
    exampleUrl(
      {
        component: example.component,
        name: example.example,
        file: `components/${example.component}/${example.component}.examples.tsx`,
      },
      scheme,
    ),
  );
  if (example.trigger)
    await page
      .getByRole('button', { name: example.trigger, exact: true })
      .click();
  const title = page.locator(`.sp-${example.component}-title`);
  await expect(title).toBeVisible();
  return title;
}

async function expectHeading(title: Locator, size: string, family: RegExp) {
  await expect(title).toHaveCSS('font-family', family);
  await expect(title).toHaveCSS('font-size', size);
  await expect(title).toHaveCSS('font-weight', '600');
}

async function setTypography(
  scope: Locator,
  typography: 'product' | 'editorial' | null,
) {
  await scope.evaluate((element, value) => {
    if (value) element.setAttribute('data-typography', value);
    else element.removeAttribute('data-typography');
  }, typography);
}

for (const scheme of ['light', 'dark'] as const) {
  for (const example of headingExamples) {
    test(`${example.component} title inherits product and editorial typography in ${scheme}`, async ({
      page,
    }) => {
      const title = await openExample(page, example, scheme);
      const root = page.locator(`.sp-${example.component}`);
      await expectHeading(title, example.productSize, /Source Sans 3/);
      await setTypography(page.locator('body'), 'editorial');
      await expectHeading(title, example.editorialSize, /Newsreader/);
      await setTypography(root, 'product');
      await expectHeading(title, example.productSize, /Source Sans 3/);
      await setTypography(root, null);
      await setTypography(page.locator('body'), null);
      await setTypography(page.locator('html'), 'editorial');
      await expectHeading(title, example.editorialSize, /Newsreader/);
      await setTypography(root, 'product');
      await expectHeading(title, example.productSize, /Source Sans 3/);
    });
  }

  test(`callout retains its public title size override in ${scheme}`, async ({
    page,
  }) => {
    const title = await openExample(page, headingExamples[6], scheme);
    await page.locator('.sp-callout').evaluate((element) => {
      element.style.setProperty('--sp-callout-title-size', 'var(--text-lg)');
    });
    await expectHeading(title, '18px', /Source Sans 3/);
    await setTypography(page.locator('html'), 'editorial');
    await expectHeading(title, '18px', /Newsreader/);
  });

  test(`passphrase brand and document retain serif typography in ${scheme}`, async ({
    page,
  }) => {
    const title = await openExample(page, headingExamples[7], scheme);
    await expectHeading(title, '28px', /Source Sans 3/);
    for (const part of ['brand', 'mark', 'document']) {
      await expect(page.locator(`.sp-passphrase-gate-${part}`)).toHaveCSS(
        'font-family',
        /Newsreader/,
      );
    }
  });
}
