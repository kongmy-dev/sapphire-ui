import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { STYLESHEET_FILE, stylesheetSource } from './stylesheet';

const REPOSITORY = resolve(import.meta.dir, '../..');

export type Tree = { root: string; out: string; remove: () => void };

export function makeTree(components: Readonly<Record<string, string>>): Tree {
  const scratch = mkdtempSync(join(tmpdir(), 'sapphire-css-'));
  const root = join(scratch, 'root');
  const out = join(scratch, 'out');
  mkdirSync(root);
  cpSync(join(REPOSITORY, 'css'), join(root, 'css'), { recursive: true });
  symlinkSync(join(REPOSITORY, 'node_modules'), join(root, 'node_modules'));
  for (const [name, css] of Object.entries(components)) {
    const file = join(root, 'components', name, `${name}.css`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, css);
  }
  writeFileSync(join(root, STYLESHEET_FILE), stylesheetSource(root));
  return { root, out, remove: () => rmSync(scratch, { recursive: true }) };
}
