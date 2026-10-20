import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildArgs, imageTag, readVersions, runArgs } from './container';

const packageText = JSON.stringify({
  devDependencies: { '@playwright/test': '1.61.1', vite: '8.3.4' },
});
const versions = { bun: '1.4.3', playwright: '1.61.1' };

describe('pin container versions', () => {
  it('reads the Bun version and the pinned Playwright version', () => {
    expect(readVersions('1.4.3\n', packageText)).toEqual(versions);
  });

  it('refuses a range, a missing Playwright and a Bun tag', () => {
    const range = JSON.stringify({
      devDependencies: { '@playwright/test': '^1.61.1' },
    });
    expect(readVersions('1.4.3', range)).toBeNull();
    expect(readVersions('1.4.3', '{}')).toBeNull();
    expect(readVersions('latest', packageText)).toBeNull();
  });
});

describe('pin container commands', () => {
  const owner = { uid: 501, gid: 20 };
  const root = '/Users/me/Projects/sapphire-ui';

  it('builds the image for linux/arm64 from the pinned versions', () => {
    const args = buildArgs(versions, owner).join(' ');
    expect(args).toContain('--platform linux/arm64');
    expect(args).toContain('--build-arg BUN_VERSION=1.4.3');
    expect(args).toContain('--build-arg PLAYWRIGHT_VERSION=1.61.1');
    expect(args).toContain('--build-arg HOST_UID=501');
    expect(args).toContain('--build-arg HOST_GID=20');
    expect(args).toContain(`--tag ${imageTag(versions, owner)}`);
  });

  it('runs as the host user with a persistent private modules volume and cache', () => {
    const args = runArgs(root, versions, owner, []).join(' ');
    expect(args).toContain('--platform linux/arm64');
    expect(args).toContain(`--volume ${root}:/work`);
    expect(args).toContain('--user 501:20');
    expect(args).toContain('--tmpfs /tmp:rw,exec,mode=1777');
    expect(args).not.toContain('--tmpfs /work/node_modules');
    expect(args).toMatch(
      /--volume sapphire-visual-owned-v1-[a-f0-9]+:\/work\/node_modules/,
    );
    expect(args).toContain(
      '--env BUN_INSTALL_CACHE_DIR=/work/node_modules/.cache/bun',
    );
  });

  it('isolates modules by checkout, user, group and toolchain version', () => {
    const original = runArgs(root, versions, owner, []);
    const commands = [
      original,
      runArgs('/other/checkout', versions, owner, []),
      runArgs(root, versions, { uid: 502, gid: 20 }, []),
      runArgs(root, versions, { uid: 501, gid: 21 }, []),
      runArgs(root, { ...versions, bun: '1.4.4' }, owner, []),
      runArgs(root, { ...versions, playwright: '1.61.2' }, owner, []),
    ];
    const mounts = commands.map((args) =>
      args.find((arg) => arg.endsWith(':/work/node_modules')),
    );
    expect(new Set(mounts).size).toBe(commands.length);
    expect(runArgs(root, versions, owner, [])).toEqual(original);
  });

  it('passes the Playwright arguments through after the script', () => {
    const args = runArgs(root, versions, owner, ['--grep', 'a b']);
    expect(args.slice(-3)).toEqual(['sh', '--grep', 'a b']);
  });

  it('never changes permissions recursively or mounts legacy shared caches', () => {
    const args = runArgs(root, versions, owner, []).join(' ');
    expect(args).not.toMatch(/\b(?:chown|chmod)\b/);
    expect(args).not.toContain('sapphire-visual-modules-');
    expect(args).not.toContain('sapphire-visual-bun-cache');
    expect(args).not.toContain('/root/');
    const dockerfile = readFileSync(
      join(import.meta.dir, 'Dockerfile'),
      'utf8',
    );
    expect(dockerfile).toMatch(
      /install -d -o "\$\{HOST_UID\}" -g "\$\{HOST_GID\}" \/work\/node_modules/,
    );
    expect(dockerfile).not.toMatch(/\b(?:chown|chmod)\b/);
  });
});
