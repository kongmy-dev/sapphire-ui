import { expect, type Page } from '@playwright/test';
import { keyboardCases as appCases } from './keyboard-apps';
import {
  avatarLifecycle,
  badgeLink,
  dismissChip,
  pagination,
  separatorLinks,
} from './keyboard-data';
import { keyboardCases as editorialCases } from './keyboard-editorial';
import { keyboardCases as extendedCases } from './keyboard-extended';
import {
  controlledField,
  controlledPlan,
  editFields,
  selectPlans,
  validateEmail,
} from './keyboard-forms';
import { keyboardCases as layoutCases } from './keyboard-layouts';
import { banner, cookiePreferences } from './keyboard-notices';
import { hoverCard, popover, tooltip } from './keyboard-overlays';
import {
  checkboxes,
  notifications,
  radios,
  selectOptions,
  sliders,
  switches,
} from './keyboard-stateful';
import { keyboardCases as viewCases } from './keyboard-views';

const forwardTab = (page: Page) =>
  page.context().browser()?.browserType().name() === 'webkit'
    ? 'Alt+Tab'
    : 'Tab';

async function buttons(page: Page) {
  const controls = page.locator('#example button:not(:disabled)');
  for (const control of await controls.all()) {
    await control.focus();
    await expect(control).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(control).toBeFocused();
    await page.keyboard.press('Space');
  }
}

async function destinationLink(page: Page) {
  const link = page.getByRole('link', { name: 'Visit destination' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#destination$/);
  await link.focus();
  await page.keyboard.press(forwardTab(page));
  await expect(page.getByRole('button', { name: 'Full width' })).toBeFocused();
}

async function cardLink(page: Page) {
  const link = page.getByRole('link', { name: 'View project' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#project$/);
}

async function createProject(page: Page) {
  const link = page.getByRole('link', { name: 'Create project' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#create-project$/);
}

async function disabledButtons(page: Page) {
  const link = page.getByRole('link', { name: 'Disabled link' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).not.toHaveURL(/#disabled$/);
  await page.keyboard.press('Space');
  await expect(page).not.toHaveURL(/#disabled$/);
}

async function dynamicButton(page: Page) {
  const link = page.getByRole('link', { name: 'Disable this link with D' });
  await link.focus();
  await page.keyboard.press('d');
  await expect(link).toHaveAttribute('aria-disabled', 'true');
  await expect(link).toBeFocused();
  await page.keyboard.press(forwardTab(page));
  await expect(
    page.getByRole('button', { name: 'Toggle link disabled' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(link).not.toHaveAttribute('aria-disabled', 'true');
}

async function dialog(page: Page) {
  const trigger = page.locator('#example').getByRole('button').first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const overlay = page.getByRole('dialog');
  await expect(overlay).toBeVisible();
  for (let step = 0; step < 6; step++) {
    await page.keyboard.press('Tab');
    await expect(overlay.locator(':focus')).toHaveCount(1);
  }
  await page.keyboard.press('Shift+Tab');
  await expect(overlay.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(overlay).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(overlay).toBeVisible();
}

export const keyboardCases: Readonly<
  Record<string, (page: Page) => Promise<void>>
> = {
  ...appCases,
  ...layoutCases,
  ...editorialCases,
  'banner/dismissible': banner,
  'cookie-banner/preferences': cookiePreferences,
  ...extendedCases,
  ...viewCases,
  'checkbox/states': checkboxes,
  'checkbox/controlled': checkboxes,
  'switch/states': switches,
  'switch/controlled': switches,
  'radio-group/states': radios,
  'radio-group/controlled': radios,
  'range-slider/states': sliders,
  'range-slider/controlled': sliders,
  'select/states': selectOptions,
  'select/controlled': selectOptions,
  'toast/statuses': notifications,
  'toast/duration': notifications,
  'separator/vertical': separatorLinks,
  'badge/sizes': badgeLink,
  'chip/dismissible': dismissChip,
  'avatar/lifecycle': avatarLifecycle,
  'pagination/controlled': pagination,
  'pagination/boundaries': pagination,
  'popover/settings': popover,
  'popover/controlled': popover,
  'hover-card/profile': hoverCard,
  'hover-card/preview': hoverCard,
  'tooltip/shortcut': tooltip,
  'tooltip/shared-provider': tooltip,
  'sheet/settings': dialog,
  'sheet/bottom': dialog,
  'button/variants': buttons,
  'button/on-dark': buttons,
  'button/sizes': buttons,
  'button/icons': buttons,
  'button/links': destinationLink,
  'button/states': disabledButtons,
  'button/dynamic-disabled': dynamicButton,
  'card/parts': cardLink,
  'dialog/uncontrolled': dialog,
  'dialog/controlled': dialog,
  'dialog/without-close': dialog,
  'dialog/confirmation': dialog,
  'dialog/destructive': dialog,
  'empty/action': createProject,
  'input/variants': editFields,
  'input/sizes': editFields,
  'input/states': editFields,
  'input/controlled': controlledField,
  'textarea/variants': editFields,
  'textarea/sizes': editFields,
  'textarea/states': editFields,
  'textarea/controlled': controlledField,
  'native-select/variants': selectPlans,
  'native-select/sizes': selectPlans,
  'native-select/states': selectPlans,
  'native-select/controlled': controlledPlan,
  'label/sizes': editFields,
  'label/required': editFields,
  'form-field/composition': editFields,
  'form-field/states': editFields,
  'form-field/validation': validateEmail,
};
