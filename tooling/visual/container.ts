import { spawnSync } from 'node:child_process';
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

export const imageTag = (versions: Versions) =>
  `sapphire-visual:playwright-${versions.playwright}-bun-${versions.bun}`;

export const buildArgs = (versions: Versions): string[] => [
  'build',
  '--quiet',
  '--platform',
  PLATFORM,
  '--build-arg',
  `BUN_VERSION=${versions.bun}`,
  '--build-arg',
  `PLAYWRIGHT_VERSION=${versions.playwright}`,
  '--tag',
  imageTag(versions),
  '--file',
  DOCKERFILE,
  'tooling/visual',
];

export const runArgs = (
  root: string,
  versions: Versions,
  owner: { uid: number; gid: number },
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
  '--tmpfs',
  `${CONTAINER_ROOT}/node_modules:rw,exec,uid=${owner.uid},gid=${owner.gid},mode=0755`,
  '--tmpfs',
  '/tmp:rw,exec,mode=1777',
  '--workdir',
  CONTAINER_ROOT,
  imageTag(versions),
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
  const built = docker(buildArgs(versions));
  if (built !== 0) return built;
  const owner = { uid: process.getuid?.() ?? 0, gid: process.getgid?.() ?? 0 };
  return docker(runArgs(root, versions, owner, playwrightArgs));
}
