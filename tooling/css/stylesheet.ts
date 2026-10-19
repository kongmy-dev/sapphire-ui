import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const STYLESHEET_FILE = 'sapphire.css';

const FOUNDATION = [
  'css/layers.css',
  'css/fonts.css',
  'css/tokens.css',
  'css/base.css',
  'css/layout.css',
] as const;
const COMPONENTS_DIR = 'components';

export function componentStylesheets(root: string): string[] {
  const folder = join(root, COMPONENTS_DIR);
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(folder, name, `${name}.css`)))
    .sort()
    .map((name) => `${COMPONENTS_DIR}/${name}/${name}.css`);
}

export const stylesheetSource = (root: string): string =>
  `${[...FOUNDATION, ...componentStylesheets(root)]
    .map((path) => `@import "./${path}";`)
    .join('\n')}\n`;
