import { describe, expect, it } from 'bun:test';
import { normaliseValue, resolveSheet, tokenSheet } from './token-values';

const sheet = [
  '@import "./other.css";',
  ':root {',
  '  /* the page; a note: with a semicolon; inside */',
  '  --page: #F4F6F8;',
  '  --font: "Source Sans 3", system-ui;',
  '}',
  '.stack { --stack-gap: 1rem; }',
  '[data-theme="dark"] {',
  '  --page: #0a192f;',
  '}',
  '',
].join('\n');

describe('token sheet', () => {
  it('reads custom properties from token scopes with their lines, and skips component scopes', () => {
    expect(tokenSheet(sheet)).toEqual([
      { name: '--page', value: '#F4F6F8', line: 4, selectors: [':root'] },
      {
        name: '--font',
        value: '"Source Sans 3", system-ui',
        line: 5,
        selectors: [':root'],
      },
      {
        name: '--page',
        value: '#0a192f',
        line: 9,
        selectors: ['[data-theme=dark]'],
      },
    ]);
  });

  it('reads a @theme block as the base scope and keeps its options', () => {
    const found = tokenSheet('@theme reference {\n  --a: var(--b);\n}\n');
    expect(found.map((d) => d.selectors)).toEqual([
      ['@theme', '@theme:reference'],
    ]);
  });

  it('applies the dark scope over :root in dark only', () => {
    const parsed = tokenSheet(sheet);
    expect(resolveSheet(parsed, 'light').get('--page')).toBe('#F4F6F8');
    expect(resolveSheet(parsed, 'dark').get('--page')).toBe('#0a192f');
  });
});

describe('token resolution', () => {
  const css = [
    ':root, [data-theme=light], [data-theme=dark], .dark {',
    '  --base: light-dark(#fff, #112240);',
    '  --alias: var(--base);',
    '  --pair: light-dark(var(--alias), rgb(1, 2, 3, 0.5));',
    '  --missing: var(--nowhere);',
    '  --shadow: 0 1px 2px color-mix(in srgb, var(--base) 10%, transparent);',
    '}',
  ].join('\n');

  it('follows var() chains and picks the side of light-dark() per scheme', () => {
    const parsed = tokenSheet(css);
    const light = resolveSheet(parsed, 'light');
    const dark = resolveSheet(parsed, 'dark');
    expect([light.get('--alias'), dark.get('--alias')]).toEqual([
      '#fff',
      '#112240',
    ]);
    expect([light.get('--pair'), dark.get('--pair')]).toEqual([
      '#fff',
      'rgb(1, 2, 3, 0.5)',
    ]);
  });

  it('leaves a var() it cannot resolve in the value', () => {
    expect(resolveSheet(tokenSheet(css), 'light').get('--missing')).toBe(
      'var(--nowhere)',
    );
  });

  it('inlines a colour into color-mix so the mix can be flattened', () => {
    const value = resolveSheet(tokenSheet(css), 'dark').get('--shadow') ?? '';
    expect(normaliseValue(value)).toBe('0 1px 2px rgb(17,34,64,0.1)');
  });
});

describe('value normalisation', () => {
  it('lowercases hex and ignores whitespace around commas and parentheses', () => {
    expect(normaliseValue(' rgb( 255 , 255, 255,\n 0.12 ) #AbC ')).toBe(
      'rgb(255,255,255,0.12) #abc',
    );
  });

  it('turns a mix over transparent into the rgb it renders as', () => {
    expect(normaliseValue('color-mix(in srgb, #0a192f 6%, transparent)')).toBe(
      'rgb(10,25,47,0.06)',
    );
    expect(
      normaliseValue(
        'color-mix(in srgb, rgb(10, 25, 47, 0.5) 50%, transparent)',
      ),
    ).toBe('rgb(10,25,47,0.25)');
  });
});
