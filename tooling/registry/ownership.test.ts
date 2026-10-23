import { afterEach, expect, it } from 'bun:test';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { updateFixture } from './ownership.js';

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

function installedPackage(version: unknown) {
  const app = mkdtempSync(join(tmpdir(), 'sapphire-ownership-fixture-'));
  directories.push(app);
  const root = join(app, 'node_modules/@kongmy-dev/sapphire-ui');
  mkdirSync(join(root, 'dist/components/button'), { recursive: true });
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({
      name: '@kongmy-dev/sapphire-ui',
      version,
      scripts: { prepack: 'exit 41' },
    }),
  );
  writeFileSync(
    join(root, 'dist/components/button/button.css'),
    '.sp-button { color: inherit; }',
  );
  return { app, root };
}

for (const [before, after] of [
  ['4.0.0', '4.0.1'],
  ['5.2.9', '5.2.10'],
]) {
  it(`packs a compatible patch fixture from installed ${before} without changing its source`, () => {
    const { app, root } = installedPackage(before);
    const tarball = updateFixture(app);
    directories.push(dirname(tarball));
    const manifest = execFileSync(
      'tar',
      ['-xOf', tarball, 'package/package.json'],
      { encoding: 'utf8' },
    );
    const packed: unknown = JSON.parse(manifest);
    expect(packed).toMatchObject({ version: after });
    const css = execFileSync(
      'tar',
      ['-xOf', tarball, 'package/dist/components/button/button.css'],
      { encoding: 'utf8' },
    );
    expect(css).toContain('--registry-package-button-proof: 1');
    expect(readFileSync(join(root, 'package.json'), 'utf8')).toContain(
      `"version":"${before}"`,
    );
    expect(
      readFileSync(join(root, 'dist/components/button/button.css'), 'utf8'),
    ).not.toContain('--registry-package-button-proof');
  });
}

for (const version of [
  undefined,
  5,
  '5.0',
  '5.0.0-beta.1',
  '5.0.9007199254740991',
]) {
  it(`rejects unsupported installed version ${String(version)} without inventing an update`, () => {
    expect(() => updateFixture(installedPackage(version).app)).toThrow(
      'package',
    );
  });
}
