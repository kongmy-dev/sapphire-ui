import type { Page, TestInfo } from '@playwright/test';
import { SCHEMES } from '../../tooling/source/token-values';
import { specimenUrl } from '../../tooling/visual/specimens';
import { captureState } from './capture-state';
import { expect, test } from './fixtures';

const SPECIMEN = 'components/input/input.examples.html';
const COLOUR = /(?:rgba?|color|oklab|oklch)\([^)]*\)/g;
const NO_SHADOW = /^(?:0px ){1,3}0px$/;
const TARGET = 'parity-target';
const PROPERTIES = [
  'display',
  'position',
  'width',
  'height',
  'min-height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-bottom',
  'margin-left',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'border-top-width',
  'border-top-left-radius',
  'cursor',
  'opacity',
  'resize',
  'appearance',
  'box-shadow',
] as const;
const COLOURS = ['color', 'background-color', 'border-top-color'] as const;
type Variant = 'default' | 'mono' | 'dark';
type Size = 'sm' | 'default' | 'lg';
type State = 'rest' | 'focus' | 'invalid' | 'invalid-focus' | 'disabled';
type Kind = 'input' | 'textarea';
type Red = 'border-top-color' | 'color' | null;
type Pair = {
  name: string;
  dark: boolean;
  v3: string;
  v4: string;
  focus: boolean;
  red: Red;
  antialiased: boolean;
};
type Observation = {
  style: Record<string, string>;
  placeholder: string;
  errorText: string;
  focusVisible: boolean;
  box: string;
  pixels: Buffer;
};
const VARIANTS: readonly Variant[] = ['default', 'mono', 'dark'];
const SIZES: readonly Size[] = ['sm', 'default', 'lg'];
const FIELD_STATES: readonly State[] = [
  'rest',
  'focus',
  'invalid',
  'invalid-focus',
  'disabled',
];
const SELECT_STATES: readonly State[] = ['rest', 'focus', 'disabled'];
const STATE_ATTRIBUTES: Record<State, string> = {
  rest: '',
  focus: '',
  invalid: 'aria-invalid="true"',
  'invalid-focus': 'aria-invalid="true"',
  disabled: 'disabled',
};
const V3_FIELD =
  'w-full outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:focus:shadow-error/12';
const V3_LIGHT =
  'rounded-btn border border-border text-foreground focus:border-accent focus:shadow-[0_0_0_3px] focus:shadow-accent/12';
const V3_DARK =
  'rounded-sm border border-border-dark bg-black/20 focus:border-accent';
const V3_VARIANT: Record<Variant, string> = {
  default: `font-sans bg-(--color-card-bg) ${V3_LIGHT}`,
  mono: `bg-background font-mono ${V3_LIGHT}`,
  dark: `font-sans text-primary-foreground ${V3_DARK}`,
};
const V3_SIZE: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm',
  default: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};
const V3_MIN_HEIGHT: Record<Size, string> = {
  sm: 'min-h-[80px]',
  default: 'min-h-[120px]',
  lg: 'min-h-[160px]',
};
const V3_SELECT =
  'w-full cursor-pointer appearance-none font-sans outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';
const V3_SELECT_VARIANT: Record<'default' | 'dark', string> = {
  default: `bg-card text-foreground ${V3_LIGHT}`,
  dark: `text-text-on-dark ${V3_DARK} [&>option]:bg-primary [&>option]:text-text-on-dark`,
};
const V3_ICON =
  'pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2';
const V3_ICON_COLOUR = {
  default: 'text-muted-foreground',
  dark: 'text-text-on-dark-muted',
} as const;
const V3_LABEL =
  'mb-1 block font-sans font-semibold text-(--color-text-strong)';
const V3_LABEL_SIZE: Record<Size, string> = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
};
const CHEVRON =
  '<path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
const REQUIRED_V3 =
  '<span class="ml-0.5 text-accent" aria-hidden="true">*</span>';
const REQUIRED_V4 =
  '<span class="sp-label-required" aria-hidden="true">*</span>';
const V4_VARIANT: Record<Variant, string> = {
  default: '',
  mono: ' data-variant="mono"',
  dark: ' data-variant="on-dark"',
};
const v4Size = (size: Size) =>
  size === 'default' ? '' : ` data-size="${size}"`;
const isFocused = (state: State) =>
  state === 'focus' || state === 'invalid-focus';
const isInvalid = (state: State) =>
  STATE_ATTRIBUTES[state] === 'aria-invalid="true"';
