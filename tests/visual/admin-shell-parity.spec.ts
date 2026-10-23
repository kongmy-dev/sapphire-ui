import type { Locator, Page, TestInfo } from '@playwright/test';
import { exampleUrl } from '../../tooling/examples/catalog.js';
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

const SPECIMEN = 'components/admin-layout/admin-layout.examples.html';
const GLYPHS =
  '.sp-admin-layout-icon, .sp-theme-toggle-icon, .docs-admin-glyph, .sp-document-bar-separator';
type Capture = Buffer | null;
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
async function mount(page: Page, markup: string, mode: Mode) {
  await page.evaluate(
    (spec) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      const background = getComputedStyle(document.body).backgroundColor;
      holder.style.cssText = `position:absolute;top:0;left:0;width:${spec.width}px;z-index:99999;background:${background}`;
      holder.innerHTML = spec.markup;
      document.body.append(holder);
      if (spec.snap)
        holder.style.height = `${Math.ceil(holder.getBoundingClientRect().height)}px`;
    },
    {
      markup,
      width: mode.width,
      snap: mode.snap === true,
    },
  );
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await document.fonts.ready;
  });
}
async function capture(target: Locator, pixels = true): Promise<Capture> {
  if (!pixels) return null;
  await expect(target).toBeVisible();
  return captureState(target, { animations: 'disabled', caret: 'hide' });
}
async function observe(page: Page, scheme: Scheme, mode: Mode) {
  await page.setViewportSize({ width: WIDE, height: 900 });
  await page.goto(
    exampleUrl(
      {
        component: 'admin-layout',
        name: 'workspace',
        file: 'components/admin-layout/admin-layout.examples.tsx',
      },
      scheme,
    ),
  );
  await expect(
    page.getByRole('heading', { name: 'Workspace overview' }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
  if (mode.collapsed)
    await page
      .getByRole('button', { name: 'Collapse sidebar', exact: true })
      .click();
  await assertDesktop(page, mode.collapsed);
  if (mode.width < 768) await openMobile(page, mode.width);
  return page.locator('body');
}
async function assertDesktop(page: Page, compact: boolean) {
  const sidebar = page.getByRole('complementary', {
    name: 'Workspace navigation',
  });
  const trigger = page.getByRole('button', {
    name: compact ? 'Expand sidebar' : 'Collapse sidebar',
    exact: true,
  });
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveCSS('width', compact ? '64px' : '256px');
  await expect(trigger).toHaveAttribute('aria-expanded', String(!compact));
  if (compact) await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  else await expect(sidebar).not.toHaveAttribute('data-collapsed');
  await expect(
    sidebar.getByRole('link', {
      name: compact ? 'Sapphire workspace' : 'S Sapphire Team workspace',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    sidebar.getByRole('button', {
      name: compact
        ? 'AR Aisha Rahman account'
        : 'AR Aisha Rahman Workspace admin account',
      exact: true,
    }),
  ).toBeVisible();
}
async function openMobile(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await expect(page.getByRole('complementary')).toHaveCount(0);
  const trigger = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await captureState(page.locator('.sp-admin-layout'), {
    animations: 'disabled',
    caret: 'hide',
  });
  await trigger.press('Enter');
  const drawer = page.getByRole('dialog', { name: 'Workspace navigation' });
  await expect(drawer).toHaveAttribute('aria-modal', 'true');
  await expect(drawer.getByRole('complementary')).not.toHaveAttribute(
    'data-collapsed',
  );
  await expect(
    drawer.getByRole('button', { name: 'Close navigation', exact: true }),
  ).toBeVisible();
  await settled(page);
}
async function roundTrip(page: Page, mode: Mode) {
  const drawer = page.getByRole('dialog', { name: 'Workspace navigation' });
  await captureState(drawer, { animations: 'disabled', caret: 'hide' });
  await page.setViewportSize({ width: WIDE, height: 900 });
  await expect(drawer).toHaveCount(0);
  await assertDesktop(page, mode.collapsed);
  await captureState(page.locator('.sp-admin-layout'), {
    animations: 'disabled',
    caret: 'hide',
  });
  await page.setViewportSize({ width: mode.width, height: 900 });
  await expect(page.getByRole('complementary')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Open navigation', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false');
  await expect(drawer).toHaveCount(0);
  await captureState(page.locator('.sp-admin-layout'), {
    animations: 'disabled',
    caret: 'hide',
  });
}
const find = (holder: Locator, part: Part) =>
  holder.locator(part.selector).first();
async function runParts(
  page: Page,
  testInfo: TestInfo,
  mode: Mode,
  parts: readonly Part[],
) {
  const holder = await observe(page, schemeOf(testInfo), mode);
  const found = new Map<string, Capture>();
  for (const part of parts) {
    const target = find(holder, part);
    await expect(target).toBeAttached();
    found.set(part.name, await capture(target, part.pixels));
  }
  for (const part of parts) expect(found.has(part.name), part.name).toBe(true);
  if (mode.width < 768) await roundTrip(page, mode);
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
  selector: '.sp-admin-layout-sidebar',
};
async function interact(
  page: Page,
  scheme: Scheme,
  interaction: Interaction,
): Promise<Capture[]> {
  const holder = await observe(page, scheme, {
    collapsed: false,
    width: WIDE,
  });
  const element = find(holder, interaction);
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
  return [await capture(element), await capture(find(holder, ASIDE))];
}
async function runInteraction(
  page: Page,
  testInfo: TestInfo,
  interaction: Interaction,
) {
  const scheme = schemeOf(testInfo);
  await page.setViewportSize({ width: WIDE, height: 900 });
  const seen = await interact(page, scheme, interaction);
  expect(seen).toHaveLength(2);
}
for (const interaction of INTERACTIONS) {
  test(`admin-shell-parity/${interaction.name}`, async ({ page }, testInfo) => {
    await runInteraction(page, testInfo, interaction);
  });
}
async function pageSteps(page: Page, kase: PageCase): Promise<Capture[]> {
  const holder = page.locator('#parity');
  const seen = [await capture(holder)];
  for (const target of [kase.hover, kase.focus]) {
    if (target === undefined) continue;
    const element = page.locator(`#parity ${target}`).first();
    await (target === kase.hover ? element.hover() : element.focus());
    await settled(page);
    seen.push(await capture(holder));
    await page.mouse.move(0, 0);
    await settled(page);
  }
  return seen;
}
async function observePage(
  page: Page,
  scheme: Scheme,
  kase: PageCase,
): Promise<Capture[]> {
  const path = specimenUrl(SPECIMEN, scheme);
  await open(page, path, scheme);
  await page.addStyleTag({
    content: `${GLYPHS} { visibility: hidden !important }`,
  });
  const mode: Mode = { collapsed: false, width: kase.width, snap: true };
  await mount(page, kase.markup, mode);
  return pageSteps(page, kase);
}
async function runPageCase(page: Page, testInfo: TestInfo, kase: PageCase) {
  const scheme = schemeOf(testInfo);
  await page.setViewportSize({ width: kase.width, height: 900 });
  const seen = await observePage(page, scheme, kase);
  expect(seen).toHaveLength(
    1 + Number(kase.hover !== undefined) + Number(kase.focus !== undefined),
  );
}
for (const kase of [...PAGE_CASES, PROPOSAL_CASE]) {
  test(`admin-shell-parity/${kase.name}`, async ({ page }, testInfo) => {
    await runPageCase(page, testInfo, kase);
  });
}
