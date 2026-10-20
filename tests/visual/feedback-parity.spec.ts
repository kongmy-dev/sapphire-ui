import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { captureState } from './capture-state';
import { expect, test } from './fixtures';

const GROUPS = ['alert', 'toast', 'empty'] as const;
type Group = (typeof GROUPS)[number];
const SPECIMENS: Record<Group, string> = {
  alert: 'components/alert/alert.examples.html',
  toast: 'components/toast/toast.examples.html',
  empty: 'components/empty/empty.examples.html',
};
const TOAST_LIFETIME_MS = 60000;
const PROPERTIES = [
  'width',
  'height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-left-color',
] as const;
const STATUSES = ['info', 'success', 'warning', 'error', 'brand'] as const;
type Status = (typeof STATUSES)[number];
type Item = {
  name: string;
  group: Group;
  status: Status | null;
  v3: (page: Page) => Locator | Promise<Locator>;
  v4: (page: Page) => Locator;
};
type Observation = {
  style: Record<string, string>;
  shadow: string;
  accent: string;
  box: string;
  pixels: Buffer;
};
const ACCENT_TOKENS: Record<Status, string> = {
  info: '--info-text',
  success: '--success-text',
  warning: '--warning-text',
  error: '--error-text',
  brand: '--brand-text',
};
const TOASTS = [
  { status: 'success', message: 'Changes saved successfully.' },
  { status: 'info', message: 'Syncing data in the background.' },
  { status: 'warning', message: 'API usage is approaching the limit.' },
  { status: 'error', message: 'Failed to connect to the server.' },
] as const;
const HIDDEN_GLYPHS = [
  '.material-symbols-outlined',
  '.sp-alert-icon',
  '.sp-toast-icon',
  '.sp-empty-icon',
  '.docs-glyph',
]
  .map((selector) => `#parity ${selector}`)
  .join(', ');
const section = (page: Page, title: string) =>
  page.locator('section.docs-section').filter({
    has: page.locator('h2.docs-section-title', {
      hasText: new RegExp(`^${title}$`),
    }),
  });
const settled = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !==
            Number.POSITIVE_INFINITY,
        )
        .map((animation) => animation.finished),
    ),
  );
async function fireV3Toast(page: Page, type: string, message: string) {
  await page.evaluate(
    (toast) => {
      const show = Reflect.get(window, '__sapphireToast');
      if (typeof show !== 'function') throw new Error('no toast bridge');
      Reflect.apply(show, window, [toast.message, toast.type, toast.lifetime]);
    },
    { type, message, lifetime: TOAST_LIFETIME_MS },
  );
  const toast = page.locator('.sapphire-toast-container .sapphire-toast', {
    hasText: message,
  });
  await expect(toast).toHaveClass(/is-visible/);
  await settled(page);
  return toast;
}
const ITEMS: readonly Item[] = [
  ...STATUSES.map(
    (status, index): Item => ({
      name: `alert/${status}`,
      group: 'alert',
      status,
      v3: (page) => section(page, 'Alert').locator('[role="alert"]').nth(index),
      v4: (page) => page.locator('.sp-alert').nth(index),
    }),
  ),
  ...TOASTS.map(
    ({ status, message }): Item => ({
      name: `toast/${status}`,
      group: 'toast',
      status,
      v3: (page) => fireV3Toast(page, status, message),
      v4: (page) => page.locator('.sp-toast', { hasText: message }),
    }),
  ),
  {
    name: 'empty/default',
    group: 'empty',
    status: null,
    v3: (page) => section(page, 'Empty State').locator('.docs-preview > div'),
    v4: (page) => page.locator('.sp-empty'),
  },
];
const schemeOf = (testInfo: TestInfo) => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};
async function open(page: Page, path: string, scheme: string) {
  await page.goto(path);
  await page.locator('section.docs-section').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}
