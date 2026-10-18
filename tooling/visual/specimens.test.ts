import { describe, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exampleNames } from './examples';
import {
  coveredPins,
  pinProblems,
  pinsOf,
  readSpecimens,
  specimenFiles,
  specimenPage,
  specimenUrl,
} from './specimens';

const REPO = join(import.meta.dirname, '../..');

function withTree<T>(
  files: Record<string, string>,
  check: (root: string) => T,
): T {
  const root = mkdtempSync(join(tmpdir(), 'sapphire-specimens-test-'));
  try {
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(join(root, file, '..'), { recursive: true });
      writeFileSync(join(root, file), text);
    }
    return check(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('pin names in a specimen', () => {
  it('lists every data-pin section in order', () => {
    const html = [
      '<section class="docs-section" data-pin="buttons/variants"></section>',
      '<section data-pin="buttons/sizes" class="docs-section"></section>',
      '<div data-pin="buttons/ignored"></div>',
    ].join('\n');
    expect(pinsOf(html)).toEqual(['buttons/variants', 'buttons/sizes']);
  });
});

describe('specimen files', () => {
  it('finds the base specimen and one per component folder, sorted', () => {
    const tree = {
      'css/base.examples.html': '',
      'components/card/card.examples.html': '',
      'components/button/button.examples.html': '',
      'components/badge/badge.css': '',
    };
    withTree(tree, (root) => {
      expect(specimenFiles(root)).toEqual([
        'components/button/button.examples.html',
        'components/card/card.examples.html',
        'css/base.examples.html',
      ]);
    });
  });

  it('reads the pins of each file', () => {
    const tree = {
      'components/button/button.examples.html':
        '<section data-pin="buttons/variants"></section>',
    };
    withTree(tree, (root) => {
      expect(coveredPins(root)).toEqual(['buttons/variants']);
      expect(readSpecimens(root)).toEqual([
        {
          file: 'components/button/button.examples.html',
          pins: ['buttons/variants'],
        },
      ]);
    });
  });
});

describe('pin problems', () => {
  const known = ['buttons/variants', 'buttons/sizes'];

  it('accepts known pins used once', () => {
    const specimens = [{ file: 'a.html', pins: ['buttons/variants'] }];
    expect(pinProblems(specimens, known)).toEqual([]);
  });

  it('fails an unknown pin and names the file', () => {
    const specimens = [{ file: 'a.html', pins: ['buttons/nope'] }];
    expect(pinProblems(specimens, known)).toEqual([
      'a.html: unknown pin buttons/nope',
    ]);
  });

  it('fails a pin used twice, in one file or across files', () => {
    const specimens = [
      { file: 'a.html', pins: ['buttons/variants', 'buttons/variants'] },
      { file: 'b.html', pins: ['buttons/variants'] },
    ];
    expect(pinProblems(specimens, known)).toEqual([
      'a.html: buttons/variants is also in a.html',
      'b.html: buttons/variants is also in a.html',
    ]);
  });
});

describe('the repository specimens', () => {
  it('cover only pins the v3 docs know, each once', () => {
    expect(pinProblems(readSpecimens(REPO), exampleNames())).toEqual([]);
  });

  it('cover the two typography pins', () => {
    expect(coveredPins(REPO)).toContain('typography/font-families');
    expect(coveredPins(REPO)).toContain('typography/type-scale');
  });
});

describe('the specimen page', () => {
  it('sets the theme and loads both stylesheets around the fragment', () => {
    const page = specimenPage('css/base.examples.html', '<p>hello</p>', 'dark');
    expect(page).toContain('<html lang="en" data-theme="dark">');
    expect(page).toContain('href="/sapphire.css"');
    expect(page).toContain('href="/specimen.css"');
    expect(page).toContain('<main class="docs-main">\n<p>hello</p>\n</main>');
  });

  it('builds the url with the scheme', () => {
    expect(specimenUrl('css/base.examples.html', 'light')).toBe(
      'http://localhost:4175/css/base.examples.html?scheme=light',
    );
  });
});
