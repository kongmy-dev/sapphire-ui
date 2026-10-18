import { describe, expect, it } from 'bun:test';
import { strayComments } from './comments';

const strayIn = (text: string, file = 'sample.ts') =>
  strayComments(file, text).map((c) => ({ line: c.line, text: c.text }));

describe('comments gate: stray comment detection', () => {
  it('reports a plain line comment with its line number', () => {
    expect(strayIn('const a = 1;\n// explains a\nconst b = 2;\n')).toEqual([
      { line: 2, text: '// explains a' },
    ]);
  });

  it('reports trailing line comment after code', () => {
    expect(strayIn('const a = 1; // explains a\n')).toEqual([{ line: 1, text: '// explains a' }]);
  });

  it('reports block comments without exports', () => {
    const found = strayIn('/* block */\nconst a = 1;\n');
    expect(found.map((c) => c.text)).toEqual(['/* block */']);
  });

  it('allows JSDoc blocks directly preceding exported declarations', () => {
    const ts = '/** Description of A */\nexport const a = 1;\n';
    expect(strayIn(ts)).toEqual([]);
  });

  it('allows JSDoc blocks on members of exported types or interfaces', () => {
    const ts = `
export interface Props {
  /** Optional title */
  title?: string;
}
`;
    expect(strayIn(ts)).toEqual([]);
  });

  it('reports comments inside JSX braces', () => {
    const found = strayIn('export const V = () => <div>{/* note */}</div>;\n', 'view.tsx');
    expect(found.map((c) => c.text)).toEqual(['/* note */']);
  });

  it('allows strings with double slashes', () => {
    const ts = `export const url = 'https://example.com';\n`;
    expect(strayIn(ts)).toEqual([]);
  });
});

describe('comments gate: allowed fixed forms', () => {
  it('passes all allowed fixed forms', () => {
    const allowed = [
      '// vendor: https://radix-ui.com/primitives/docs/overview Radix requires slot forwarding',
      '// ADR-0005',
      '// biome-ignore lint/suspicious/noExplicitAny: third-party untyped callback',
      '// @ts-expect-error https://github.com/microsoft/TypeScript/issues/1',
      '// a11y: WCAG 2.1 AA 1.4.3 requires 4.5:1 contrast',
      '/* SPDX-License-Identifier: BSD-3-Clause */',
    ];
    expect(strayIn(`${allowed.join('\nconst x = 1;\n')}\n`)).toEqual([]);
  });

  it('reports malformed fixed forms', () => {
    const malformed = [
      '// vendor: missing url fact',
      '// ADR-5',
      '// biome-ignore missing reason',
      '// a11y: ',
    ];
    expect(strayIn(`${malformed.join('\nconst x = 1;\n')}\n`)).toHaveLength(malformed.length);
  });
});
