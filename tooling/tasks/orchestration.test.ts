import { afterEach, expect, it } from 'bun:test';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import manifest from '../../package.json';
import config from '../../turbo.json';

const roots: string[] = [];
const turbo = resolve('node_modules/.bin/turbo');
const runner = `
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
const task = process.argv[2];
appendFileSync('.runs', task + '\\n');
const source = readFileSync('input.ts', 'utf8');
const registry = (process.env.REGISTRY_V4_OUT ?? 'dist-docs/r/v4') + '/registry.json';
const artifacts = { test: 'coverage/lcov.info', 'build:registry': registry };
if (task === 'test' && existsSync('fail-test')) process.exit(1);
if (task === 'comment-check') {
  const paths = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).trim().split('\\n');
  if (paths.some(path => path.endsWith('.ts') && readFileSync(path, 'utf8').includes('VIOLATION'))) process.exit(1);
}
const artifact = artifacts[task];
if (artifact) {
  mkdirSync(dirname(artifact), { recursive: true });
  writeFileSync(artifact, source);
}
const reports = { 'coverage-check': 'coverage/lcov.info', 'check:registry:v4': registry };
const report = reports[task];
if (report && readFileSync(report, 'utf8') !== source) process.exit(1);
`;

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function write(root: string, file: string, text: string) {
  const path = join(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

function git(root: string, args: string[]) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
    },
  });
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'sapphire-tasks-'));
  roots.push(root);
  git(root, ['init', '--quiet']);
  write(root, '.gitignore', '.turbo/\ncoverage/\ndist-docs/\n.runs\n');
  write(root, '.bun-version', manifest.packageManager.slice(4));
  write(root, 'turbo.json', JSON.stringify(config));
  write(root, 'input.ts', 'export const value = 1;\n');
  write(root, 'fixture.mjs', runner);
  write(
    root,
    'package.json',
    JSON.stringify({
      name: 'sapphire-task-fixture',
      packageManager: manifest.packageManager,
      scripts: Object.fromEntries(
        Object.keys(config.tasks).map((task) => [
          task,
          `bun fixture.mjs ${task}`,
        ]),
      ),
    }),
  );
  write(
    root,
    'bun.lock',
    JSON.stringify({
      lockfileVersion: 1,
      configVersion: 1,
      workspaces: { '': { name: 'sapphire-task-fixture' } },
      packages: {},
    }),
  );
  git(root, [
    'add',
    '.gitignore',
    '.bun-version',
    'turbo.json',
    'input.ts',
    'fixture.mjs',
    'package.json',
    'bun.lock',
  ]);
  return root;
}

function run(root: string, tasks: string[], env = process.env) {
  return Bun.spawnSync([turbo, 'run', ...tasks, '--output-logs=errors-only'], {
    cwd: root,
    env,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 15000,
  });
}

const runs = (root: string, task: string) =>
  readFileSync(join(root, '.runs'), 'utf8')
    .split('\n')
    .filter((line) => line === task).length;

it('restores missing coverage on a cache hit and invalidates changed or added inputs', () => {
  const root = fixture();
  expect(run(root, ['coverage-check']).exitCode).toBe(0);
  rmSync(join(root, 'coverage'), { recursive: true });
  expect(run(root, ['coverage-check']).exitCode).toBe(0);
  expect(runs(root, 'test')).toBe(1);
  expect(runs(root, 'coverage-check')).toBe(2);
  expect(readFileSync(join(root, 'coverage/lcov.info'), 'utf8')).toContain('1');
  write(root, 'input.ts', 'export const value = 2;\n');
  expect(run(root, ['coverage-check']).exitCode).toBe(0);
  expect(runs(root, 'test')).toBe(2);
  write(root, 'new.ts', 'export const added = true;\n');
  expect(run(root, ['coverage-check']).exitCode).toBe(0);
  expect(runs(root, 'test')).toBe(3);
  expect(run(root, ['coverage-check', '--force']).exitCode).toBe(0);
  expect(runs(root, 'test')).toBe(4);
  rmSync(join(root, 'input.ts'));
  expect(run(root, ['coverage-check']).exitCode).not.toBe(0);
  expect(runs(root, 'test')).toBe(5);
  expect(runs(root, 'coverage-check')).toBe(5);
}, 20000);

