import { describe, expect, it } from 'bun:test';
import { commentGate, commentViolations } from './comments';
import { renderReport } from './report';

const flaggedLines = (name: string, text: string) =>
  commentViolations({ name, text }).map((violation) => violation.line);

describe('comment gate: comments outside the allowed forms', () => {
  it('flags a line comment above a statement', () => {
    const text = [
      'export function syncConsent() {',
      '  // Update Cloudflare Zaraz',
      '  const syncWithZaraz = () => {',
      '    return 1;',
      '  };',
      '}',
      '',
    ].join('\n');
    expect(flaggedLines('consent.ts', text)).toEqual([2]);
  });

  it('flags JSDoc above an export', () => {
    const text = [
      "export type Theme = 'light' | 'dark';",
      '',
      "/** Resolve `'system'` against the user's OS preference. */",
      'export function resolveSystemTheme(): Theme {',
      "  return 'light';",
      '}',
      '',
    ].join('\n');
    expect(flaggedLines('theme.ts', text)).toEqual([3]);
  });

  it('flags a comment inside JSX braces', () => {
    const text = [
      'export const view = (',
      '  <div>',
      '    {/* Mobile Drawer Navigation */}',
      '    <nav />',
      '  </div>',
      ');',
      '',
    ].join('\n');
    expect(flaggedLines('App.tsx', text)).toEqual([3]);
  });

  it('flags a block comment and a trailing comment in CSS', () => {
    const text = [
      ':root {',
      '  /* Brand colors */',
      '  --color-primary: #0a192f; /* Dark navy — brand fill (buttons, sidebar). Does NOT flip in dark mode. */',
      '  --color-primary-hover: #1a3358;',
      '}',
      '',
    ].join('\n');
    expect(flaggedLines('index.css', text)).toEqual([2, 3]);
  });

  it('reports the line where a multi-line CSS comment starts', () => {
    const text = [
      '@import "tailwindcss";',
      '/* Brand tokens live in ./theme.css as a Tailwind v4 `@theme {}` block — the',
      '   single source, shipped raw to consumers as `@kongmy-dev/sapphire-ui/theme.css`. */',
      '@import "./theme.css";',
      '',
    ].join('\n');
    expect(flaggedLines('index.css', text)).toEqual([2]);
  });

  it('names the file, line, rule and fix in the report', () => {
    const report = renderReport(
      commentGate([{ name: 'sample.ts', text: 'const a = 1;\n// note\n' }]),
    );
    expect(report.ok).toBe(false);
    expect(report.text).toBe(
      [
        'comment gate: 1 file checked',
        '  sample.ts:2  P-1  comment outside the allowed forms',
        '    Move what it knows into a name, a type, a test name or an ADR, then delete it.',
        'comment gate: FAIL',
      ].join('\n'),
    );
  });
});

describe('comment gate: the two allowed forms', () => {
  it('allows biome-ignore on a style rule with a reason', () => {
    const text =
      '// biome-ignore lint/style/noNonNullAssertion: the map is filled above\nconst a = map.get(key)!;\n';
    expect(flaggedLines('sample.ts', text)).toEqual([]);
  });

  it('allows biome-ignore on a complexity rule inside JSX', () => {
    const text =
      'export const v = <div>{/* biome-ignore lint/complexity/noUselessFragments: slot needs a fragment */}</div>;\n';
    expect(flaggedLines('sample.tsx', text)).toEqual([]);
  });

  it('flags biome-ignore on a rule outside style and complexity', () => {
    const text =
      '// biome-ignore lint/suspicious/noExplicitAny: third-party untyped callback\nconst a: any = 1;\n';
    expect(flaggedLines('sample.ts', text)).toEqual([1]);
  });

  it('flags biome-ignore without a reason', () => {
    const text = '// biome-ignore lint/style/noEnum\nconst a = 1;\n';
    expect(flaggedLines('sample.ts', text)).toEqual([1]);
  });

  it('allows a URL alone above its workaround', () => {
    const text = [
      '// https://bugs.webkit.org/show_bug.cgi?id=1',
      'element.style.willChange = "transform";',
      '',
    ].join('\n');
    expect(flaggedLines('sample.ts', text)).toEqual([]);
  });

  it('allows a URL alone in a CSS block comment above its workaround', () => {
    const text = [
      '/* https://bugs.webkit.org/show_bug.cgi?id=1 */',
      'html { -webkit-text-size-adjust: 100%; }',
      '',
    ].join('\n');
    expect(flaggedLines('sample.css', text)).toEqual([]);
  });

  it('flags a URL with words around it', () => {
    const text = '// see https://example.com/issue/1\nconst a = 1;\n';
    expect(flaggedLines('sample.ts', text)).toEqual([1]);
  });

  it('flags a URL trailing code', () => {
    const text = 'const a = 1; // https://example.com/issue/1\nconst b = 2;\n';
    expect(flaggedLines('sample.ts', text)).toEqual([1]);
  });

  it('flags a URL with no workaround beneath it', () => {
    const text =
      'const a = 1;\n// https://example.com/issue/1\n\nconst b = 2;\n';
    expect(flaggedLines('sample.ts', text)).toEqual([2]);
  });
});

describe('comment gate: text that only looks like a comment', () => {
  it('ignores slashes inside strings, templates and regular expressions', () => {
    const text = [
      "export const url = 'https://example.com';",
      'export const glob = `src/**/*.ts`;',
      'export const pattern = /\\/\\*/;',
      '',
    ].join('\n');
    expect(flaggedLines('sample.ts', text)).toEqual([]);
  });

  it('ignores a comment opener inside a CSS string or an unquoted url()', () => {
    const text = [
      'a::after { content: "/* not a comment */"; }',
      '.hero { background: url(https://cdn.example.com/*/hero.png); }',
      '.icon { background: url("data:image/svg+xml;utf8,<svg/>"); }',
      '',
    ].join('\n');
    expect(flaggedLines('sample.css', text)).toEqual([]);
  });

  it('finds a CSS comment that follows a url()', () => {
    const text = '.hero { background: url(a.png); } /* hero */\n';
    expect(flaggedLines('sample.css', text)).toEqual([1]);
  });
});

describe('comment gate: a gate that checked nothing fails', () => {
  it('fails with no files', () => {
    const report = renderReport(commentGate([]));
    expect(report.ok).toBe(false);
    expect(report.text).toBe(
      'comment gate: 0 files checked\ncomment gate: FAIL — nothing was measured',
    );
  });

  it('passes a clean file and prints its count', () => {
    const report = renderReport(
      commentGate([{ name: 'sample.ts', text: 'export const a = 1;\n' }]),
    );
    expect(report).toEqual({
      ok: true,
      text: 'comment gate: 1 file checked\ncomment gate: OK',
    });
  });
});
