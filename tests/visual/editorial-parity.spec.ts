import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { captureState } from './capture-state';
import {
  BODY_ONLY_CALLOUT_PROBES,
  CALLOUT_LIST,
  CALLOUT_PROBES,
  CALLOUT_TEXT,
  CARD_TIMELINE_PROBES,
  COMPACT_STEPS_PROBES,
  EXTENDED_SPECIMEN,
  GLYPHS,
  HOLDER,
  INJECTED_CALLOUT_PROBES,
  INJECTED_MARGIN_NOTE_PROBES,
  type Interaction,
  MARGIN_NOTE_PROBES,
  type Probe,
  STEPS_SPECIMEN,
  TIMELINE_PROBES,
  TOC_PROBES,
  v3Callout,
  v3CompactSteps,
  v3MarginNote,
  v3Timeline,
  v4Callout,
  v4CompactSteps,
  v4MarginNote,
  v4Timeline,
  WIZARD_PROBES,
} from './editorial-pairs';
import { expect, test } from './fixtures';

const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const PROPERTIES = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-bottom-style',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
  'text-align',
  'text-decoration-line',
  'list-style-type',
  'white-space',
  'cursor',
  'opacity',
  'overflow-x',
  'overflow-y',
  '-webkit-line-clamp',
  '-webkit-box-orient',
  'flex-direction',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'align-items',
  'justify-content',
  'gap',
  'translate',
  'z-index',
  'outline-width',
  'outline-style',
  'outline-offset',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
] as const;
type Case = {
  name: string;
  interaction: Interaction;
  target: string;
  probes: readonly Probe[];
  v3: (page: Page) => Promise<Locator>;
  v4: (page: Page) => Promise<Locator>;
};
type Group = {
  name: string;
  v3Path: string;
  v4File: string;
  width: number;
  cases: readonly Case[];
};
type Observation = {
  styles: Record<string, Record<string, string>>;
  reached: boolean;
  pixels: Buffer;
};
const heading = (title: string) =>
  new RegExp(`^${title.replace(/[()]/g, '\\$&')}$`);
const clear = (page: Page) =>
  page.evaluate(() => document.getElementById('parity')?.remove());
const card =
  (title: string) =>
  async (page: Page): Promise<Locator> => {
    await clear(page);
    return mount(
      page,
      page.getByRole('heading', { name: heading(title) }).locator('..'),
      null,
    );
  };
async function mount(page: Page, source: Locator, width: number | null) {
  await source.evaluate((element, size) => {
    document.getElementById('parity')?.remove();
    const rect = element.getBoundingClientRect();
    const holder = document.createElement('div');
    holder.id = 'parity';
    holder.className = size === null ? '' : 'docs-preview';
    const frame = size === null ? 'background:#808080' : '';
    holder.style.cssText = `position:fixed;top:0;left:0;width:${size ?? rect.width}px;z-index:99999;border-radius:0;margin:0;${frame}`;
    const copy = element.cloneNode(true);
    if (!(copy instanceof HTMLElement)) throw new Error('cannot clone');
    if (size === null) {
      copy.style.width = `${rect.width}px`;
      copy.style.height = `${rect.height}px`;
    }
    holder.append(copy);
    document.body.append(holder);
    holder.style.height = `${Math.ceil(holder.getBoundingClientRect().height)}px`;
  }, width);
  return page.locator(HOLDER);
}
async function inject(page: Page, html: string, width: number) {
  await page.evaluate(
    (spec) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      holder.className = 'docs-preview';
      holder.style.cssText = `position:fixed;top:0;left:0;width:${spec.width}px;z-index:99999;border-radius:0;margin:0`;
      holder.innerHTML = spec.markup;
      document.body.append(holder);
      holder.style.height = `${Math.ceil(holder.getBoundingClientRect().height)}px`;
    },
    { markup: html, width },
  );
  return page.locator(HOLDER);
}
const markup =
  (html: string, width = 704) =>
  (page: Page) =>
    inject(page, html, width);
