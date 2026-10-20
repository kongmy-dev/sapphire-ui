import { expect, type Page } from '@playwright/test';

const fixture = `
<div class="sp-stack">
  <div>
    <button class="sp-button" data-density="filled">Continue</button>
    <button class="sp-button" data-variant="outline" data-density="outline">Continue</button>
    <button class="sp-button" data-size="sm" data-density="small">Continue</button>
    <button class="sp-button" data-size="lg" data-density="large">Continue</button>
    <button class="sp-button" data-size="icon" aria-label="Add" data-density="icon"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></button>
  </div>
  <button class="sp-button" style="--sp-button-line-height:1.4" data-density="unitless">Legacy line height</button>
  <input class="sp-input" aria-label="Name" data-density="input" />
  <input class="sp-input" data-variant="on-dark" aria-label="Dark name" data-density="dark-input" />
  <button class="sp-select-trigger" data-density="select">Choose a plan</button>
  <div class="sp-native-select-field"><select class="sp-native-select" aria-label="Native plan" data-density="native"><option>Basic</option></select><svg class="sp-native-select-icon"></svg></div>
  <div class="sp-native-select-field"><select class="sp-native-select" aria-label="Multiple plans" multiple data-density="multiple"><option>Basic</option><option>Pro</option></select><svg class="sp-native-select-icon" data-density="multiple-icon"></svg></div>
  <article class="sp-card" data-density="card">A readable card</article>
  <div class="sp-accordion"><h3 class="sp-accordion-header" data-density="accordion-header"><button class="sp-accordion-trigger" data-density="accordion">Details<svg class="sp-accordion-chevron" data-density="chevron"></svg></button></h3></div>
  <div class="sp-range-slider" data-orientation="vertical" data-density="vertical-slider"><div class="sp-range-slider-track" data-density="vertical-track"><div class="sp-range-slider-range" style="top:25%;bottom:25%" data-density="vertical-range"></div></div></div>
  <div class="sp-range-slider" data-density="horizontal-slider"><div class="sp-range-slider-track"></div></div>
  <button class="sp-checkbox" role="checkbox" aria-checked="true" aria-label="Enabled checkbox" data-state="checked" data-density="checkbox"><span class="sp-checkbox-indicator"></span></button>
  <button class="sp-radio-group-item" role="radio" aria-checked="true" aria-label="Enabled radio" data-state="checked" data-density="radio"><span class="sp-radio-group-indicator"><span class="sp-radio-group-dot"></span></span></button>
  <button class="sp-switch" role="switch" aria-checked="true" aria-label="Enabled switch" data-state="checked" data-density="switch"><span class="sp-switch-thumb"></span></button>
</div>`;

async function mountFixture(page: Page) {
  await page.locator('#example').evaluate((root, html) => {
    root.innerHTML = html;
  }, fixture);
  await page.evaluate(() => document.fonts.ready);
}

async function dimensions(page: Page, name: string) {
  return page.locator(`[data-density="${name}"]`).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
}

export async function assertControlDensity(page: Page) {
  await mountFixture(page);
  for (const name of [
    'filled',
    'unitless',
    'outline',
    'icon',
    'input',
    'dark-input',
    'select',
    'native',
  ])
    expect(
      (await dimensions(page, name)).height,
      `${name} default height`,
    ).toBeCloseTo(36, 1);
  expect((await dimensions(page, 'small')).height).toBeCloseTo(32, 1);
  expect((await dimensions(page, 'large')).height).toBeCloseTo(40, 1);
  await expect(page.locator('[data-density="card"]')).toHaveCSS(
    'padding',
    '20px',
  );
  await expect(page.locator('[data-density="accordion"]')).toHaveCSS(
    'padding-top',
    '12px',
  );
  await expect(page.locator('[data-density="accordion-header"]')).toHaveCSS(
    'margin-bottom',
    '0px',
  );
  expect((await dimensions(page, 'chevron')).width).toBe(16);
  await expect(page.locator('[data-density="input"]')).toHaveCSS(
    'font-size',
    '16px',
  );
  await expect(page.locator('[data-density="filled"]')).toHaveCSS(
    'font-size',
    '14px',
  );
  await assertSliderAndMultipleSelect(page);
}

async function assertSliderAndMultipleSelect(page: Page) {
  await expect(page.locator('[data-density="multiple-icon"]')).toBeHidden();
  expect((await dimensions(page, 'multiple')).height).toBeGreaterThan(72);
  const track = await dimensions(page, 'vertical-track');
  const range = await dimensions(page, 'vertical-range');
  expect(track.width).toBe(4);
  expect(track.height).toBe(128);
  expect(range.width).toBe(4);
  expect(range.height).toBe(64);
}

export async function assertCoarseControlDensity(page: Page) {
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(true);
  await mountFixture(page);
  for (const name of [
    'filled',
    'outline',
    'icon',
    'small',
    'input',
    'select',
    'native',
    'checkbox',
    'radio',
    'switch',
  ]) {
    const rect = await dimensions(page, name);
    expect(rect.height, `${name} coarse height`).toBeGreaterThanOrEqual(44);
    expect(rect.width, `${name} coarse width`).toBeGreaterThanOrEqual(44);
  }
  expect(
    (await dimensions(page, 'horizontal-slider')).height,
  ).toBeGreaterThanOrEqual(44);
  expect(
    (await dimensions(page, 'vertical-slider')).width,
  ).toBeGreaterThanOrEqual(44);
  const checkbox = await page
    .locator('[data-density="checkbox"]')
    .boundingBox();
  const radio = await page.locator('[data-density="radio"]').boundingBox();
  expect(checkbox).not.toBeNull();
  expect(radio).not.toBeNull();
  if (checkbox && radio)
    expect(checkbox.y + checkbox.height).toBeLessThanOrEqual(radio.y);
  for (const name of ['checkbox', 'radio', 'switch']) {
    const mark = await page
      .locator(`[data-density="${name}"]`)
      .evaluate((element) => ({
        width: getComputedStyle(element, '::before').width,
        height: getComputedStyle(element, '::before').height,
      }));
    expect(Number.parseFloat(mark.width)).toBeLessThan(44);
    expect(Number.parseFloat(mark.height)).toBeLessThan(44);
  }
}
