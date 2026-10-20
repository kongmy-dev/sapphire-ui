import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageEntries } from './entries.js';

const root = process.cwd();
const path = join(root, 'package.json');
const pkg: unknown = await Bun.file(path).json();
if (typeof pkg !== 'object' || pkg === null || Array.isArray(pkg))
  throw new Error('Invalid package manifest');
const manifest: Record<string, unknown> = Object.fromEntries(
  Object.entries(pkg),
);
manifest.exports = packageEntries(root);
writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