const readAccents = (page: Page): Promise<Record<string, string>> =>
  page.evaluate((tokens) => {
    const colourOf = (token: string) => {
      const probe = document.createElement('i');
      probe.style.color = `var(${token})`;
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    };
    return Object.fromEntries(
      Object.entries(tokens).map(([status, token]) => [
        status,
        colourOf(token),
      ]),
    );
  }, ACCENT_TOKENS);
async function mount(source: Locator, item: Item) {
  await source.evaluate(
    (element, spec) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      holder.className = 'docs-preview';
      holder.style.cssText = `position:fixed;top:0;left:0;width:480px;z-index:99999;border-radius:0;${spec.stacked}`;
      const copy = element.cloneNode(true);
      if (!(copy instanceof Element)) throw new Error('cannot clone');
      copy.setAttribute('data-status', spec.status);
      holder.append(copy);
      document.body.append(holder);
    },
    {
      status: item.status ?? '',
      stacked:
        item.group === 'toast'
          ? 'display:flex;flex-direction:column;align-items:flex-start'
          : '',
    },
  );
}
const readStyle = (panel: Locator) =>
  panel.evaluate(
    (element, names) => {
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
        return context.getImageData(0, 0, 1, 1).data.join(',');
      };
      const style = getComputedStyle(element);
      const title = element.querySelector('.sp-alert-title');
      const shadowColour = /(?:rgba?|color)\([^)]*\)/.exec(style.boxShadow);
      return {
        style: {
          ...Object.fromEntries(
            names.properties.map((name) => [
              name,
              style.getPropertyValue(name),
            ]),
          ),
          ...Object.fromEntries(
            names.colours.map((name) => [
              name,
              rgba(style.getPropertyValue(name)),
            ]),
          ),
          'shadow-colour': rgba(shadowColour?.[0] ?? 'transparent'),
        },
        shadow: style.boxShadow,
        accent:
          title === null
            ? style.borderLeftColor
            : getComputedStyle(title).color,
      };
    },
    { properties: [...PROPERTIES], colours: [...COLOURS] },
  );
async function observe(
  page: Page,
  source: Locator,
  item: Item,
): Promise<Observation> {
  await mount(source, item);
  const panel = page.locator('#parity > *');
  const read = await readStyle(panel);
  const box = await panel.boundingBox();
  await panel.evaluate((element) => {
    if (element instanceof HTMLElement)
      element.style.setProperty('box-shadow', 'none', 'important');
  });
  const pixels = await captureState(panel, {
    animations: 'disabled',
    caret: 'hide',
  });
  return { ...read, box: JSON.stringify(box), pixels };
}
function accentProblems(
  item: Item,
  v4: Observation,
  accents: Record<string, string>,
) {
  if (item.status === null || item.group === 'empty') return [];
  const expected = accents[item.status];
  if (v4.accent === expected) return [];
  return [
    `${item.name}: accent is ${v4.accent}, not the -text token ${expected}`,
  ];
}
async function observeV4(
  page: Page,
  items: readonly Item[],
  scheme: Scheme,
  group: Group,
) {
  await open(page, specimenUrl(SPECIMENS[group], scheme), scheme);
  await page.addStyleTag({
    content: `${HIDDEN_GLYPHS} { visibility: hidden !important }`,
  });
  const seen = new Map<string, Observation>();
  for (const item of items)
    seen.set(item.name, await observe(page, item.v4(page), item));
  return { seen, accents: await readAccents(page) };
}
const lookup = (seen: Map<string, Observation>, name: string): Observation => {
  const found = seen.get(name);
  if (found === undefined) throw new Error(name);
  return found;
};
for (const group of GROUPS) {
  test(`feedback-parity/${group}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    const items = ITEMS.filter((item) => item.group === group);
    const v4 = await observeV4(page, items, scheme, group);
    const problems: string[] = [];
    for (const item of items)
      problems.push(
        ...accentProblems(item, lookup(v4.seen, item.name), v4.accents),
      );
    expect(problems).toEqual([]);
  });
}