it('invalidates cached tests when toolchain pins, lockfiles or declared environment change', () => {
  const root = fixture();
  expect(run(root, ['test']).exitCode).toBe(0);
  write(root, '.bun-version', '1.4.4\n');
  expect(run(root, ['test']).exitCode).toBe(0);
  expect(runs(root, 'test')).toBe(2);
  write(root, 'bun.lock', `${readFileSync(join(root, 'bun.lock'), 'utf8')}\n`);
  expect(run(root, ['test']).exitCode).toBe(0);
  expect(runs(root, 'test')).toBe(3);
  expect(
    run(root, ['test'], { ...process.env, TZ: 'Pacific/Honolulu' }).exitCode,
  ).toBe(0);
  expect(runs(root, 'test')).toBe(4);
}, 20000);

it('does not run coverage against a stale report when tests fail or cache a failed test', () => {
  const root = fixture();
  write(root, 'coverage/lcov.info', 'stale report');
  write(root, 'fail-test', 'fail');
  expect(run(root, ['coverage-check']).exitCode).not.toBe(0);
  expect(runs(root, 'coverage-check')).toBe(0);
  expect(run(root, ['coverage-check']).exitCode).not.toBe(0);
  expect(runs(root, 'test')).toBe(2);
  rmSync(join(root, 'fail-test'));
  expect(run(root, ['coverage-check']).exitCode).toBe(0);
  expect(runs(root, 'coverage-check')).toBe(1);
});

it('rechecks Git-dependent scope after staging without changing file content', () => {
  const root = fixture();
  write(root, 'new.ts', 'VIOLATION\n');
  const tasks = [
    'api-check',
    'boundary-check',
    'comment-check',
    'contract-check',
    'docs-check',
    'size-check',
    'skill-refs-check',
    'token-check',
  ];
  expect(run(root, tasks).exitCode).toBe(0);
  git(root, ['add', 'new.ts']);
  expect(run(root, ['comment-check']).exitCode).not.toBe(0);
  expect(runs(root, 'comment-check')).toBe(2);
  const otherChecks = tasks.filter((task) => task !== 'comment-check');
  expect(run(root, otherChecks).exitCode).toBe(0);
  for (const task of otherChecks) expect(runs(root, task)).toBe(2);
});

it('builds the registry before checking a missing or caller-selected output', () => {
  const root = fixture();
  expect(existsSync(join(root, 'dist-docs'))).toBe(false);
  expect(run(root, ['check:registry:v4']).exitCode).toBe(0);
  const env = { ...process.env, REGISTRY_V4_OUT: 'coverage/custom-registry' };
  expect(run(root, ['check:registry:v4'], env).exitCode).toBe(0);
  expect(existsSync(join(root, 'coverage/custom-registry/registry.json'))).toBe(
    true,
  );
  expect(runs(root, 'build:registry')).toBe(2);
});

it('keeps every integrated check reachable from the public gate command', () => {
  const root = fixture();
  const args = manifest.scripts.gate.split(' ').slice(2);
  expect(run(root, args).exitCode).toBe(0);
  for (const task of [
    'lint',
    'typecheck',
    'knip',
    'comment-check',
    'size-check',
    'dep-check',
    'token-check',
    'budget-check',
    'generated-check',
    'api-check',
    'boundary-check',
    'contract-check',
    'docs-check',
    'skill-refs-check',
    'test',
    'coverage-check',
    'build:registry',
    'check:registry:v4',
  ])
    expect(runs(root, task)).toBe(1);
});
