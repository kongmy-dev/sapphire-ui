import { afterEach, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildStylesheet, FONT_DIR } from './build';
import { componentStylesheets, stylesheetSource } from './stylesheet';
import { makeTree, type Tree } from './tree';

const REPOSITORY = join(import.meta.dir, '../..');
const LAYER_ORDER = '@layer theme,base,components,utilities;';

let tree: Tree | null = null;
afterEach(() => {
  tree?.remove();
  tree = null;
});

describe('stylesheet source', () => {
  it('lists the foundation, then each component folder in sorted order', () => {
    tree = makeTree({
      zeta: '.sp-zeta { color: red; }',
      alpha: '.sp-alpha { color: blue; }',
    });
    expect(stylesheetSource(tree.root)).toBe(
      [
        '@import "./css/layers.css";',
        '@import "./css/fonts.css";',
        '@import "./css/tokens.css";',
        '@import "./css/base.css";',
        '@import "./components/alpha/alpha.css";',
        '@import "./components/zeta/zeta.css";',
        '',
      ].join('\n'),
    );
  });

  it('skips a folder that holds no stylesheet of its own name', () => {
    tree = makeTree({ alpha: '.sp-alpha {}' });
    expect(componentStylesheets(tree.root)).toEqual([
      'components/alpha/alpha.css',
    ]);
  });

  it('lists no component when the components folder does not exist', () => {
    tree = makeTree({});
    expect(componentStylesheets(tree.root)).toEqual([]);
  });

  it('opens with the layer order, imported before anything else', () => {
    const [first] = stylesheetSource(REPOSITORY).split('\n');
    expect(first).toBe('@import "./css/layers.css";');
    expect(readFileSync(join(REPOSITORY, 'css/layers.css'), 'utf8')).toBe(
      '@layer theme, base, components, utilities;\n',
    );
  });
});

describe('built stylesheet', () => {
  it('starts with the layer order in the minified build, whatever follows', async () => {
    tree = makeTree({
      alpha: '@layer components { .sp-alpha { color: red; } }',
    });
    const built = await buildStylesheet(tree.root, tree.out, { minify: true });
    expect(readFileSync(built.stylesheet, 'utf8').startsWith(LAYER_ORDER)).toBe(
      true,
    );
  });

  it('copies every font next to the stylesheet and leaves no data URI behind', async () => {
    tree = makeTree({});
    const built = await buildStylesheet(tree.root, tree.out, { minify: true });
    const css = readFileSync(built.stylesheet, 'utf8');
    expect(css).not.toContain('data:');
    expect(built.fonts.length).toBeGreaterThan(0);
    for (const font of built.fonts) {
      expect(css).toContain(`url(./${FONT_DIR}/${font})`);
      expect(Bun.file(join(tree.out, FONT_DIR, font)).size).toBeGreaterThan(0);
    }
  });

  it('declares each family the tokens name, latin and latin-ext only', async () => {
    tree = makeTree({});
    const built = await buildStylesheet(tree.root, tree.out, { minify: true });
    const css = readFileSync(built.stylesheet, 'utf8');
    for (const family of ['Newsreader', 'Source Sans 3', 'JetBrains Mono']) {
      expect(css).toContain(family.includes(' ') ? `"${family}"` : family);
    }
    expect(built.fonts.every((font) => /-latin(-ext)?-wght-/.test(font))).toBe(
      true,
    );
  });

  it('puts a new component folder into the build with no edit to a shared file', async () => {
    tree = makeTree({
      bloom: '@layer components { .sp-bloom { color: hotpink; } }',
    });
    const built = await buildStylesheet(tree.root, tree.out, { minify: true });
    expect(readFileSync(built.stylesheet, 'utf8')).toContain('.sp-bloom');
  });
});
