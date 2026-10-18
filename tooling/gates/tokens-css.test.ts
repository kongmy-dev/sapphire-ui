import { describe, expect, it } from 'bun:test';
import { tokenFileViolations } from './tokens-css';

const SCOPE = [
  ':root,',
  '[data-theme="light"],',
  '[data-theme="dark"],',
  '.dark {',
];

const tokens = (lines: string[]) => ({
  name: 'css/tokens.css',
  text: `${lines.join('\n')}\n`,
});
const tailwind = (text: string) => ({ name: 'css/tailwind.css', text });
const mapsAll = (names: string[]) =>
  `@theme inline {\n${names.map((name) => `  --x${name}: var(${name});`).join('\n')}\n}\n`;

const problems = (lines: string[], mapping: string) =>
  tokenFileViolations([tokens(lines), tailwind(mapping)]).map(
    (found) => `${found.line} ${found.problem}`,
  );

describe('token gate: colour tokens live in the per-scope block', () => {
  it('flags the v3 dark block, which sets colours on [data-theme=dark] alone', () => {
    const lines = [
      '[data-theme="dark"] {',
      '  --color-surface: #0a192f;',
      '  --color-card-bg: #112240;',
      '  --color-text-muted: rgb(241, 245, 249, 0.72);',
      '}',
    ];
    const mapping = mapsAll([
      '--color-surface',
      '--color-card-bg',
      '--color-text-muted',
    ]);
    expect(problems(lines, mapping)).toEqual([
      '2 --color-surface is a colour token declared on [data-theme=dark]',
      '3 --color-card-bg is a colour token declared on [data-theme=dark]',
      '4 --color-text-muted is a colour token declared on [data-theme=dark]',
    ]);
  });

  it('flags the v3 :root-only alias, which resolves at :root and does not flip', () => {
    const lines = [
      ...SCOPE,
      '  --color-surface: light-dark(#f4f6f8, #0a192f);',
      '  --color-card-bg: light-dark(#fff, #112240);',
      '}',
      ':root {',
      '  --bg-page: var(--color-surface);',
      '  --bg-card: var(--color-card-bg);',
      '}',
    ];
    const mapping = mapsAll([
      '--color-surface',
      '--color-card-bg',
      '--bg-page',
      '--bg-card',
    ]);
    expect(problems(lines, mapping)).toEqual([
      '9 --bg-page is a colour token declared on :root',
      '10 --bg-card is a colour token declared on :root',
    ]);
  });

  it('allows an alias and a literal colour inside the per-scope block', () => {
    const lines = [
      ...SCOPE,
      '  --card: light-dark(#fff, #112240);',
      '  --popover: var(--card);',
      '}',
    ];
    expect(problems(lines, mapsAll(['--card', '--popover']))).toEqual([]);
  });

  it('allows a shadow that reads a colour token, declared on :root', () => {
    const lines = [
      ...SCOPE,
      '  --primary: light-dark(#0a192f, #0a192f);',
      '}',
      ':root {',
      '  --shadow-sm: 0 1px 3px color-mix(in srgb, var(--primary) 6%, transparent);',
      '}',
    ];
    expect(problems(lines, mapsAll(['--primary', '--shadow-sm']))).toEqual([]);
  });
});

describe('token gate: light-dark() takes only colours', () => {
  it('flags the lengths, number, shadow and gradient that failed in all three engines', () => {
    const names = ['--edge', '--radius', '--weight', '--shadow', '--paint'];
    const lines = [
      ...SCOPE,
      '  --edge: light-dark(#cccccc, #333333);',
      '  --radius: light-dark(4px, 12px);',
      '  --weight: light-dark(400, 700);',
      '  --shadow: light-dark(0 1px 2px #0003, 0 1px 2px #000);',
      '  --paint: light-dark(linear-gradient(#ffffff, #ffffff), linear-gradient(#000000, #000000));',
      '}',
    ];
    expect(problems(lines, mapsAll(names))).toEqual([
      '6 --radius: light-dark() argument "4px" is not a colour',
      '6 --radius: light-dark() argument "12px" is not a colour',
      '7 --weight: light-dark() argument "400" is not a colour',
      '7 --weight: light-dark() argument "700" is not a colour',
      '8 --shadow: light-dark() argument "0 1px 2px #0003" is not a colour',
      '8 --shadow: light-dark() argument "0 1px 2px #000" is not a colour',
      '9 --paint: light-dark() argument "linear-gradient(#ffffff, #ffffff)" is not a colour',
      '9 --paint: light-dark() argument "linear-gradient(#000000, #000000)" is not a colour',
    ]);
  });
});

describe('token gate: every token has its Tailwind mapping', () => {
  const lines = [
    ':root {',
    '  --font-serif: "Newsreader", georgia, serif;',
    '  --space-4: 1rem;',
    '  --radius: 12px;',
    '}',
  ];

  it('flags a token that no @theme inline or @theme reference value reads', () => {
    const mapping = [
      '@theme reference {',
      '  --font-serif: var(--font-serif);',
      '}',
      '@theme inline {',
      '  --radius-lg: var(--radius);',
      '}',
    ].join('\n');
    expect(problems(lines, mapping)).toEqual([
      '3 --space-4 has no mapping in css/tailwind.css',
    ]);
  });

  it('does not count a plain @theme, whose utilities would read the variable at :root', () => {
    const mapping = [
      '@theme {',
      '  --font-serif: var(--font-serif);',
      '  --spacing-4: var(--space-4);',
      '  --radius-lg: var(--radius);',
      '}',
    ].join('\n');
    expect(problems(lines, mapping)).toEqual([
      '2 --font-serif has no mapping in css/tailwind.css',
      '3 --space-4 has no mapping in css/tailwind.css',
      '4 --radius has no mapping in css/tailwind.css',
    ]);
  });

  it('flags every token when css/tailwind.css is missing', () => {
    expect(
      tokenFileViolations([tokens(lines)]).map((found) => found.problem),
    ).toEqual([
      '--font-serif has no mapping in css/tailwind.css',
      '--space-4 has no mapping in css/tailwind.css',
      '--radius has no mapping in css/tailwind.css',
    ]);
  });

  it('checks nothing when css/tokens.css is not among the files', () => {
    expect(tokenFileViolations([tailwind('@theme inline {}')])).toEqual([]);
  });
});
