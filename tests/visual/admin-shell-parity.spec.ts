import type { Locator, Page, TestInfo } from '@playwright/test';
import { SCHEMES, type Scheme } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import {
  COLLAPSED_LINKS,
  COLLAPSED_PARTS,
  INTERACTIONS,
  type Interaction,
  NARROW,
  PAGE_CASES,
  type PageCase,
  type Part,
  PROPOSAL_CASE,
  SHELL_PARTS,
  WIDE,
} from './admin-shell-pairs';
import { captureState } from './capture-state';
import { expect, test } from './fixtures';

const V4_PAGE = 'components/admin-layout/admin-layout.examples.html';
const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const GLYPHS =
  '.material-symbols-outlined, .sp-admin-layout-icon, .sp-theme-toggle-icon, .docs-admin-glyph, .sp-document-bar-separator';
const PROPERTIES = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
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
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
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
  'text-overflow',
  'white-space',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'align-items',
  'justify-content',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'overflow-x',
  'overflow-y',
  'opacity',
  'visibility',
  'clip-path',
  'cursor',
  'pointer-events',
] as const;
const COLOURS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
] as const;
type Style = {
  tag: string;
  values: Record<string, string>;
};
type Capture = {
  styles: Style[];
  pixels: Buffer | null;
};
type Side = 'v3' | 'v4';
type Mode = {
  collapsed: boolean;
  width: number;
  snap?: boolean;
};
const schemeOf = (testInfo: TestInfo): Scheme => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};
async function open(page: Page, path: string, scheme: Scheme) {
  await page.goto(path);
  await page.locator('section.docs-section').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}
const settled = async (page: Page) => {
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.waitForFunction(() => document.getAnimations().length === 0);
};
const shellOf = (page: Page): Locator =>
  page
    .locator('section.docs-section')
    .filter({
      has: page.locator('h2.docs-section-title', { hasText: /^Admin Layout$/ }),
    })
    .locator('.sp-admin-layout')
    .first();
async function shellMarkup(page: Page) {
  const shell = shellOf(page);
  await expect(shell.getByText('KM', { exact: true })).toHaveCount(2);
  return shell.evaluate((element) => element.outerHTML);
}
async function mount(page: Page, markup: string, mode: Mode, side: Side) {
  await page.evaluate(
    (spec) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      const background = getComputedStyle(document.body).backgroundColor;
      holder.style.cssText = `position:absolute;top:0;left:0;width:${spec.width}px;z-index:99999;background:${background}`;
      holder.innerHTML = spec.markup;
      if (spec.collapsed) {
        const aside = holder.querySelector('aside');
        aside?.setAttribute('data-collapsed', '');
        holder.querySelector('.docs-admin-user')?.remove();
      }
      document.body.append(holder);
      if (spec.snap)
        holder.style.height = `${Math.ceil(holder.getBoundingClientRect().height)}px`;
    },
    {
      markup,
      width: mode.width,
      collapsed: mode.collapsed,
      snap: mode.snap === true,
      side,
    },
  );
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await document.fonts.ready;
  });
}
const readStyles = (target: Locator, deep: boolean): Promise<Style[]> =>
  target.evaluate(
    (element, spec) => {
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
      const dropZeroBorders = (values: Record<string, string>) => {
        for (const side of ['top', 'right', 'bottom', 'left']) {
          if (values[`border-${side}-width`] !== '0px') continue;
          values[`border-${side}-style`] = 'none';
          values[`border-${side}-color`] = 'none';
        }
        return values;
      };
      const glyphProperties = [
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'white-space',
        'flex-shrink',
        'flex-basis',
        'overflow-x',
        'overflow-y',
      ];
      const origin = element.getBoundingClientRect();
      const read = (node: Element): Style => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        const shadow = style.boxShadow.replace(
          new RegExp(spec.colour, 'g'),
          '',
        );
        const values: Record<string, string> = {
          ...Object.fromEntries(
            spec.properties.map((name) => [name, style.getPropertyValue(name)]),
          ),
          ...Object.fromEntries(
            spec.colours.map((name) => [
              name,
              rgba(style.getPropertyValue(name)),
            ]),
          ),
          'rect-offset': `${(box.left - origin.left).toFixed(4)},${(box.top - origin.top).toFixed(4)}`,
          'rect-size': `${box.width.toFixed(4)},${box.height.toFixed(4)}`,
          'shadow-geometry': shadow
            .split(',')
            .map((part) => part.trim().replace(/\s+/g, ' '))
            .filter(
              (part) =>
                part !== '' && part !== 'none' && part !== spec.noShadow,
            )
            .join(', '),
        };
        if (values['text-align'] === 'start') values['text-align'] = 'left';
        if (node.matches(spec.glyphs))
          for (const name of glyphProperties) values[name] = 'glyph';
        return {
          tag: node.tagName.toLowerCase(),
          values: dropZeroBorders(values),
        };
      };
      const nodes = spec.deep
        ? [element, ...element.querySelectorAll('*')]
        : [element];
      return nodes
        .filter((node) => !node.parentElement?.closest(spec.glyphs))
        .map(read);
    },
    {
      properties: [...PROPERTIES],
      colours: [...COLOURS],
      colour: COLOUR.source,
      noShadow: '0px 0px 0px 0px',
      glyphs: GLYPHS,
      deep,
    },
  );
