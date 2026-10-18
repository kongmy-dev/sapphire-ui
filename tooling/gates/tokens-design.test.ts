import { describe, expect, it } from 'bun:test';
import { designViolations } from './tokens-design';

const tokens = {
  name: 'css/tokens.css',
  text: [
    ':root,',
    '[data-theme="light"],',
    '[data-theme="dark"],',
    '.dark {',
    '  --primary: light-dark(#0a192f, #0a192f);',
    '  --foreground: light-dark(#1e293b, #f1f5f9);',
    '  --muted-foreground: light-dark(#475569, rgb(241, 245, 249, 0.72));',
    '  --card-foreground: var(--foreground);',
    '}',
    ':root {',
    '  --radius: 12px;',
    '  --shadow-sm: 0 1px 3px color-mix(in srgb, var(--primary) 6%, transparent);',
    '}',
    '',
  ].join('\n'),
};

const design = (rows: string[]) => ({
  name: 'DESIGN.md',
  text: [
    '## Colour',
    '',
    '| Token | Light | Dark | Use |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n'),
});

const GOOD_ROWS = [
  '| `--foreground` | `#1E293B` | `#f1f5f9` | body text |',
  '| `--muted-foreground` | `#475569` | `rgb(241,245,249,0.72)` | captions |',
  '| `--card-foreground` | `#1e293b` | `#f1f5f9` | text on a card |',
  '| `--primary` | `#0a192f` | `#0a192f` | navy |',
];

const problems = (rows: string[]) =>
  designViolations(tokens, design(rows)).map(
    (found) => `${found.line} ${found.problem}`,
  );

describe('token gate: DESIGN.md matches css/tokens.css', () => {
  it('passes when every colour token has a row with the resolved values, in any hex case', () => {
    expect(problems(GOOD_ROWS)).toEqual([]);
  });

  it('flags the stale muted-foreground the v3 design file carried', () => {
    const rows = [
      GOOD_ROWS[0] ?? '',
      '| `--muted-foreground` | `#64748b` | `rgb(241, 245, 249, 0.72)` | captions |',
      GOOD_ROWS[2] ?? '',
      GOOD_ROWS[3] ?? '',
    ];
    expect(problems(rows)).toEqual([
      '6 --muted-foreground is "#64748b" in light here and "#475569" in css/tokens.css',
    ]);
  });

  it('flags a colour token that has no row, once, at the top of the file', () => {
    expect(problems(GOOD_ROWS.slice(0, 3))).toEqual([
      '1 --primary has no row in a DESIGN.md token table',
    ]);
  });

  it('flags a row for a token that css/tokens.css does not declare', () => {
    expect(
      problems([
        ...GOOD_ROWS,
        '| `--color-surface` | `#f4f6f8` | `#0a192f` | v3 |',
      ]),
    ).toEqual(['9 --color-surface is not declared in css/tokens.css']);
  });

  it('compares a non-colour row against its value, and reads a shadow as the colour it renders', () => {
    const rows = [
      ...GOOD_ROWS,
      '| `--radius` | `10px` | cards |',
      '| `--shadow-sm` | `0 1px 3px rgb(10, 25, 47, 0.06)` | cards |',
    ];
    expect(problems(rows)).toEqual([
      '9 --radius is "10px" here and "12px" in css/tokens.css',
    ]);
  });

  it('ignores table rows that are not token rows', () => {
    expect(
      problems([...GOOD_ROWS, '| Primary action | button | navy |']),
    ).toEqual([]);
  });

  it('fails once when DESIGN.md does not exist', () => {
    expect(
      designViolations(tokens, undefined).map((found) => found.problem),
    ).toEqual(['DESIGN.md does not exist']);
  });
});