function v3SizeClasses(variant: Variant, size: Size): string {
  const tightDark = variant === 'dark' && size === 'default';
  return tightDark ? 'text-base px-3 py-2.5' : V3_SIZE[size];
}
function control(
  kind: Kind,
  classes: string,
  data: string,
  attributes: string,
) {
  const open = `<${kind} id="${TARGET}" class="${classes}"${data} placeholder="Placeholder" ${attributes}`;
  return kind === 'input' ? `${open}>` : `${open}></textarea>`;
}
function fieldPair(
  kind: Kind,
  variant: Variant,
  size: Size,
  state: State,
): Pair {
  const attributes = STATE_ATTRIBUTES[state];
  const height = kind === 'textarea' ? ` ${V3_MIN_HEIGHT[size]}` : '';
  const v3 = `${V3_FIELD} ${V3_VARIANT[variant]} ${v3SizeClasses(variant, size)}${height}`;
  return {
    name: `${kind}/${variant}/${size}/${state}`,
    dark: variant === 'dark',
    v3: control(kind, v3, '', attributes),
    v4: control(
      kind,
      `sp-${kind}`,
      `${V4_VARIANT[variant]}${v4Size(size)}`,
      attributes,
    ),
    focus: isFocused(state),
    red: isInvalid(state) ? 'border-top-color' : null,
    antialiased: kind === 'textarea' || state === 'disabled',
  };
}
function selectMarkup(
  classes: string,
  data: string,
  parts: Record<'wrapper' | 'icon', string>,
  attributes: string,
) {
  return [
    `<div class="${parts.wrapper}">`,
    `<select id="${TARGET}" class="${classes}"${data} ${attributes}>`,
    '<option value="">Select provider...</option><option value="aws">Amazon Web Services</option>',
    '</select>',
    `<svg class="${parts.icon}" aria-hidden="true" viewBox="0 0 16 16" fill="none">${CHEVRON}</svg>`,
    '</div>',
  ].join('');
}
function selectPair(
  variant: 'default' | 'dark',
  size: Size,
  state: State,
): Pair {
  const attributes = STATE_ATTRIBUTES[state];
  const v3 = `${V3_SELECT} ${V3_SELECT_VARIANT[variant]} ${V3_SIZE[size]}`;
  const v3Parts = {
    wrapper: 'relative',
    icon: `${V3_ICON} ${V3_ICON_COLOUR[variant]}`,
  };
  const v4Parts = {
    wrapper: 'sp-native-select-field',
    icon: 'sp-native-select-icon',
  };
  const data = `${variant === 'dark' ? ' data-variant="on-dark"' : ''}${v4Size(size)}`;
  return {
    name: `native-select/${variant}/${size}/${state}`,
    dark: variant === 'dark',
    v3: selectMarkup(v3, '', v3Parts, attributes),
    v4: selectMarkup('sp-native-select', data, v4Parts, attributes),
    focus: isFocused(state),
    red: null,
    antialiased: state === 'disabled',
  };
}
function labelPair(size: Size, required: boolean): Pair {
  const v3 = `<label id="${TARGET}" class="${V3_LABEL} ${V3_LABEL_SIZE[size]}">Name${required ? REQUIRED_V3 : ''}</label>`;
  const v4 = `<label id="${TARGET}" class="sp-label"${v4Size(size)}>Name${required ? REQUIRED_V4 : ''}</label>`;
  return {
    name: `label/${size}/${required ? 'required' : 'plain'}`,
    dark: false,
    v3,
    v4,
    focus: false,
    red: null,
    antialiased: false,
  };
}
function messagePair(message: 'hint' | 'error'): Pair {
  const invalid = message === 'error' ? ' aria-invalid="true"' : '';
  const input = (classes: string) =>
    `<input class="${classes}" placeholder="Placeholder"${invalid}>`;
  const colour = message === 'error' ? 'text-error' : 'text-muted-foreground';
  const v3Input = `${V3_FIELD} ${V3_VARIANT.default} ${V3_SIZE.default}`;
  const v3 = `<div class="flex flex-col gap-1.5"><label class="${V3_LABEL} ${V3_LABEL_SIZE.default}">Email</label>${input(v3Input)}<p id="${TARGET}" class="m-0 font-sans ${colour} text-xs">Message</p></div>`;
  const v4 = `<div class="sp-form-field"><label class="sp-label">Email</label>${input('sp-input')}<p id="${TARGET}" class="sp-form-field-${message}">Message</p></div>`;
  return {
    name: `form-field/${message}`,
    dark: false,
    v3,
    v4,
    focus: false,
    red: message === 'error' ? 'color' : null,
    antialiased: false,
  };
}
const PAIRS: readonly Pair[] = [
  ...(['input', 'textarea'] as const).flatMap((kind) =>
    VARIANTS.flatMap((variant) =>
      SIZES.flatMap((size) =>
        FIELD_STATES.map((state) => fieldPair(kind, variant, size, state)),
      ),
    ),
  ),
  ...(['default', 'dark'] as const).flatMap((variant) =>
    SIZES.flatMap((size) =>
      SELECT_STATES.map((state) => selectPair(variant, size, state)),
    ),
  ),
  ...SIZES.flatMap((size) => [labelPair(size, false), labelPair(size, true)]),
  messagePair('hint'),
  messagePair('error'),
];
async function inject(page: Page, pair: Pair, html: string, scheme: string) {
  await page.evaluate(
    ({ markup, dark, colours }) => {
      document.getElementById('parity')?.remove();
      const holder = document.createElement('div');
      holder.id = 'parity';
      holder.className = dark
        ? 'docs-preview docs-preview--dark'
        : 'docs-preview';
      holder.style.cssText =
        'position:fixed;top:0;left:0;width:480px;z-index:99999;border-radius:0';
      holder.style.colorScheme = colours;
      holder.innerHTML = markup;
      document.body.append(holder);
    },
    { markup: html, dark: pair.dark, colours: scheme },
  );
}
const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    ),
  );
