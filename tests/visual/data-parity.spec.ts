import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';

const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;

type Interaction = 'rest' | 'hover' | 'focus';
type Case = {
  name: string;
  file: string;
  interaction: Interaction;
  v3: (page: Page) => Locator;
  v4: (page: Page) => Locator;
  prepare?: (page: Page) => Promise<void>;
};

const section = (page: Page, title: string) =>
  page.locator('section.docs-section', {
    has: page.getByRole('heading', { name: title, exact: true }),
  });

const pagination = (page: Page, title: string, label: string) =>
  section(page, title)
    .locator('nav')
    .first()
    .getByRole('button', { name: label, exact: true });

const dismiss = (page: Page) =>
  section(page, 'Chip').getByRole('button', { name: 'Remove' }).first();

const goToFirstPage = (page: Page) =>
  pagination(page, 'Pagination', 'Go to page 1').click();

const PAGINATION_FILE = 'components/pagination/pagination.examples.html';
const CHIP_FILE = 'components/chip/chip.examples.html';

const CASES: readonly Case[] = [
  {
    name: 'pagination page link, hovered',
    file: PAGINATION_FILE,
    interaction: 'hover',
    v3: (page) => pagination(page, 'Pagination', 'Go to page 4'),
    v4: (page) => pagination(page, 'Pagination', 'Go to page 4'),
  },
  {
    name: 'pagination current page, hovered',
    file: PAGINATION_FILE,
    interaction: 'hover',
    v3: (page) => pagination(page, 'Pagination', 'Go to page 3'),
    v4: (page) => pagination(page, 'Pagination', 'Go to page 3'),
  },
  {
    name: 'pagination page link, focused',
    file: PAGINATION_FILE,
    interaction: 'focus',
    v3: (page) => pagination(page, 'Pagination', 'Go to page 2'),
    v4: (page) => pagination(page, 'Pagination', 'Go to page 2'),
  },
  {
    name: 'pagination previous on the first page',
    file: PAGINATION_FILE,
    interaction: 'rest',
    prepare: goToFirstPage,
    v3: (page) => pagination(page, 'Pagination', 'Go to previous page'),
    v4: (page) =>
      pagination(page, 'Pagination (first page)', 'Go to previous page'),
  },
  {
    name: 'chip dismiss, hovered',
    file: CHIP_FILE,
    interaction: 'hover',
    v3: dismiss,
    v4: dismiss,
  },
  {
    name: 'chip dismiss, focused',
    file: CHIP_FILE,
    interaction: 'focus',
    v3: dismiss,
    v4: dismiss,
  },
];

const scheme = (testInfo: TestInfo) => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};

async function open(page: Page, url: string, ready: string) {
  await page.goto(url);
  await page.locator(ready).first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    ),
  );

async function interact(page: Page, target: Locator, interaction: Interaction) {
  await page.mouse.move(0, 0);
  if (interaction === 'hover') await target.hover();
  if (interaction === 'focus') await target.focus();
  await settle(page);
}

const observe = (target: Locator) =>
  target.evaluate((element, source) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context === null) throw new Error('no 2d context');
    const rgba = (value: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = '#000';
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return context.getImageData(0, 0, 1, 1).data.join('|');
    };
    const style = getComputedStyle(element);
    const shadows = style.boxShadow
      .replace(new RegExp(source, 'g'), rgba)
      .split(', ')
      .filter((part) => !/^\d+\|\d+\|\d+\|0 /.test(part));
    return {
      color: rgba(style.color),
      background: rgba(style.backgroundColor),
      border: rgba(style.borderTopColor),
      shadows,
      opacity: style.opacity,
      cursor: style.cursor,
      focusVisible: element.matches(':focus-visible'),
    };
  }, COLOUR.source);

for (const state of CASES) {
  test(`data parity: ${state.name}`, async ({ page }, testInfo) => {
    await open(page, '/data', 'section.docs-section');
    await state.prepare?.(page);
    await interact(page, state.v3(page), state.interaction);
    const v3 = await observe(state.v3(page));

    await open(
      page,
      specimenUrl(state.file, scheme(testInfo)),
      'section.docs-section',
    );
    await interact(page, state.v4(page), state.interaction);
    const v4 = await observe(state.v4(page));
    await captureState(state.v4(page), {
      animations: 'disabled',
      caret: 'hide',
    });

    expect(v4).toEqual(v3);
    if (state.interaction === 'focus') expect(v4.focusVisible).toBe(true);
  });
}

import { captureState } from './capture-state';
