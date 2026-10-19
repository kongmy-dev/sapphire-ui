import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';

export const GROUPS = [
  'popover',
  'tooltip',
  'hover-card',
  'dropdown-menu',
  'sheet',
  'command-palette',
] as const;
export type Group = (typeof GROUPS)[number];

export const schemeOf = (testInfo: TestInfo): Scheme => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};

export const SPECIMENS: Record<Group, string> = {
  popover: 'components/popover/popover.examples.html',
  tooltip: 'components/tooltip/tooltip.examples.html',
  'hover-card': 'components/hover-card/hover-card.examples.html',
  'dropdown-menu': 'components/dropdown-menu/dropdown-menu.examples.html',
  sheet: 'components/sheet/sheet.examples.html',
  'command-palette': 'components/command-palette/command-palette.examples.html',
};

export type Kind = 'floating' | 'fixed';
export type Case = {
  name: string;
  group: Group;
  kind: Kind;
  v4: string;
  open: (page: Page) => Promise<Locator>;
};

const FLOATING = '[data-radix-popper-content-wrapper] > [data-side]';
const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const QUERY = 'zzzz';

const docsSection = (page: Page, title: string) =>
  page.locator('section.docs-section').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  });

async function floating(page: Page): Promise<Locator> {
  const panel = page.locator(FLOATING);
  await panel.waitFor();
  return panel;
}

async function dialog(page: Page): Promise<Locator> {
  const panel = page.getByRole('dialog');
  await panel.waitFor();
  return panel;
}

const hoverOpen = (trigger: string) => async (page: Page) => {
  await docsSection(page, 'Tooltip')
    .getByRole('button', { name: trigger })
    .hover();
  return floating(page);
};

const menuOpen = (trigger: string, highlight: string) => async (page: Page) => {
  await docsSection(page, 'Dropdown Menu')
    .getByRole('button', { name: trigger })
    .click();
  const menu = page.getByRole('menu');
  await menu.waitFor();
  if (highlight !== '')
    await page.getByRole('menuitem', { name: highlight }).hover();
  return menu;
};

const sheetOpen = (side: string) => async (page: Page) => {
  await docsSection(page, 'Sheet (Side Drawer)')
    .getByRole('button', { name: side, exact: true })
    .click();
  return dialog(page);
};

async function paletteOpen(page: Page): Promise<Locator> {
  await page.keyboard.press('Control+k');
  const panel = await dialog(page);
  await panel.getByRole('listbox').waitFor();
  return panel;
}

async function paletteEmpty(page: Page): Promise<Locator> {
  const panel = await paletteOpen(page);
  await panel.getByRole('textbox', { name: 'Search commands' }).fill(QUERY);
  await panel.getByText(`No matches for "${QUERY}".`).waitFor();
  return panel;
}

async function hoverCardOpen(page: Page): Promise<Locator> {
  await docsSection(page, 'Hover Card')
    .getByRole('link', { name: '@kongmy' })
    .hover();
  const panel = await floating(page);
  await panel.getByText('KM', { exact: true }).waitFor();
  return panel;
}

async function popoverOpen(page: Page): Promise<Locator> {
  await docsSection(page, 'Popover')
    .getByRole('button', { name: 'Edit profile' })
    .click();
  return floating(page);
}

export const CASES: readonly Case[] = [
  {
    name: 'popover',
    group: 'popover',
    kind: 'floating',
    v4: '#popover-open',
    open: popoverOpen,
  },
  {
    name: 'tooltip/top',
    group: 'tooltip',
    kind: 'floating',
    v4: '#tooltip-top',
    open: hoverOpen('Hover me'),
  },
  {
    name: 'tooltip/bottom',
    group: 'tooltip',
    kind: 'floating',
    v4: '#tooltip-bottom',
    open: hoverOpen('Settings'),
  },
  {
    name: 'tooltip/right',
    group: 'tooltip',
    kind: 'floating',
    v4: '#tooltip-right',
    open: hoverOpen('Help'),
  },
  {
    name: 'hover-card',
    group: 'hover-card',
    kind: 'floating',
    v4: '.sp-hover-card',
    open: hoverCardOpen,
  },
  {
    name: 'dropdown-menu/actions',
    group: 'dropdown-menu',
    kind: 'floating',
    v4: '#actions-menu',
    open: menuOpen('Actions', 'Duplicate'),
  },
  {
    name: 'dropdown-menu/view',
    group: 'dropdown-menu',
    kind: 'floating',
    v4: '#view-menu',
    open: menuOpen('View options', ''),
  },
  ...SIDES.map(
    (side): Case => ({
      name: `sheet/${side}`,
      group: 'sheet',
      kind: 'fixed',
      v4: `.sp-sheet[data-side="${side}"]`,
      open: sheetOpen(side),
    }),
  ),
  {
    name: 'command-palette/list',
    group: 'command-palette',
    kind: 'fixed',
    v4: '#palette',
    open: paletteOpen,
  },
  {
    name: 'command-palette/empty',
    group: 'command-palette',
    kind: 'fixed',
    v4: '#palette-empty',
    open: paletteEmpty,
  },
];
