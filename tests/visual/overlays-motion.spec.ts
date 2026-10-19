import type { Locator, Page, TestInfo } from '@playwright/test';
import { specimenUrl } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';
import { type Group, SPECIMENS, schemeOf } from './overlays-cases';

type Attributes = Record<string, string>;
type Panel = {
  name: string;
  group: Group;
  selector: string;
  keyframes: string;
  opening: Attributes[];
};
type Sided = {
  name: string;
  group: Group;
  selector: string;
  prefix: string;
  offsets: Record<string, string>;
};

const SHEET_SHIFTS: Record<string, number[]> = {
  right: [1, 0],
  left: [-1, 0],
  top: [0, -1],
  bottom: [0, 1],
};
const STATE_ATTRIBUTES = ['data-state', 'data-open', 'data-closed'];
const OPENING: Attributes[] = [{ 'data-state': 'open' }, { 'data-open': '' }];
const CLOSING: Attributes[] = [
  { 'data-state': 'closed' },
  { 'data-closed': '' },
];

const PANELS: Panel[] = [
  {
    name: 'popover',
    group: 'popover',
    selector: '.sp-popover',
    keyframes: 'sp-popover',
    opening: OPENING,
  },
  {
    name: 'hover-card',
    group: 'hover-card',
    selector: '.sp-hover-card',
    keyframes: 'sp-hover-card',
    opening: OPENING,
  },
  {
    name: 'tooltip',
    group: 'tooltip',
    selector: '.sp-tooltip',
    keyframes: 'sp-tooltip',
    opening: [
      { 'data-state': 'delayed-open' },
      { 'data-state': 'instant-open' },
      { 'data-open': '' },
    ],
  },
  {
    name: 'dropdown-menu',
    group: 'dropdown-menu',
    selector: '.sp-dropdown-menu',
    keyframes: 'sp-dropdown-menu',
    opening: OPENING,
  },
  {
    name: 'sheet',
    group: 'sheet',
    selector: '.sp-sheet',
    keyframes: 'sp-sheet',
    opening: OPENING,
  },
  {
    name: 'sheet-overlay',
    group: 'sheet',
    selector: '.sp-sheet-overlay',
    keyframes: 'sp-sheet-fade',
    opening: OPENING,
  },
];

const SIDED: Sided[] = [
  {
    name: 'popover',
    group: 'popover',
    selector: '.sp-popover',
    prefix: '--sp-popover-enter',
    offsets: { bottom: '0px -8px', top: '0px 8px', left: '8px', right: '-8px' },
  },
  {
    name: 'hover-card',
    group: 'hover-card',
    selector: '.sp-hover-card',
    prefix: '--sp-hover-card-enter',
    offsets: { bottom: '0px -8px', top: '0px 8px', left: '8px', right: '-8px' },
  },
  {
    name: 'tooltip',
    group: 'tooltip',
    selector: '.sp-tooltip',
    prefix: '--sp-tooltip-enter',
    offsets: { bottom: '0px -4px', top: '0px 4px', left: '4px', right: '-4px' },
  },
  {
    name: 'dropdown-menu',
    group: 'dropdown-menu',
    selector: '.sp-dropdown-menu',
    prefix: '--sp-dropdown-menu-enter',
    offsets: {
      bottom: '0px -8px',
      top: '0px 8px',
      left: '0px',
      right: '0px',
    },
  },
];

const first = (page: Page, selector: string) => page.locator(selector).first();

async function load(page: Page, group: Group, testInfo: TestInfo) {
  await page.goto(specimenUrl(SPECIMENS[group], schemeOf(testInfo)));
  await page.locator('section.docs-section').first().waitFor();
}

const apply = (panel: Locator, attributes: Attributes, names: string[]) =>
  panel.evaluate(
    (element, spec) => {
      for (const name of spec.names) element.removeAttribute(name);
      for (const [name, value] of Object.entries(spec.attributes))
        element.setAttribute(name, value);
    },
    { attributes, names },
  );

const animationOf = (panel: Locator) =>
  panel.evaluate((element) => getComputedStyle(element).animationName);

async function animations(panel: Locator, states: Attributes[]) {
  const seen: string[] = [];
  for (const state of states) {
    await apply(panel, state, STATE_ATTRIBUTES);
    seen.push(await animationOf(panel));
  }
  return seen;
}

for (const panel of PANELS) {
  test(`overlays-motion/${panel.name}`, async ({ page }, testInfo) => {
    await load(page, panel.group, testInfo);
    const target = first(page, panel.selector);
    expect(await animations(target, panel.opening)).toEqual(
      panel.opening.map(() => `${panel.keyframes}-in`),
    );
    expect(await animations(target, CLOSING)).toEqual(
      CLOSING.map(() => `${panel.keyframes}-out`),
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const states = [...panel.opening, ...CLOSING];
    expect(await animations(target, states)).toEqual(states.map(() => 'none'));
  });
}

const offsetOf = (panel: Locator, side: string, prefix: string) =>
  panel.evaluate(
    (element, spec) => {
      element.setAttribute('data-side', spec.side);
      element.style.translate = `var(${spec.prefix}-x, 0px) var(${spec.prefix}-y, 0px)`;
      const value = getComputedStyle(element).translate;
      element.style.translate = '';
      return value;
    },
    { side, prefix },
  );

for (const panel of SIDED) {
  test(`overlays-motion/${panel.name}-sides`, async ({ page }, testInfo) => {
    await load(page, panel.group, testInfo);
    const target = first(page, panel.selector);
    const seen: Record<string, string> = {};
    for (const side of Object.keys(panel.offsets))
      seen[side] = await offsetOf(target, side, panel.prefix);
    expect(seen).toEqual(panel.offsets);
  });
}

const shiftOf = (panel: Locator, side: string) =>
  panel.evaluate((element, name) => {
    element.setAttribute('data-side', name);
    element.style.transform = 'var(--sp-sheet-offscreen)';
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    element.style.transform = '';
    return [Math.sign(matrix.m41), Math.sign(matrix.m42)];
  }, side);

test('overlays-motion/sheet-sides', async ({ page }, testInfo) => {
  await load(page, 'sheet', testInfo);
  const target = first(page, '.sp-sheet');
  const seen: Record<string, number[]> = {};
  for (const side of Object.keys(SHEET_SHIFTS))
    seen[side] = await shiftOf(target, side);
  expect(seen).toEqual(SHEET_SHIFTS);
});
