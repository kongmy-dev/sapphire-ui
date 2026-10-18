import { describe, expect, it } from 'bun:test';
import {
  firstErrorLine,
  gzippedBytes,
  isMeasuredFile,
  mainStylesheet,
  measureTree,
  type PackageFields,
  readPackage,
  regularFilePaths,
} from './measure';

const emptyPackage: PackageFields = {
  scripts: {},
  dependencies: {},
  peerDependencies: {},
  optionalPeers: [],
  exports: {},
};

const packageOf = (fields: Partial<PackageFields>): PackageFields => ({
  ...emptyPackage,
  ...fields,
});

const consentWithComment = [
  'export function syncConsent() {',
  '  // Update Cloudflare Zaraz',
  '  return 1;',
  '}',
  '',
].join('\n');

const nestedBranches = [
  'export function classify(a: number, b: number, c: number) {',
  '  if (a > 0) {',
  '    if (b > 0) {',
  '      if (c > 0) {',
  '        for (let i = 0; i < a; i++) {',
  '          if (i % 2) return 1;',
  '        }',
  '      }',
  '    }',
  '  }',
  '  return 0;',
  '}',
  '',
].join('\n');

describe('scorecard package reading', () => {
  it('counts dependencies, required peers and export entries', () => {
    const pkg = readPackage(
      JSON.stringify({
        dependencies: { clsx: '^2.1.1', 'js-cookie': '^3.0.8' },
        peerDependencies: { react: '^19.0.0', 'react-resizable-panels': '^4' },
        peerDependenciesMeta: { 'react-resizable-panels': { optional: true } },
        exports: { '.': './dist/index.js', './button': './dist/button.js' },
      }),
    );
    expect(pkg).not.toBeNull();
    const measured = measureTree([], pkg ?? emptyPackage);
    expect(measured.runtimeDependencies).toBe(2);
    expect(measured.requiredPeers).toBe(1);
    expect(measured.exportEntries).toBe(2);
  });

  it('counts a pattern export once', () => {
    const pkg = readPackage(
      JSON.stringify({ exports: { './*': './dist/*.js', './css': './a.css' } }),
    );
    expect(Object.keys(pkg?.exports ?? {})).toEqual(['./*', './css']);
  });

  it('treats a string or condition-only exports as one entry', () => {
    const fromString = readPackage(JSON.stringify({ exports: './index.js' }));
    const fromConditions = readPackage(
      JSON.stringify({ exports: { import: './a.js', require: './a.cjs' } }),
    );
    expect(Object.keys(fromString?.exports ?? {})).toEqual(['.']);
    expect(Object.keys(fromConditions?.exports ?? {})).toEqual(['.']);
  });

  it('reads a package with none of the fields as all zeros', () => {
    const pkg = readPackage('{}');
    expect(pkg).toEqual(emptyPackage);
  });

  it('ignores a dependency whose version is not a string', () => {
    const pkg = readPackage(JSON.stringify({ dependencies: { clsx: 2 } }));
    expect(pkg?.dependencies).toEqual({});
  });

  it('returns null for text that is not a JSON object', () => {
    expect(readPackage('not json')).toBeNull();
    expect(readPackage('[]')).toBeNull();
  });
});

describe('scorecard main stylesheet', () => {
  it('finds the v3 stylesheet through its export', () => {
    const pkg = packageOf({
      exports: {
        '.': { import: './dist/index.js' },
        './style.css': './dist/sapphire-ui.css',
        './theme.css': './dist/theme.css',
      },
    });
    expect(mainStylesheet(pkg)).toBe('./dist/sapphire-ui.css');
  });

  it('finds the v4 stylesheet through its export', () => {
    const pkg = packageOf({
      exports: { './sapphire.css': './dist/sapphire.css' },
    });
    expect(mainStylesheet(pkg)).toBe('./dist/sapphire.css');
  });

  it('returns null when no export names a main stylesheet', () => {
    const pkg = packageOf({ exports: { './theme.css': './dist/theme.css' } });
    expect(mainStylesheet(pkg)).toBeNull();
  });
});

describe('scorecard measurement over the whole tree', () => {
  it('counts a stray comment under src/, which the gates leave out', () => {
    const files = [{ name: 'src/lib/consent.ts', text: consentWithComment }];
    expect(measureTree(files, emptyPackage).strayComments).toBe(1);
  });

  it('counts a stray comment in CSS and leaves other extensions out', () => {
    const files = [
      { name: 'src/index.css', text: ':root {\n  /* Brand colors */\n}\n' },
      { name: 'data.json', text: '// not source' },
    ];
    expect(measureTree(files, emptyPackage).strayComments).toBe(1);
  });

  it('counts size findings and the files that fail', () => {
    const files = [
      { name: 'src/lib/classify.ts', text: nestedBranches },
      { name: 'src/lib/consent.ts', text: consentWithComment },
    ];
    const measured = measureTree(files, emptyPackage);
    expect(measured.sizeFindings).toBeGreaterThan(0);
    expect(measured.sizeFailingFiles).toBe(1);
  });

  it('counts Markdown lines except those of CHANGELOG.md', () => {
    const files = [
      { name: 'README.md', text: 'a\nb\nc\n' },
      { name: 'docs/adr/0001.md', text: 'one\ntwo' },
      { name: 'CHANGELOG.md', text: 'x\ny\nz\nw\n' },
    ];
    expect(measureTree(files, emptyPackage).markdownLines).toBe(5);
  });

  it('counts an empty Markdown file as no lines', () => {
    const files = [{ name: 'EMPTY.md', text: '' }];
    expect(measureTree(files, emptyPackage).markdownLines).toBe(0);
  });
});

describe('scorecard file selection', () => {
  it('measures source, stylesheets and Markdown only', () => {
    const measured = ['a.ts', 'a.tsx', 'a.js', 'a.css', 'a.md'];
    const ignored = ['a.json', 'a.png', 'a.html', 'bun.lock'];
    expect(measured.every(isMeasuredFile)).toBe(true);
    expect(ignored.some(isMeasuredFile)).toBe(false);
  });

  it('lists regular files and skips symlinks and gitlinks', () => {
    const listing = [
      '100644 aaaa 0\tCLAUDE.md',
      '120000 bbbb 0\tAGENTS.md',
      '160000 cccc 0\tvendor/module',
      '100755 dddd 0\tscripts/with space.sh',
    ].join('\0');
    expect(regularFilePaths(listing)).toEqual([
      'CLAUDE.md',
      'scripts/with space.sh',
    ]);
  });
});

describe('scorecard gzip and failure reasons', () => {
  it('gzips repeated text far below its size', () => {
    const bytes = new TextEncoder().encode('.sp-button{color:red}'.repeat(500));
    expect(gzippedBytes(bytes)).toBeLessThan(bytes.length / 10);
  });

  it('picks the first line that mentions an error', () => {
    const output = 'building\nsrc/a.ts(1,1): error TS2307: no module\ndone\n';
    expect(firstErrorLine(output)).toBe(
      'src/a.ts(1,1): error TS2307: no module',
    );
  });

  it('falls back to the last line when none mentions an error', () => {
    expect(firstErrorLine('one\ntwo\n\n')).toBe('two');
  });

  it('says so when there was no output, and cuts a long line', () => {
    expect(firstErrorLine('')).toBe('no output');
    expect(firstErrorLine(`error ${'x'.repeat(500)}`).length).toBe(160);
  });
});
