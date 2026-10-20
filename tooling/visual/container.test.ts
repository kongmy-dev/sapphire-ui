import { describe, expect, it } from 'bun:test';
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
    const args = buildArgs(versions).join(' ');
    expect(args).toContain('--platform linux/arm64');
    expect(args).toContain('--build-arg BUN_VERSION=1.4.3');
    expect(args).toContain('--build-arg PLAYWRIGHT_VERSION=1.61.1');
    expect(args).toContain(`--tag ${imageTag(versions)}`);
  });

  it('runs as the host user with writable ephemeral modules and cache', () => {
    const args = runArgs(root, versions, owner, []).join(' ');
    expect(args).toContain('--platform linux/arm64');
    expect(args).toContain(`--volume ${root}:/work`);
    expect(args).toContain('--user 501:20');
    expect(args).toContain(
      '--tmpfs /work/node_modules:rw,exec,uid=501,gid=20,mode=0755',
    );
    expect(args).toContain(
      '--tmpfs /tmp/sapphire-bun-cache:rw,exec,uid=501,gid=20,mode=0755',
    );
    expect(args).toContain(
      '--env BUN_INSTALL_CACHE_DIR=/tmp/sapphire-bun-cache',
    );
  });

  it('passes the Playwright arguments through after the script', () => {
    const args = runArgs(root, versions, owner, ['--grep', 'a b']);
    expect(args.slice(-3)).toEqual(['sh', '--grep', 'a b']);
  });

  it('never changes permissions or mounts shared caches', () => {
    const args = runArgs(root, versions, owner, []).join(' ');
    expect(args).not.toMatch(/\b(?:chown|chmod)\b/);
    expect(args).not.toContain('sapphire-visual-modules-');
    expect(args).not.toContain('sapphire-visual-bun-cache');
    expect(args).not.toContain('/root/');
  });
});
