import { createHash } from 'node:crypto';
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const hash = (path: string) =>
  createHash('sha256').update(readFileSync(path)).digest('hex');
const run = (args: string[], cwd: string) => {
  const result = Bun.spawnSync(args, { cwd, stdout: 'pipe', stderr: 'pipe' });
  if (result.exitCode !== 0)
    throw new Error(`${args.join(' ')}: ${result.stderr.toString()}`);
};

function builtCss(app: string) {
  const assets = join(app, 'dist/assets');
  return readdirSync(assets)
    .filter((name) => name.endsWith('.css'))
    .map((name) => readFileSync(join(assets, name), 'utf8'))
    .join('\n');
}

function buildOrder(app: string, css: string, packageFirst: boolean) {
  const packageCss = '@import "@kongmy-dev/sapphire-ui/card.css";';
  const vendorCss = '@import "@/components/ui/button.css";';
  const next = css.replace(
    vendorCss,
    packageFirst
      ? `${packageCss}\n${vendorCss}`
      : `${vendorCss}\n${packageCss}`,
  );
  writeFileSync(join(app, 'src/index.css'), next);
  run(['bunx', 'vite', 'build'], app);
  const built = builtCss(app);
  if (
    !built.includes('--registry-vendor-proof:1') ||
    !built.includes('.sp-card')
  )
    throw new Error('Mixed CSS owners missing');
  if (built.includes('--registry-package-button-proof'))
    throw new Error('Package button CSS replaced vendored ownership');
}

function nextPatch(version: unknown) {
  if (typeof version !== 'string')
    throw new Error('Missing packed package version');
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);
  const major = match?.[1];
  const minor = match?.[2];
  const patch = match?.[3];
  const next = Number(patch) + 1;
  if (!major || !minor || !patch || !Number.isSafeInteger(next))
    throw new Error(
      'Packed package needs a stable version with a safe patch number',
    );
  return `${major}.${minor}.${next}`;
}

export function updateFixture(app: string): string {
  const source = join(app, 'node_modules/@kongmy-dev/sapphire-ui');
  const pkg: unknown = JSON.parse(
    readFileSync(join(source, 'package.json'), 'utf8'),
  );
  if (typeof pkg !== 'object' || pkg === null)
    throw new Error('Invalid packed package');
  const version = nextPatch('version' in pkg ? pkg.version : undefined);
  const directory = mkdtempSync(join(tmpdir(), 'sapphire-compatible-update-'));
  cpSync(source, directory, { recursive: true });
  writeFileSync(
    join(directory, 'package.json'),
    JSON.stringify({ ...pkg, version }),
  );
  const css = join(directory, 'dist/components/button/button.css');
  writeFileSync(
    css,
    `${readFileSync(css, 'utf8')}\n.sp-button { --registry-package-button-proof: 1; }\n`,
  );
  run(
    [
      'bun',
      'pm',
      'pack',
      '--ignore-scripts',
      '--filename',
      join(directory, 'update.tgz'),
    ],
    directory,
  );
  return join(directory, 'update.tgz');
}

export function checkMixedOwnership(app: string) {
  const css = readFileSync(join(app, 'src/index.css'), 'utf8');
  const button = join(app, 'src/components/ui/button.css');
  writeFileSync(
    button,
    `${readFileSync(button, 'utf8')}\n@layer components { .sp-button[data-consumer-custom] { --registry-vendor-proof: 1; padding-inline: var(--space-6); } }\n`,
  );
  const before = hash(button);
  buildOrder(app, css, true);
  buildOrder(app, css, false);
  const update = updateFixture(app);
  const manifestPath = join(app, 'package.json');
  const manifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (typeof manifest !== 'object' || manifest === null)
    throw new Error('Invalid consumer manifest');
  writeFileSync(
    manifestPath,
    JSON.stringify({
      ...manifest,
      overrides: { '@kongmy-dev/sapphire-ui': update },
    }),
  );
  run(
    ['bun', 'add', '--ignore-scripts', `@kongmy-dev/sapphire-ui@${update}`],
    app,
  );
  if (hash(button) !== before)
    throw new Error('Package update overwrote vendored customization');
  run(['bunx', 'tsc', '--noEmit'], app);
  buildOrder(app, css, true);
  buildOrder(app, css, false);
  console.log(
    'registry smoke: both CSS orders and compatible package fixture preserve vendored customization',
  );
}
