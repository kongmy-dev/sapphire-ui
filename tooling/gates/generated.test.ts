import { afterEach, describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { STYLESHEET_FILE, stylesheetSource } from '../css/stylesheet';
import { makeTree, type Tree } from '../css/tree';
import { GENERATORS } from '../generators';
import { generatedGate } from './generated';
import { renderReport } from './report';

const stylesheetGenerators = [
  { file: STYLESHEET_FILE, generate: stylesheetSource },
];
const REPOSITORY = join(import.meta.dir, '../..');

let tree: Tree | null = null;
afterEach(() => {
  tree?.remove();
  tree = null;
});

function addComponent(root: string, name: string) {
  const folder = join(root, 'components', name);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, `${name}.css`), `.sp-${name} {}\n`);
}

describe('generated gate: every committed generated file is fresh', () => {
  it('passes a stylesheet that its generator would write again', () => {
    tree = makeTree({ alpha: '.sp-alpha {}' });
    expect(
      renderReport(generatedGate(tree.root, stylesheetGenerators)),
    ).toEqual({
      ok: true,
      text: 'generated gate: 1 file checked\ngenerated gate: OK',
    });
  });

  it('names the file, the first differing line and the command when a component folder was added without regenerating', () => {
    tree = makeTree({ alpha: '.sp-alpha {}' });
    addComponent(tree.root, 'beta');
    const report = renderReport(generatedGate(tree.root, stylesheetGenerators));
    expect(report.ok).toBe(false);
    expect(report.text.split('\n').slice(1, 3)).toEqual([
      '  sapphire.css:7  P-16  sapphire.css differs from what its generator writes',
      '    Run bun run generate and commit the result.',
    ]);
  });

  it('fails a stylesheet that was edited by hand', () => {
    tree = makeTree({});
    writeFileSync(
      join(tree.root, STYLESHEET_FILE),
      `${stylesheetSource(tree.root)}.sp-edited {}\n`,
    );
    expect(
      renderReport(generatedGate(tree.root, stylesheetGenerators)).ok,
    ).toBe(false);
  });

  it('fails a stylesheet that is missing', () => {
    tree = makeTree({});
    rmSync(join(tree.root, STYLESHEET_FILE));
    expect(
      renderReport(generatedGate(tree.root, stylesheetGenerators)).text,
    ).toContain('sapphire.css:1  P-16  sapphire.css is missing');
  });

  it('fails when no generator ran', () => {
    tree = makeTree({});
    const report = renderReport(generatedGate(tree.root, []));
    expect(report.ok).toBe(false);
    expect(report.text).toContain('nothing was measured');
  });

  it('holds the committed stylesheet of this repository fresh', () => {
    expect(generatedGate(REPOSITORY, GENERATORS).violations).toEqual([]);
  });
});

it('registers the registry generator and rejects a manually edited registry', () => {
  const generator = GENERATORS.find(
    (entry) => entry.file === 'tooling/registry/generated/registry.json',
  );
  expect(generator).toBeDefined();
  if (!generator) throw new Error('Missing registry generator');
  tree = makeTree({});
  const target = join(tree.root, generator.file);
  mkdirSync(join(tree.root, 'tooling/registry/generated'), { recursive: true });
  writeFileSync(target, '{}');
  const result = generatedGate(tree.root, [
    { file: generator.file, generate: () => generator.generate(REPOSITORY) },
  ]);
  expect(result.violations[0]?.file).toBe(generator.file);
  expect(result.violations[0]?.rule).toBe('P-16');
});
