import { createHash } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { registryItemHeaderProblems } from '../registry/headers';
import { smokeRegistry } from '../registry/smoke';
import { smokeTarball } from './smoke';

const root = process.cwd();
const manifest: unknown = await Bun.file(join(root, 'package.json')).json();
if (
  typeof manifest !== 'object' ||
  manifest === null ||
  !('version' in manifest) ||
  typeof manifest.version !== 'string'
)
  throw new Error('Missing package version');
const metadata = await fetch(
  `https://registry.npmjs.org/@kongmy-dev%2fsapphire-ui/${manifest.version}`,
);
if (!metadata.ok)
  throw new Error(`Published version unavailable: ${metadata.status}`);
const pkg: unknown = await metadata.json();
if (
  typeof pkg !== 'object' ||
  pkg === null ||
  !('dist' in pkg) ||
  typeof pkg.dist !== 'object' ||
  pkg.dist === null ||
  !('tarball' in pkg.dist) ||
  typeof pkg.dist.tarball !== 'string' ||
  !('integrity' in pkg.dist) ||
  typeof pkg.dist.integrity !== 'string'
)
  throw new Error('Missing published artifact metadata');
const url = new URL(pkg.dist.tarball);
if (url.protocol !== 'https:' || url.hostname !== 'registry.npmjs.org')
  throw new Error('Unexpected artifact origin');
const response = await fetch(url);
if (!response.ok) throw new Error(`Artifact fetch failed: ${response.status}`);
const bytes = new Uint8Array(await response.arrayBuffer());
const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
if (integrity !== pkg.dist.integrity)
  throw new Error('Published artifact integrity mismatch');
const tarball = join(
  mkdtempSync(join(tmpdir(), 'sapphire-published-')),
  'package.tgz',
);
await Bun.write(tarball, bytes);
await smokeTarball(root, tarball);
const origin = 'https://design.kongmy.dev';
for (const path of ['/r/button.json', '/r/v4/button.json']) {
  const item = await fetch(origin + path);
  const problems = registryItemHeaderProblems(item.headers);
  if (!item.ok || problems.length)
    throw new Error(`${path}: ${item.status} ${problems.join('; ')}`);
}
for (const path of ['/r/missing-item.json', '/r/v4/nested/missing-item.json']) {
  const missing = await fetch(origin + path);
  if (missing.status !== 404)
    throw new Error(`${path}: expected 404, got ${missing.status}`);
}
await smokeRegistry(root, tarball, `${origin}/r/v4/{name}.json`);
console.log(
  `Published ${manifest.version} and production registry consumer checks passed`,
);