const settle = (page: Page) =>
  page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !==
            Number.POSITIVE_INFINITY,
        )
        .map((animation) => animation.finished),
    );
  });
const WIZARD_WIDTH = 818;
const wizardNav = (page: Page) =>
  page.locator('nav[aria-label="Progress"]').first();
async function openWizard(page: Page) {
  await clear(page);
  await page.getByRole('button', { name: 'Launch Modal Wizard' }).click();
  await wizardNav(page).waitFor();
  await settle(page);
  return mount(page, wizardNav(page), WIZARD_WIDTH);
}
async function advanceWizard(page: Page) {
  await clear(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await settle(page);
  return mount(page, wizardNav(page), WIZARD_WIDTH);
}
const stepsSection =
  (title: string) =>
  async (page: Page): Promise<Locator> => {
    await clear(page);
    const section = page.locator('section.docs-section').filter({
      has: page.locator('h2.docs-section-title', {
        hasText: heading(title),
      }),
    });
    return mount(page, section.locator('nav.sp-steps'), WIZARD_WIDTH);
  };
const CALLOUT_CARD = 'Editorial Callout';
const MARGIN_CARD = 'Margin Note (Sidenote)';
const TIMELINE_CARD = 'Revision Timeline';
const TOC_CARD = 'Table of Contents';
const rest = (name: string, title: string, probes: readonly Probe[]): Case => ({
  name,
  interaction: 'rest',
  target: '',
  probes,
  v3: card(title),
  v4: card(title),
});
const interacting = (
  name: string,
  title: string,
  probes: readonly Probe[],
  interaction: Interaction,
  target: string,
): Case => ({ ...rest(name, title, probes), interaction, target });
const CARDS: Group = {
  name: 'cards',
  v3Path: '/extended',
  v4File: EXTENDED_SPECIMEN,
  width: 1280,
  cases: [
    rest('callout card', CALLOUT_CARD, CALLOUT_PROBES),
    rest('margin note card', MARGIN_CARD, MARGIN_NOTE_PROBES),
    rest('timeline card', TIMELINE_CARD, CARD_TIMELINE_PROBES),
    rest('toc card', TOC_CARD, TOC_PROBES),
    interacting(
      'margin note anchor, hovered',
      MARGIN_CARD,
      MARGIN_NOTE_PROBES,
      'hover',
      'anchor',
    ),
    interacting(
      'toc link, hovered',
      TOC_CARD,
      TOC_PROBES,
      'hover',
      'first link',
    ),
    interacting(
      'toc active link, hovered',
      TOC_CARD,
      TOC_PROBES,
      'hover',
      'active link',
    ),
    interacting(
      'toc link, focused',
      TOC_CARD,
      TOC_PROBES,
      'focus',
      'first link',
    ),
    interacting(
      'toc active link, focused',
      TOC_CARD,
      TOC_PROBES,
      'focus',
      'active link',
    ),
  ],
};
const WIZARD: Group = {
  name: 'wizard',
  v3Path: '/layouts',
  v4File: STEPS_SPECIMEN,
  width: 1280,
  cases: [
    {
      name: 'wizard at the first step',
      interaction: 'rest',
      target: '',
      probes: WIZARD_PROBES,
      v3: openWizard,
      v4: stepsSection('Steps (first step)'),
    },
    {
      name: 'wizard after one Next',
      interaction: 'rest',
      target: '',
      probes: WIZARD_PROBES,
      v3: advanceWizard,
      v4: stepsSection('Steps (second step)'),
    },
  ],
};
const CALLOUT_TITLE = 'Key Takeaway';
const injected = (
  name: string,
  probes: readonly Probe[],
  html: {
    v3: string;
    v4: string;
  },
  width = 704,
): Case => ({
  name,
  interaction: 'rest',
  target: '',
  probes,
  v3: markup(html.v3, width),
  v4: markup(html.v4, width),
});
const INJECTED: Group = {
  name: 'injected',
  v3Path: '/extended',
  v4File: EXTENDED_SPECIMEN,
  width: 1280,
  cases: [
    injected('default callout', INJECTED_CALLOUT_PROBES, {
      v3: v3Callout('default', {
        icon: true,
        title: CALLOUT_TITLE,
        body: CALLOUT_LIST,
      }),
      v4: v4Callout('default', {
        icon: true,
        title: CALLOUT_TITLE,
        body: CALLOUT_LIST,
      }),
    }),
    injected(
      'subtle callout without icon and title',
      BODY_ONLY_CALLOUT_PROBES,
      {
        v3: v3Callout('subtle', { icon: false, title: '', body: CALLOUT_TEXT }),
        v4: v4Callout('subtle', { icon: false, title: '', body: CALLOUT_TEXT }),
      },
    ),
    injected('vertical timeline', TIMELINE_PROBES, {
      v3: v3Timeline('vertical'),
      v4: v4Timeline('vertical'),
    }),
    injected('horizontal timeline', TIMELINE_PROBES, {
      v3: v3Timeline('horizontal'),
      v4: v4Timeline('horizontal'),
    }),
    injected('compact steps', COMPACT_STEPS_PROBES, {
      v3: v3CompactSteps(),
      v4: v4CompactSteps(),
    }),
    injected('margin note beside the text', INJECTED_MARGIN_NOTE_PROBES, {
      v3: v3MarginNote(),
      v4: v4MarginNote(),
    }),
  ],
};
const NARROW: Group = {
  name: 'narrow',
  v3Path: '/extended',
  v4File: EXTENDED_SPECIMEN,
  width: 800,
  cases: [
    injected('margin note below the text', INJECTED_MARGIN_NOTE_PROBES, {
      v3: v3MarginNote(),
      v4: v4MarginNote(),
    }),
    {
      ...injected('margin note anchor, hovered', INJECTED_MARGIN_NOTE_PROBES, {
        v3: v3MarginNote(),
        v4: v4MarginNote(),
      }),
      interaction: 'hover',
      target: 'anchor',
    },
  ],
};
const GROUPS = [CARDS, WIZARD, INJECTED, NARROW] as const;
const schemeOf = (testInfo: TestInfo) => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};
async function open(
  page: Page,
  path: string,
  scheme: string,
  width: number,
  decided = '',
) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await page.locator('section.docs-section').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
  await page.addStyleTag({
    content: `${GLYPHS} { visibility: hidden !important }\n${decided}`,
  });
}
const selectorOf = (probe: Probe) => probe.v4;
const resolved = (probes: readonly Probe[]) =>
  probes.map((probe) => ({
    name: probe.name,
    selector: selectorOf(probe),
    pseudo: probe.pseudo ?? '',
    noBox: probe.pseudo !== undefined,
    rectOnly: probe.rectOnly ?? false,
    skip: [...(probe.skip ?? [])],
  }));
