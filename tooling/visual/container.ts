import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PLATFORM = 'linux/arm64';
export const CONTAINER_ROOT = '/work';

const DOCKERFILE = 'tooling/visual/Dockerfile';
const EXACT_VERSION = /^\d+\.\d+\.\d+$/;
const BUN_CACHE_DIR = `${CONTAINER_ROOT}/node_modules/.cache/bun`;

const CONTAINER_SCRIPT = [
  'set -eu',
  'bun install --frozen-lockfile --ignore-scripts',
  'bunx playwright test -c playwright.visual.config.ts "$@"',
].join('\n');

export type Versions = { bun: string; playwright: string };
type Owner = { readonly uid: number; readonly gid: number };

export function readVersions(
  bunVersionText: string,
  packageText: string,
): Versions | null {
  const bun = bunVersionText.trim();
  const parsed: unknown = JSON.parse(packageText);
  const dev =
    typeof parsed === 'object' && parsed !== null && 'devDependencies' in parsed
      ? parsed.devDependencies
      : null;
  const playwright =
    typeof dev === 'object' && dev !== null && '@playwright/test' in dev
      ? dev['@playwright/test']
      : null;
  if (typeof playwright !== 'string') return null;
  const isPinned = EXACT_VERSION.test(bun) && EXACT_VERSION.test(playwright);
  return isPinned ? { bun, playwright } : null;
}

export const imageTag = (versions: Versions, owner: Owner) =>
  `sapphire-visual-owned-v1:playwright-${versions.playwright}-bun-${versions.bun}-uid-${owner.uid}-gid-${owner.gid}`;

export const buildArgs = (versions: Versions, owner: Owner): string[] => [
  'build',
  '--quiet',
  '--platform',
  PLATFORM,
  '--build-arg',
  `BUN_VERSION=${versions.bun}`,
  '--build-arg',
  `PLAYWRIGHT_VERSION=${versions.playwright}`,
  '--build-arg',
  `HOST_UID=${owner.uid}`,
  '--build-arg',
  `HOST_GID=${owner.gid}`,
  '--tag',
  imageTag(versions, owner),
  '--file',
  DOCKERFILE,
  'tooling/visual',
];

export const runArgs = (
  root: string,
  versions: Versions,
  owner: Owner,
  playwrightArgs: readonly string[],
): string[] => [
  'run',
  '--rm',
  '--init',
  '--ipc=host',
  '--platform',
  PLATFORM,
  '--user',
  `${owner.uid}:${owner.gid}`,
  '--env',
  `BUN_INSTALL_CACHE_DIR=${BUN_CACHE_DIR}`,
  '--volume',
  `${root}:${CONTAINER_ROOT}`,
  '--volume',
  `sapphire-visual-owned-v1-${createHash('sha256')
    .update(`${root}:${imageTag(versions, owner)}`)
    .digest('hex')
    .slice(0, 24)}:${CONTAINER_ROOT}/node_modules`,
  '--tmpfs',
  '/tmp:rw,exec,mode=1777',
  '--workdir',
  CONTAINER_ROOT,
  imageTag(versions, owner),
  'sh',
  '-c',
  CONTAINER_SCRIPT,
  'sh',
  ...playwrightArgs,
];

const docker = (args: readonly string[]) =>
  spawnSync('docker', args, { stdio: 'inherit' }).status ?? 1;

export function runInContainer(playwrightArgs: readonly string[]): number {
  const root = process.cwd();
  const versions = readVersions(
    readFileSync(join(root, '.bun-version'), 'utf8'),
    readFileSync(join(root, 'package.json'), 'utf8'),
  );
  if (versions === null) {
    console.error('.bun-version and @playwright/test must be exact versions');
    return 1;
  }
  const owner = { uid: process.getuid?.() ?? 0, gid: process.getgid?.() ?? 0 };
  const built = docker(buildArgs(versions, owner));
  if (built !== 0) return built;
  return docker(runArgs(root, versions, owner, playwrightArgs));
}
