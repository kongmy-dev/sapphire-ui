import { expect, type Page } from '@playwright/test';

const forwardTab = (page: Page) =>
  page.context().browser()?.browserType().name() === 'webkit'
    ? 'Alt+Tab'
    : 'Tab';

function linkColor(
  element: HTMLElement | SVGElement,
  input: { kind: 'header' | 'footer'; variant: 'light' | 'dark' },
) {
  element.setAttribute('data-variant', input.variant);
  const tokens = {
    light: {
      current: '--foreground-strong',
      normal: '--muted-foreground',
    },
    dark: { current: '--brand', normal: '--on-dark-muted' },
  };
  const active =
    input.kind === 'header' && element.getAttribute('aria-current') === 'page';
  const token = tokens[input.variant][active ? 'current' : 'normal'];
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  element.append(probe);
  const result = {
    actual: getComputedStyle(element).color,
    expected: getComputedStyle(probe).color,
  };
  probe.remove();
  return result;
}

async function independentLinkVariants(page: Page, kind: 'header' | 'footer') {
  for (const link of await page.locator(`.sp-site-${kind}-link`).all()) {
    const original = await link.getAttribute('data-variant');
    for (const variant of ['light', 'dark'] as const) {
      const colors = await link.evaluate(linkColor, { kind, variant });
      await expect(link).toHaveCSS('color', colors.expected);
    }
    await link.evaluate((element, value) => {
      if (value === null) element.removeAttribute('data-variant');
      else element.setAttribute('data-variant', value);
    }, original);
  }
}

async function headerLinks(page: Page) {
  await independentLinkVariants(page, 'header');
  for (const link of await page.getByRole('link').all()) {
    const href = await link.getAttribute('href');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL((url) => url.hash === href);
  }
}

async function footerLinks(page: Page) {
  await independentLinkVariants(page, 'footer');
  for (const link of await page.getByRole('link').all()) {
    const href = await link.getAttribute('href');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL((url) => url.hash === href);
  }
}

async function themeToggle(page: Page) {
  const controls = page.getByRole('button').filter({ visible: true });
  const first = controls.first();
  const label = await first.getAttribute('aria-label');
  const next = label?.includes('light') ? 'light' : 'dark';
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
  await expect(first).toBeFocused();
  for (const control of await controls.all()) {
    await expect(control).toHaveAttribute(
      'aria-label',
      `Switch to ${next === 'light' ? 'dark' : 'light'} theme`,
    );
  }
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    next === 'light' ? 'dark' : 'light',
  );
}

async function themePreferences(page: Page) {
  for (const preference of ['light', 'dark', 'system']) {
    const control = page.getByRole('button', {
      name: `Use ${preference} theme`,
    });
    await control.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toContainText(
      `preference: ${preference}`,
    );
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-preference',
      preference,
    );
  }
  const toggle = page.getByRole('button', { name: /Switch to/ });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('status')).not.toContainText(
    'preference: system',
  );
}

async function mobileNavigation(page: Page) {
  await page.setViewportSize({ width: 375, height: 812 });
  const trigger = page.getByRole('button', {
    name: /Toggle navigation menu|Open workspace navigation/,
  });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole('button', { name: /Close .*navigation/ });
  await expect(close).toBeFocused();
  for (let step = 0; step < 7; step++) {
    await page.keyboard.press(forwardTab(page));
    await expect(dialog.locator(':focus')).toHaveCount(1);
  }
  const search = dialog.getByRole('searchbox');
  if (await search.count()) {
    await search.focus();
    await search.pressSequentially('billing');
    await page.keyboard.press('Enter');
    await expect(search).toHaveValue('billing');
    await expect(dialog).toBeVisible();
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  const settings = dialog.getByRole('link', { name: 'Settings', exact: true });
  const destination = (await settings.count())
    ? settings
    : dialog.getByRole('link', { name: 'Guide', exact: true });
  await destination.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toHaveCount(0);
  const route = page.getByRole('status');
  if (await route.count()) {
    await expect(trigger).toBeFocused();
    await expect(route).toHaveText('Current route: /settings');
    await page.keyboard.press('Enter');
    await expect(
      dialog.getByRole('link', { name: 'Settings', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  } else await expect(page).toHaveURL(/#mobile-guide$/);
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
}

async function workspaceSettings(page: Page) {
  const name = page.getByRole('textbox', { name: 'Workspace name' });
  await name.fill('Design operations');
  await page.getByRole('combobox').selectOption('ms');
  const save = page.getByRole('button', { name: 'Save changes' });
  await save.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Settings saved');
  const disclosure = page.getByRole('button', {
    name: /^Advanced notification/,
  });
  await disclosure.focus();
  await page.keyboard.press('Enter');
  const checkbox = page.getByRole('checkbox', {
    name: 'Include detailed audit events',
  });
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(name).toHaveValue('Sapphire Studio');
}

async function editorialReading(page: Page) {
  const like = page.getByRole('button', { name: 'Like this article' });
  await like.focus();
  await page.keyboard.press('Space');
  await expect(like).toHaveAttribute('aria-pressed', 'true');
  const link = page.getByRole('link', { name: 'Make actions clear' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#reading-actions$/);
}

export const keyboardCases: Readonly<
  Record<string, (page: Page) => Promise<void>>
> = {
  'layout/settings': workspaceSettings,
  'layout/reading': editorialReading,
  'site-header/dark': headerLinks,
  'site-header/light': headerLinks,
  'site-footer/dark': footerLinks,
  'site-footer/light': footerLinks,
  'theme-toggle/standalone': themeToggle,
  'theme-provider/preferences': themePreferences,
  'mobile-nav/links': mobileNavigation,
  'mobile-nav/router': mobileNavigation,
};