const readProbes = (root: Locator, probes: ReturnType<typeof resolved>) =>
  root.evaluate(
    (rootElement, spec) => {
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
      const drawn = (style: CSSStyleDeclaration, name: string) => {
        if (name === 'outline-color')
          return Number.parseFloat(style.outlineWidth) > 0;
        const side = /^border-(top|right|bottom|left)-(?:color|style)$/.exec(
          name,
        )?.[1];
        if (side === undefined) return true;
        return (
          Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0
        );
      };
      const radius = (
        element: Element,
        style: CSSStyleDeclaration,
        name: string,
      ) => {
        if (!name.endsWith('-radius')) return style.getPropertyValue(name);
        const rect = element.getBoundingClientRect();
        const reach = Math.min(rect.width, rect.height) / 2;
        const value = Number.parseFloat(style.getPropertyValue(name));
        return `${Math.min(value, reach).toFixed(2)}px`;
      };
      const rootRect = rootElement.getBoundingClientRect();
      const boxOf = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return [
          rect.left - rootRect.left,
          rect.top - rootRect.top,
          rect.width,
          rect.height,
        ]
          .map((value) => value.toFixed(3))
          .join(' ');
      };
      const entriesOf = (
        element: Element,
        style: CSSStyleDeclaration,
        skip: readonly string[],
      ) =>
        [
          ...spec.properties.map((name): [string, string] => [
            name,
            drawn(style, name) ? radius(element, style, name) : 'none',
          ]),
          ...spec.colours.map((name): [string, string] => [
            name,
            drawn(style, name) ? rgba(style.getPropertyValue(name)) : 'none',
          ]),
        ].filter(([name]) => !skip.includes(name));
      const shadowOf = (style: CSSStyleDeclaration) =>
        style.boxShadow
          .replace(new RegExp(spec.source, 'g'), rgba)
          .split(', ')
          .filter((part) => !/^\d+\|\d+\|\d+\|0 /.test(part))
          .join(', ');
      const describe = (
        probe: (typeof spec.probes)[number],
      ): [string, Record<string, string>] => {
        const element = rootElement.querySelector(probe.selector);
        if (element === null) throw new Error(`no ${probe.selector}`);
        const hidden = getComputedStyle(element).display === 'none';
        const box = probe.noBox || hidden ? 'none' : boxOf(element);
        if (probe.rectOnly) return [probe.name, { box }];
        const style = getComputedStyle(element, probe.pseudo || null);
        return [
          probe.name,
          {
            ...Object.fromEntries(entriesOf(element, style, probe.skip)),
            'box-shadow': shadowOf(style),
            box,
          },
        ];
      };
      return Object.fromEntries(spec.probes.map(describe));
    },
    {
      probes,
      properties: [...PROPERTIES],
      colours: [...COLOURS],
      source: COLOUR.source,
    },
  );