async function shoot(target: Locator, part: Part): Promise<Buffer | null> {
  if (part.pixels === false || !(await target.isVisible())) return null;
  return captureState(target, { animations: 'disabled', caret: 'hide' });
}
async function capture(target: Locator, part: Part): Promise<Capture> {
  return {
    styles:
      part.styles === false ? [] : await readStyles(target, part.deep === true),
    pixels: await shoot(target, part),
  };
}
async function observe(
  page: Page,
  side: Side,
  scheme: Scheme,
  mode: Mode,
): Promise<Locator> {
  await open(page, specimenUrl(V4_PAGE, scheme), scheme);
  await page.addStyleTag({
    content: `${GLYPHS} { visibility: hidden !important }`,
  });
  const markup = await shellMarkup(page);
  await mount(page, markup, mode, side);
  return page.locator('#parity');
}
const find = (holder: Locator, part: Part) => holder.locator(part.v4).first();
async function observeParts(
  page: Page,
  side: Side,
  scheme: Scheme,
  mode: Mode,
  parts: readonly Part[],
) {
  const holder = await observe(page, side, scheme, mode);
  const found = new Map<string, Capture>();
  for (const part of parts)
    found.set(part.name, await capture(find(holder, part), part));
  return found;
}
async function runParts(
  page: Page,
  testInfo: TestInfo,
  mode: Mode,
  parts: readonly Part[],
) {
  const scheme = schemeOf(testInfo);
  await page.setViewportSize({ width: mode.width, height: 900 });
  const v4 = await observeParts(page, 'v4', scheme, mode, parts);
  for (const part of parts) expect(v4.has(part.name), part.name).toBe(true);
}
test('admin-shell-parity/expanded', async ({ page }, testInfo) => {
  await runParts(
    page,
    testInfo,
    { collapsed: false, width: WIDE },
    SHELL_PARTS,
  );
});
test('admin-shell-parity/collapsed', async ({ page }, testInfo) => {
  await runParts(page, testInfo, { collapsed: true, width: WIDE }, [
    ...COLLAPSED_PARTS,
    ...COLLAPSED_LINKS,
  ]);
});
test('admin-shell-parity/narrow', async ({ page }, testInfo) => {
  await runParts(
    page,
    testInfo,
    { collapsed: false, width: NARROW },
    SHELL_PARTS,
  );
});
test('admin-shell-parity/narrow-collapsed', async ({ page }, testInfo) => {
  await runParts(page, testInfo, { collapsed: true, width: NARROW }, [
    ...COLLAPSED_PARTS,
    ...COLLAPSED_LINKS,
  ]);
});
const ASIDE: Part = {
  name: 'aside',
  v3: '.sf-admin-sidebar',
  v4: '.sp-admin-layout-sidebar',
};
const targetOf = (interaction: Interaction): Part => ({
  name: interaction.name,
  v3: interaction.v3,
  v4: interaction.v4,
  deep: true,
});
async function interact(
  page: Page,
  scheme: Scheme,
  side: Side,
  interaction: Interaction,
): Promise<Capture[]> {
  const holder = await observe(page, side, scheme, {
    collapsed: false,
    width: WIDE,
  });
  const target = targetOf(interaction);
  const element = find(holder, target);
  await page.mouse.move(0, 0);
  if (interaction.action === 'hover') await element.hover();
  else await element.focus();
  await settled(page);
  expect(
    await element.evaluate(
      (node, action) =>
        node.matches(action === 'hover' ? ':hover' : ':focus-visible'),
      interaction.action,
    ),
  ).toBe(true);
  return [
    await capture(element, target),
    await capture(find(holder, ASIDE), ASIDE),
  ];
}
async function runInteraction(
  page: Page,
  testInfo: TestInfo,
  interaction: Interaction,
) {
  const scheme = schemeOf(testInfo);
  await page.setViewportSize({ width: WIDE, height: 900 });
  const v4 = await interact(page, scheme, 'v4', interaction);
  expect(v4).toHaveLength(2);
}
for (const interaction of INTERACTIONS) {
  test(`admin-shell-parity/${interaction.name}`, async ({ page }, testInfo) => {
    await runInteraction(page, testInfo, interaction);
  });
}
async function pageSteps(page: Page, kase: PageCase): Promise<Capture[]> {
  const holder = page.locator('#parity');
  const root: Part = { name: kase.name, v3: '', v4: '', deep: true };
  const seen = [await capture(holder, root)];
  for (const target of [kase.hover, kase.focus]) {
    if (target === undefined) continue;
    const element = page.locator(`#parity ${target}`).first();
    await (target === kase.hover ? element.hover() : element.focus());
    await settled(page);
    seen.push(await capture(holder, root));
    await page.mouse.move(0, 0);
    await settled(page);
  }
  return seen;
}
const readBrandText = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const probe = document.createElement('i');
    probe.style.color = 'var(--brand-text)';
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  });
async function observePage(
  page: Page,
  scheme: Scheme,
  side: Side,
  kase: PageCase,
): Promise<{
  seen: Capture[];
  brandText: string;
}> {
  const path = specimenUrl(V4_PAGE, scheme);
  await open(page, path, scheme);
  const fresh = await readBrandText(page);
  const decided = '';
  const placeholder = '';
  await page.addStyleTag({
    content: `${GLYPHS} { visibility: hidden !important }\n${placeholder}\n${decided}`,
  });
  const mode: Mode = { collapsed: false, width: kase.width, snap: true };
  await mount(page, kase.v4, mode, side);
  return { seen: await pageSteps(page, kase), brandText: fresh };
}
async function runPageCase(page: Page, testInfo: TestInfo, kase: PageCase) {
  const scheme = schemeOf(testInfo);
  await page.setViewportSize({ width: kase.width, height: 900 });
  const v4 = await observePage(page, scheme, 'v4', kase);
  expect(v4.seen).toHaveLength(
    1 + Number(kase.hover !== undefined) + Number(kase.focus !== undefined),
  );
}
for (const kase of [...PAGE_CASES, PROPOSAL_CASE]) {
  test(`admin-shell-parity/${kase.name}`, async ({ page }, testInfo) => {
    await runPageCase(page, testInfo, kase);
  });
}
