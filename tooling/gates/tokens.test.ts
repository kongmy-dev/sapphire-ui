import { describe, expect, it } from 'bun:test';
import { renderReport } from './report';
import { tokenGate, tokenViolations } from './tokens';

const css = (name: string, text: string) => ({ name, text });

const problems = (name: string, text: string, others = [] as string[]) =>
  tokenViolations([
    css(name, text),
    ...others.map((other, index) => css(`css/other-${index}.css`, other)),
  ]).map((violation) => `${violation.line} ${violation.problem}`);

describe('token gate: colour literals', () => {
  it('flags a hex colour in a stylesheet and allows it in css/tokens.css', () => {
    const text = [
      ':root {',
      '  /* Brand colors */',
      '  --color-primary: #0a192f; /* Dark navy — brand fill (buttons, sidebar). Does NOT flip in dark mode. */',
      '  --color-primary-hover: #1a3358;',
      '}',
      '',
    ].join('\n');
    expect(problems('components/button/button.css', text)).toEqual([
      '3 colour literal #0a192f',
      '4 colour literal #1a3358',
    ]);
    expect(problems('css/tokens.css', text)).toEqual([]);
  });

  it('flags colour functions in a stylesheet', () => {
    const text = [
      ':root {',
      '  --color-text-on-dark-muted: rgb(241, 245, 249, 0.65);',
      '  --color-success-bg: rgb(34, 197, 94, 0.1);',
      '  --brand: oklch(0.3 0.1 250);',
      '  --mix: color-mix(in oklch, var(--brand), transparent);',
      '}',
      '',
    ].join('\n');
    expect(
      problems('site/page.css', text, [':root { --brand: red; }']),
    ).toEqual([
      '2 colour literal rgb(241, 245, 249, 0.65)',
      '3 colour literal rgb(34, 197, 94, 0.1)',
      '4 colour literal oklch(0.3 0.1 250)',
    ]);
  });

  it('flags a Tailwind arbitrary colour in a class string', () => {
    const text = 'export const C = () => <div className="bg-[#0a192f]" />;';
    expect(problems('components/card/card.tsx', text)).toEqual([
      '1 colour literal #0a192f',
    ]);
  });

  it('flags a colour inside a template literal', () => {
    const text = 'export const color = `#123456`;';
    expect(problems('site/theme.ts', text)).toEqual([
      '1 colour literal #123456',
    ]);
  });

  it('flags a colour inside a Tailwind @apply', () => {
    const text = '.card {\n  @apply bg-[#0a192f] p-4;\n}\n';
    expect(problems('components/card/card.css', text)).toEqual([
      '2 colour literal #0a192f',
    ]);
  });

  it('does not take page anchors, entities or url() fragments for colours', () => {
    const text = [
      'export const C = () => (',
      '  <nav>',
      '    <a href="#features">Features</a>',
      '    <a href="#add">Add</a>',
      '    <a href="#bad">Bad</a>',
      '    <span>{"&#8212;"}</span>',
      '    <svg fill="url(#fade)" />',
      '  </nav>',
      ');',
      '',
    ].join('\n');
    expect(problems('site/nav.tsx', text)).toEqual([]);
  });

  it('does not take a hex-looking selector or url in a stylesheet for a colour', () => {
    const text = [
      '#add { color: var(--fg); }',
      '.a { background: url(#fade); fill: url("#bad"); }',
      'a[href="#fff"] { color: var(--fg); }',
      '',
    ].join('\n');
    expect(problems('site/page.css', text, [':root { --fg: red; }'])).toEqual(
      [],
    );
  });
});

