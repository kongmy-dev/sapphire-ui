import { expect, type Page } from '@playwright/test';

const forwardTab = (page: Page) =>
  page.context().browser()?.browserType().name() === 'webkit'
    ? 'Alt+Tab'
    : 'Tab';

async function breadcrumbTrail(page: Page) {
  const home = page.getByRole('link', { name: 'Home', exact: true });
  await home.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#home$/);
  await home.focus();
  await page.keyboard.press(forwardTab(page));
  await expect(
    page.getByRole('link', { name: 'Components', exact: true }),
  ).toBeFocused();
  await expect(page.locator('[aria-current="page"]')).toHaveText('Breadcrumb');
}

async function breadcrumbNavigation(page: Page) {
  const projects = page.getByRole('link', { name: 'Projects', exact: true });
  await projects.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Destination: #projects');
  await expect(page).not.toHaveURL(/#projects$/);
  await expect(projects).toBeFocused();
}

async function copyCode(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedText = text;
        },
      },
    });
  });
  const button = page.getByRole('button', { name: 'Copy code to clipboard' });
  await button.focus();
  await page.keyboard.press('Enter');
  const copied = page.getByRole('button', { name: 'Copied', exact: true });
  await expect(copied).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute(
    'data-copied-text',
    'const answer = 42;',
  );
  await expect(button).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          document.documentElement.dataset.clipboardDenied = 'true';
          throw new Error('Clipboard access denied');
        },
      },
    });
  });
  await page.keyboard.press('Space');
  await expect(button).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute(
    'data-clipboard-denied',
    'true',
  );
  await expect(copied).toHaveCount(0);
}

async function toggleFormatting(page: Page) {
  for (const name of ['Bold', 'Italic']) {
    const toggle = page.getByRole('button', { name, exact: true });
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  }
  await expect(
    page.getByRole('button', { name: 'Underline', exact: true }),
  ).toBeDisabled();
}

async function toggleAlignment(page: Page) {
  const left = page.getByRole('radio', { name: 'Align left' });
  const center = page.getByRole('radio', { name: 'Align center' });
  await left.focus();
  await page.keyboard.press('ArrowRight');
  await expect(center).toBeFocused();
  await page.keyboard.press('Space');
  await expect(center).toBeChecked();
  await expect(left).not.toBeChecked();
  await page.keyboard.press('ArrowRight');
  const right = page.getByRole('radio', { name: 'Align right' });
  await expect(right).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(right).toBeChecked();
}

async function toggleMultiple(page: Page) {
  const bold = page.getByRole('button', { name: 'Bold text' });
  const italic = page.getByRole('button', { name: 'Italic text' });
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  await bold.focus();
  await page.keyboard.press('ArrowRight');
  await expect(italic).toBeFocused();
  await page.keyboard.press('Space');
  await expect(italic).toHaveAttribute('aria-pressed', 'true');
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
}

async function scrollArea(page: Page) {
  const region = page.locator('#example').getByRole('region');
  await region.focus();
  await expect(region).toBeFocused();
  const horizontal =
    (await region.getAttribute('aria-label')) === 'Release timeline';
  const key = horizontal ? 'ArrowRight' : 'ArrowDown';
  await page.keyboard.down(key);
  await expect
    .poll(() =>
      region.evaluate(
        (element, axis) => (axis ? element.scrollLeft : element.scrollTop),
        horizontal,
      ),
    )
    .toBeGreaterThan(0);
  await page.keyboard.up(key);
  await expect(region).toBeFocused();
}

async function accordion(page: Page) {
  const triggers = page
    .locator('#example')
    .getByRole('button')
    .filter({ visible: true });
  const first = triggers.nth(0);
  const second = triggers.nth(1);
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(second).toBeFocused();
  await page.keyboard.press('End');
  await expect(second).toBeFocused();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  const expanded = await first.getAttribute('aria-expanded');
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute(
    'aria-expanded',
    String(expanded !== 'true'),
  );
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', expanded ?? 'false');
  await second.focus();
  await page.keyboard.press('Space');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('region', { name: await second.innerText() }),
  ).toBeVisible();
  const disabled = page.getByRole('button', { name: 'Unavailable question' });
  if (await disabled.count()) {
    await expect(disabled).toBeDisabled();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(
      page.getByRole('region', { name: await first.innerText() }),
    ).toHaveCount(0);
  } else {
    await expect(first).toHaveAttribute('aria-expanded', 'true');
  }
}

export const keyboardCases: Readonly<
  Record<string, (page: Page) => Promise<void>>
> = {
  'breadcrumb/trail': breadcrumbTrail,
  'breadcrumb/navigation': breadcrumbNavigation,
  'code-block/copy': copyCode,
  'toggle/formatting': toggleFormatting,
  'toggle/alignment': toggleAlignment,
  'toggle/multiple': toggleMultiple,
  'scroll-area/vertical': scrollArea,
  'scroll-area/horizontal': scrollArea,
  'accordion/questions': accordion,
  'accordion/multiple': accordion,
};
