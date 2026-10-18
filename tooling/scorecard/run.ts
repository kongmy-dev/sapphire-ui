import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FileText } from '../gates/scope';
import { isSpecimenFile } from '../visual/specimens';
import {
  type ComponentRow,
  componentTable,
  REGISTRY_SOURCE,
  referencePinCount,
  type Specimens,
} from './components';
import {
  firstErrorLine,
  gzippedBytes,
  isMeasuredFile,
  mainStylesheet,
  measureTree,
  type PackageFields,
  readPackage,
  regularFilePaths,
  type Stylesheet,
  unmeasured,
} from './measure';
import { renderScorecard, type Scorecard } from './render';

export type Args =
  | { ok: true; revision: string }
  | { ok: false; usage: string };

type Step = { ok: boolean; output: string };

type Install = { ok: boolean; notes: string[]; reason: string };

const USAGE = 'usage: bun run scorecard [commit]';
const MAX_BUFFER_BYTES = 256 * 1024 * 1024;

export function parseArgs(argv: readonly string[]): Args {
  if (argv.length > 1 || argv[0]?.startsWith('-')) {
    return { ok: false, usage: USAGE };
  }
  return { ok: true, revision: argv[0] ?? 'HEAD' };
}

function step(cwd: string, command: string, args: readonly string[]): Step {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER_BYTES,
  });
  const output = `${result.stdout}${result.stderr}${result.error?.message ?? ''}`;
  return { ok: result.status === 0, output };
}

const git = (cwd: string, args: readonly string[]): string =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER_BYTES,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

const readText = (tree: string, path: string) =>
  readFileSync(join(tree, path), 'utf8');

function install(tree: string): Install {
  const frozen = step(tree, 'bun', [
    'install',
    '--frozen-lockfile',
    '--ignore-scripts',
  ]);
  if (frozen.ok) return { ok: true, notes: [], reason: '' };
  const loose = step(tree, 'bun', ['install', '--ignore-scripts']);
  return {
    ok: loose.ok,
    notes: loose.ok
      ? ['lockfile is stale: installed without --frozen-lockfile']
      : [],
    reason: firstErrorLine(loose.output),
  };
}

function measureStylesheet(
  tree: string,
  pkg: PackageFields,
  installed: Install,
): Stylesheet {
  if (!installed.ok) return unmeasured(`install failed: ${installed.reason}`);
  if (pkg.scripts.build === undefined)
    return unmeasured('package.json has no build script');
  const target = mainStylesheet(pkg);
  if (target === null)
    return unmeasured('package.json exports no main stylesheet');
  const built = step(tree, 'bun', ['run', 'build']);
  if (!built.ok)
    return unmeasured(`build failed: ${firstErrorLine(built.output)}`);
  const path = join(tree, target);
  if (!existsSync(path)) return unmeasured(`build wrote no ${target}`);
  return { kind: 'measured', bytes: gzippedBytes(readFileSync(path)) };
}

function loadPackage(tree: string): PackageFields {
  const pkg = readPackage(readText(tree, 'package.json'));
  if (pkg === null) throw new Error('package.json is not a JSON object');
  return pkg;
}

const readSpecimens = (tree: string, paths: readonly string[]): Specimens =>
  new Map(
    paths
      .filter(isSpecimenFile)
      .map((path): [string, string] => [path, readText(tree, path)]),
  );

function componentRows(
  tree: string,
  paths: readonly string[],
  specimens: Specimens,
) {
  const registryText = paths.includes(REGISTRY_SOURCE)
    ? readText(tree, REGISTRY_SOURCE)
    : null;
  return componentTable(paths, registryText, specimens);
}

function scorecardFor(
  tree: string,
  commit: string,
  subject: string,
): Scorecard {
  const paths = regularFilePaths(git(tree, ['ls-files', '-s', '-z']));
  const files: FileText[] = paths
    .filter(isMeasuredFile)
    .map((name) => ({ name, text: readText(tree, name) }));
  const pkg = loadPackage(tree);
  const specimens = readSpecimens(tree, paths);
  const rows: ComponentRow[] = componentRows(tree, paths, specimens);
  const installed = install(tree);
  return {
    commit,
    subject,
    notes: installed.notes,
    measurement: measureTree(files, pkg),
    stylesheet: measureStylesheet(tree, pkg, installed),
    rows,
    referencePins: referencePinCount(paths, specimens),
  };
}

function removeWorktree(repo: string, scratch: string, tree: string) {
  if (existsSync(tree)) git(repo, ['worktree', 'remove', '--force', tree]);
  rmSync(scratch, { recursive: true, force: true });
  git(repo, ['worktree', 'prune']);
}

function resolveCommit(repo: string, revision: string): string | null {
  try {
    return git(repo, ['rev-parse', '--verify', `${revision}^{commit}`]).trim();
  } catch {
    return null;
  }
}

function measureCommit(repo: string, sha: string): Scorecard {
  const scratch = mkdtempSync(join(tmpdir(), 'sapphire-scorecard-'));
  const tree = join(scratch, 'tree');
  const cleanup = () => removeWorktree(repo, scratch, tree);
  process.once('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  try {
    git(repo, ['worktree', 'add', '--detach', tree, sha]);
    const subject = git(repo, ['log', '-1', '--format=%s', sha]).trim();
    return scorecardFor(tree, sha.slice(0, 7), subject);
  } finally {
    cleanup();
  }
}

function main(argv: readonly string[]) {
  const args = parseArgs(argv);
  if (!args.ok) {
    console.error(args.usage);
    process.exit(1);
  }
  const repo = process.cwd();
  const sha = resolveCommit(repo, args.revision);
  if (sha === null) {
    console.error(`scorecard: ${args.revision} is not a commit`);
    process.exit(1);
  }
  console.log(renderScorecard(measureCommit(repo, sha)));
}

if (import.meta.main) main(process.argv.slice(2));