describe('token gate: length literals', () => {
  it('flags the padding drift in the default Button size', () => {
    const text = [
      'export const sizes = {',
      "  default: 'px-4 py-[9px] text-[14px]',",
      '};',
      '',
    ].join('\n');
    expect(problems('components/button/button.tsx', text)).toEqual([
      '2 length literal 9px',
      '2 length literal 14px',
    ]);
  });

  it('flags absolute and font-relative lengths in a stylesheet declaration', () => {
    const text = [
      '.badge {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '  padding: 3px 10px;',
      '  font-family: var(--font-sans);',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  letter-spacing: 0.04em;',
      '}',
      '',
    ].join('\n');
    expect(
      problems('components/badge/badge.css', text, [
        ':root { --font-sans: x; }',
      ]),
    ).toEqual([
      '4 length literal 6px',
      '5 length literal 3px',
      '5 length literal 10px',
      '7 length literal 11px',
      '9 length literal 0.04em',
    ]);
    expect(
      problems('css/tokens.css', text, [':root { --font-sans: x; }']),
    ).toEqual([]);
  });

  it('flags a negative length and a length inside calc()', () => {
    const text = '.a { margin: -4px; width: calc(100% - 2rem); }\n';
    expect(problems('site/page.css', text)).toEqual([
      '1 length literal -4px',
      '1 length literal 2rem',
    ]);
  });

  it('allows zero, percentages, fr, viewport units and unitless numbers', () => {
    const text = [
      '.a {',
      '  margin: 0 0px 0.0em 0;',
      '  width: 100%;',
      '  grid-template-columns: 1fr 2fr;',
      '  min-height: 100vh;',
      '  line-height: 1.5;',
      '  transition: opacity 150ms ease;',
      '  transform: rotate(45deg);',
      '}',
      '',
    ].join('\n');
    expect(problems('site/page.css', text)).toEqual([]);
  });

  it('allows a length in a media, container or supports prelude', () => {
    const text = [
      '@media (min-width: 640px) { .a { color: inherit; } }',
      '@container card (min-width: 20rem) { .a { color: inherit; } }',
      '@supports (width: 1px) { .a { color: inherit; } }',
      '',
    ].join('\n');
    expect(problems('site/page.css', text)).toEqual([]);
  });

  it('ignores lengths inside strings, urls and identifiers', () => {
    const text = [
      '.a { content: "10px"; background: url(/img/4px.png); }',
      '.b { width: var(--size-4px); }',
      '',
    ].join('\n');
    expect(
      problems('site/page.css', text, [':root { --size-4px: 0; }']),
    ).toEqual([]);
  });

  it('flags a length inside a bracketed value, with underscores as spaces', () => {
    const text =
      'export const c = "w-[calc(100%_-_2rem)] h-[0px] gap-4 [&>svg]:size-4";';
    expect(problems('components/card/card.tsx', text)).toEqual([
      '1 length literal 2rem',
    ]);
  });
});

describe('token gate: variables that resolve', () => {
  it('flags a var() declared in no CSS file', () => {
    const text = '.a { color: var(--color-missing); }\n';
    const found = tokenViolations([css('components/a/a.css', text)]);
    expect(found).toEqual([
      {
        file: 'components/a/a.css',
        line: 1,
        rule: 'P-5',
        problem:
          'var(--color-missing) is declared in no CSS file under css/, components/, blocks/, elements/, site/',
        fix: 'Declare --color-missing in css/tokens.css, or use a token that exists.',
      },
    ]);
  });

  it('resolves a var() against a declaration in another file and in @property', () => {
    const tokens =
      ':root { --color-primary: red; }\n@property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }\n';
    const use = '.a { color: var(--color-primary); rotate: var(--angle); }\n';
    expect(problems('components/a/a.css', use, [tokens])).toEqual([]);
  });

  it('flags a var() inside a class string', () => {
    const text = 'export const c = "bg-[var(--color-missing)]";';
    expect(problems('components/a/a.tsx', text)).toEqual([
      '1 var(--color-missing) is declared in no CSS file under css/, components/, blocks/, elements/, site/',
    ]);
  });

  it('leaves variables that Radix sets at runtime alone', () => {
    const text =
      'export const c = () => <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" />;';
    expect(problems('blocks/combobox/combobox.tsx', text)).toEqual([]);
  });

  it('leaves a fallback var() with its token declared alone', () => {
    const text = '.a { color: var(--fg, var(--fg-fallback)); }\n';
    expect(
      problems('site/page.css', text, [
        ':root { --fg: red; --fg-fallback: blue; }',
      ]),
    ).toEqual([]);
  });
});

describe('token gate: a gate that checked nothing fails', () => {
  it('fails with no files', () => {
    expect(renderReport(tokenGate([]))).toEqual({
      ok: false,
      text: 'token gate: 0 files checked\ntoken gate: FAIL — nothing was measured',
    });
  });
});

describe('token gate: the printed failure', () => {
  it('names file:line, the rule, the problem and the fix for each rule, and reads DESIGN.md as a table', () => {
    const tokens = [
      ':root,',
      '[data-theme="light"],',
      '[data-theme="dark"],',
      '.dark {',
      '  --card: light-dark(#fff, #112240);',
      '}',
      '',
    ].join('\n');
    const design = '| Token | Light | Dark |\n| `--card` | `#fff` | `#000` |\n';
    const report = renderReport(
      tokenGate([
        css('css/tokens.css', tokens),
        css('css/tailwind.css', '@theme inline {\n}\n'),
        css('DESIGN.md', design),
      ]),
    );
    expect(report.text).toBe(
      [
        'token gate: 3 files checked',
        '  css/tokens.css:5  P-5  --card has no mapping in css/tailwind.css',
        '    Map it in an @theme inline or @theme reference block of css/tailwind.css, such as --color-card: var(--card).',
        '  DESIGN.md:2  P-5  --card is "#000" in dark here and "#112240" in css/tokens.css',
        '    Write #112240 in the dark column, or change css/tokens.css.',
        'token gate: FAIL',
      ].join('\n'),
    );
  });
});
