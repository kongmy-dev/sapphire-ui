import { writeFile } from 'node:fs/promises';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { expect, test } from './fixtures';

const GROUPS = ['alert', 'toast', 'empty'] as const;
type Group = (typeof GROUPS)[number];
const SPECIMENS: Record<Group, string> = {
  alert: 'components/alert/alert.examples.html',
  toast: 'components/toast/toast.examples.html',
  empty: 'components/empty/empty.examples.html',
};
const COLOUR = /(?:rgba?|color)\([^)]*\)/g;
const NO_SHADOW = /^(?:0px ){3}0px$/;
const TOAST_LIFETIME_MS = 60_000;

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

function decidedChanges(accents: Record<string, string>): string {
  const alerts = STATUSES.map(
    (status) =>
      `#parity [data-status="${status}"] .mb-1 { color: ${accents[status]} !important }`,
  );
  const toasts = TOASTS.map(
    ({ status }) =>
      `#parity .sapphire-toast[data-type="${status}"] { --toast-accent: ${accents[status]} !important }`,
  );
  return [...alerts, ...toasts].join('\n');
}

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
  const pixels = await panel.screenshot({
    animations: 'disabled',
    caret: 'hide',
  });
  return { ...read, box: JSON.stringify(box), pixels };
}

const shadowGeometry = (shadow: string): string =>
  shadow
    .replace(COLOUR, '')
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter((part) => part !== '' && !NO_SHADOW.test(part))
    .join(', ');

const differingPixels = (page: Page, left: Buffer, right: Buffer) =>
  page.evaluate(
    async (images) => {
      const decode = async (base64: string) => {
        const response = await fetch(`data:image/png;base64,${base64}`);
        const bitmap = await createImageBitmap(await response.blob());
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext('2d');
        if (context === null) throw new Error('no 2d context');
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height);
      };
      const [first, second] = await Promise.all([
        decode(images.left),
        decode(images.right),
      ]);
      if (first.width !== second.width || first.height !== second.height)
        return -1;
      let count = 0;
      for (let index = 0; index < first.data.length; index += 4) {
        const differs = [0, 1, 2, 3].some(
          (offset) =>
            first.data[index + offset] !== second.data[index + offset],
        );
        if (differs) count += 1;
      }
      return count;
    },
    { left: left.toString('base64'), right: right.toString('base64') },
  );

function styleProblems(item: Item, v3: Observation, v4: Observation) {
  const lines = Object.keys(v3.style)
    .filter((key) => v3.style[key] !== v4.style[key])
    .map(
      (key) => `${item.name}: ${key} v3=${v3.style[key]} v4=${v4.style[key]}`,
    );
  if (v3.box !== v4.box)
    lines.push(`${item.name}: box v3=${v3.box} v4=${v4.box}`);
  if (shadowGeometry(v3.shadow) !== shadowGeometry(v4.shadow))
    lines.push(`${item.name}: shadow v3=${v3.shadow} v4=${v4.shadow}`);
  return lines;
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

async function attach(
  testInfo: TestInfo,
  name: string,
  images: Record<'expected' | 'actual', Buffer>,
) {
  for (const kind of ['expected', 'actual'] as const) {
    const path = testInfo.outputPath(
      `${name.replaceAll('/', '-')}-${kind}.png`,
    );
    await writeFile(path, images[kind]);
    await testInfo.attach(`${name}-${kind}.png`, {
      path,
      contentType: 'image/png',
    });
  }
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

async function observeV3(
  page: Page,
  items: readonly Item[],
  scheme: string,
  accents: Record<string, string>,
) {
  await open(page, '/feedback', scheme);
  await page.addStyleTag({
    content: `${HIDDEN_GLYPHS} { visibility: hidden !important }\n${decidedChanges(accents)}`,
  });
  const seen = new Map<string, Observation>();
  for (const item of items) {
    const source = await item.v3(page);
    seen.set(item.name, await observe(page, source, item));
    if (item.group === 'toast') await source.evaluate((el) => el.remove());
  }
  return seen;
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
    const v3 = await observeV3(page, items, scheme, v4.accents);
    const problems: string[] = [];
    for (const item of items) {
      const seen = {
        v3: lookup(v3, item.name),
        v4: lookup(v4.seen, item.name),
      };
      problems.push(
        ...styleProblems(item, seen.v3, seen.v4),
        ...accentProblems(item, seen.v4, v4.accents),
      );
      const differing = await differingPixels(
        page,
        seen.v3.pixels,
        seen.v4.pixels,
      );
      if (differing === 0) continue;
      problems.push(`${item.name}: ${differing} pixels differ`);
      await attach(testInfo, item.name, {
        expected: seen.v3.pixels,
        actual: seen.v4.pixels,
      });
    }
    expect(problems).toEqual([]);
  });
}