const readStyle = (page: Page) =>
  page.evaluate(
    ({ properties, colours, id }) => {
      const target = document.getElementById(id);
      if (target === null) throw new Error('no target');
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
      const style = getComputedStyle(target);
      const probe = document.createElement('i');
      probe.style.color = 'var(--error-text)';
      document.body.append(probe);
      const errorText = rgba(getComputedStyle(probe).color);
      probe.remove();
      return {
        style: {
          ...Object.fromEntries(
            properties.map((name) => [name, style.getPropertyValue(name)]),
          ),
          ...Object.fromEntries(
            colours.map((name) => [name, rgba(style.getPropertyValue(name))]),
          ),
        },
        placeholder: rgba(getComputedStyle(target, '::placeholder').color),
        errorText,
        focusVisible: target.matches(':focus-visible'),
      };
    },
    { properties: [...PROPERTIES], colours: [...COLOURS], id: TARGET },
  );
const shadowGeometry = (shadow: string): string =>
  shadow
    .replace(COLOUR, '')
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter((part) => part !== '' && part !== 'none' && !NO_SHADOW.test(part))
    .join(', ');
async function observe(
  page: Page,
  pair: Pair,
  html: string,
  scheme: string,
): Promise<Observation> {
  await inject(page, pair, html, scheme);
  if (pair.focus) await page.locator(`#${TARGET}`).focus();
  await settle(page);
  const holder = page.locator('#parity');
  const read = await readStyle(page);
  const box = await holder.boundingBox();
  const pixels = await captureState(holder, {
    animations: 'disabled',
    caret: 'hide',
  });
  return {
    ...read,
    style: {
      ...read.style,
      'box-shadow': shadowGeometry(read.style['box-shadow'] ?? ''),
    },
    box: JSON.stringify(box),
    pixels,
  };
}
async function open(page: Page, path: string, scheme: string) {
  await page.goto(path);
  await page.locator('section').first().waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
}
const schemeOf = (testInfo: TestInfo) => {
  const known = SCHEMES.find((name) => name === testInfo.project.name);
  if (known === undefined) throw new Error('unknown scheme');
  return known;
};
function redProblems(pair: Pair, v4: Observation): string[] {
  if (pair.red === null) return [];
  const actual = v4.style[pair.red];
  if (actual === v4.errorText) return [];
  return [
    `${pair.name}: ${pair.red} is ${actual}, not --error-text ${v4.errorText}`,
  ];
}
const focusProblems = (pair: Pair, v4: Observation): string[] =>
  pair.focus && !v4.focusVisible ? [`${pair.name}: not :focus-visible`] : [];
async function observeAll(page: Page, pairs: readonly Pair[], scheme: string) {
  const seen = new Map<string, Observation>();
  for (const pair of pairs) {
    const html = pair.v4;
    seen.set(pair.name, await observe(page, pair, html, scheme));
  }
  return seen;
}
const lookup = (seen: Map<string, Observation>, name: string): Observation => {
  const found = seen.get(name);
  if (found === undefined) throw new Error(name);
  return found;
};
const GROUPS = [
  'input',
  'textarea',
  'native-select',
  'label',
  'form-field',
] as const;
for (const group of GROUPS) {
  test(`forms-parity/${group}`, async ({ page }, testInfo) => {
    const scheme = schemeOf(testInfo);
    const pairs = PAIRS.filter((pair) => pair.name.startsWith(`${group}/`));
    await open(page, specimenUrl(SPECIMEN, scheme), scheme);
    const v4 = await observeAll(page, pairs, scheme);
    const problems: string[] = [];
    for (const pair of pairs) {
      const seen = lookup(v4, pair.name);
      problems.push(...focusProblems(pair, seen), ...redProblems(pair, seen));
    }
    expect(problems).toEqual([]);
  });
}