async function hoverText(page: Page, target: Locator) {
  const point = await target.evaluate((element) => {
    const rect = element.getClientRects()[0];
    if (rect === undefined) throw new Error('the target has no box');
    return { x: rect.left + 8, y: rect.top + rect.height / 2 };
  });
  await page.mouse.move(point.x, point.y);
}
const STATE: Record<Interaction, string> = {
  rest: '*',
  hover: ':hover',
  focus: ':focus-visible',
};
const reached = async (target: Locator | null, interaction: Interaction) =>
  target === null ||
  (await target.evaluate(
    (element, state) => element.matches(state),
    STATE[interaction],
  ));
async function observe(
  page: Page,
  root: Locator,
  item: Case,
): Promise<Observation> {
  await page.mouse.move(0, 0);
  await root.scrollIntoViewIfNeeded();
  const probe = item.probes.find((entry) => entry.name === item.target);
  const target =
    probe === undefined ? null : root.locator(selectorOf(probe)).first();
  if (target !== null && item.interaction === 'hover')
    await hoverText(page, target);
  if (target !== null && item.interaction === 'focus') await target.focus();
  await settle(page);
  return {
    styles: await readProbes(root, resolved(item.probes)),
    reached: await reached(target, item.interaction),
    pixels: await captureState(root, { animations: 'disabled', caret: 'hide' }),
  };
}
async function observeAll(
  page: Page,
  group: Group,
): Promise<Map<string, Observation>> {
  const seen = new Map<string, Observation>();
  for (const item of group.cases) {
    const root = await item.v4(page);
    seen.set(item.name, await observe(page, root, item));
  }
  return seen;
}
const lookup = (seen: Map<string, Observation>, name: string): Observation => {
  const found = seen.get(name);
  if (found === undefined) throw new Error(name);
  return found;
};
for (const group of GROUPS) {
  test(`editorial parity: ${group.name}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    await open(page, specimenUrl(group.v4File, scheme), scheme, group.width);
    const v4 = await observeAll(page, group);
    for (const item of group.cases)
      expect(
        lookup(v4, item.name).reached,
        `${item.name}: never reached ${item.interaction}`,
      ).toBe(true);
  });
}
