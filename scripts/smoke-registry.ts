#!/usr/bin/env bun
/**
 * True-CLI registry smoke test (REGISTRY-PLAN R.4 / acceptance criterion 1).
 *
 * Unlike verify-consumer.ts (which materializes item files itself), this drives
 * the REAL `shadcn` CLI end-to-end in a scratch app — the only test that
 * exercises the CLI's registry + dependency resolution. It exists because bare
 * registryDependency names passed every local gate while breaking every real
 * `shadcn add` (the CLI resolves bare names against ui.shadcn.com).
 *
 * Modes:
 *   default            — builds the registry to a temp dir, serves it on
 *                         localhost, and adds from there (pre-deploy gate, CI).
 *   REGISTRY_URL=<url> — adds from a deployed registry instead, e.g.
 *                         REGISTRY_URL='https://design.kongmy.dev/r/{name}.json'
 *                         (post-deploy verification).
 *
 * Adds theme + button + sidebar (the deepest registryDependencies chain) and
 * asserts every expected file, including transitive deps, was vendored.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function fail(msg: string): never {
  console.error(`smoke: FAIL — ${msg}`);
  process.exit(1);
}

// The server must be a SEPARATE process: this script drives the shadcn CLI via
// Bun.spawnSync, which blocks the event loop — an in-process Bun.serve could
// never answer the CLI's registry fetches (parent and child would deadlock).
const SERVER_SOURCE = `
const dir = process.argv[2];
const server = Bun.serve({
  port: Number(process.argv[3]),
  async fetch(req) {
    const m = new URL(req.url).pathname.match(/^\\/r\\/([a-z0-9-]+\\.json)$/);
    const file = m ? Bun.file(dir + '/' + m[1]) : null;
    if (!file || !(await file.exists())) {
      return new Response('not found', { status: 404 });
    }
    return new Response(file, {
      headers: { 'content-type': 'application/json' },
    });
  },
});
console.log('ready on ' + server.port);
`;

/** Build the registry to a temp dir and serve it at http://127.0.0.1:<port>/r/. */
async function serveLocalRegistry(): Promise<{
  urlTemplate: string;
  base: string;
  stop: () => void;
}> {
  const out = mkdtempSync(join(tmpdir(), 'sapphire-smoke-registry-'));
  const port = 40000 + Math.floor(Math.random() * 20000);
  const base = `http://127.0.0.1:${port}`;

  const build = Bun.spawnSync(['bun', 'scripts/build-registry.ts'], {
    env: { ...process.env, REGISTRY_OUT: out, REGISTRY_HOMEPAGE: base },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (build.exitCode !== 0) {
    console.error(build.stderr.toString());
    fail('build-registry failed');
  }

  const serverFile = join(out, '_serve.ts');
  writeFileSync(serverFile, SERVER_SOURCE);
  const server = Bun.spawn(['bun', serverFile, out, String(port)], {
    stdout: 'ignore',
    stderr: 'ignore',
  });
  // wait until the child answers before handing the URL to the CLI
  let ready = false;
  for (let i = 0; i < 50 && !ready; i++) {
    try {
      ready = (await fetch(`${base}/r/registry.json`)).ok;
    } catch {
      await Bun.sleep(100);
    }
  }
  if (!ready) {
    server.kill();
    fail(`local registry server did not become ready on ${base}`);
  }
  console.log(`smoke: serving built registry at ${base}/r/`);
  return {
    urlTemplate: `${base}/r/{name}.json`,
    base,
    stop: () => server.kill(),
  };
}

/** Minimal Tailwind v4 + TS app, set up exactly as the README instructs. */
function scaffoldConsumer(urlTemplate: string): string {
  const app = mkdtempSync(join(tmpdir(), 'sapphire-smoke-app-'));
  mkdirSync(join(app, 'src'));
  // Synchronous on purpose: Bun.write is async, and the spawnSync calls below
  // block the event loop — an unawaited write may not be on disk when the
  // shadcn CLI reads it (no components.json → interactive init → silent no-op).
  const write = (name: string, data: unknown) =>
    writeFileSync(
      join(app, name),
      typeof data === 'string' ? data : `${JSON.stringify(data, null, 2)}\n`,
    );
  // A real Tailwind v4 + Vite app (the README's stated requirement): without
  // Tailwind/a framework present, the shadcn CLI's preflight prompts — which
  // hangs or no-ops the add instead of vendoring files.
  write('package.json', {
    name: 'sapphire-smoke-consumer',
    private: true,
    type: 'module',
    dependencies: {
      react: '^19.2.0',
      'react-dom': '^19.2.0',
      tailwindcss: '^4.1.0',
      '@tailwindcss/vite': '^4.1.0',
      vite: '^7.0.0',
    },
    devDependencies: {
      typescript: '^5.9.0',
      '@types/react': '^19.2.0',
      '@types/react-dom': '^19.2.0',
    },
  });
  write(
    'vite.config.ts',
    [
      "import tailwindcss from '@tailwindcss/vite';",
      "import { defineConfig } from 'vite';",
      'export default defineConfig({ plugins: [tailwindcss()] });',
      '',
    ].join('\n'),
  );
  write('tsconfig.json', {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      baseUrl: '.',
      paths: { '@/*': ['./src/*'] },
    },
    include: ['src'],
  });
  write('src/index.css', "@import 'tailwindcss';\n");
  write('components.json', {
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'new-york',
    rsc: false,
    tsx: true,
    tailwind: {
      config: '',
      css: 'src/index.css',
      baseColor: 'neutral',
      cssVariables: true,
    },
    aliases: {
      components: '@/components',
      ui: '@/components/ui',
      utils: '@/lib/utils',
      lib: '@/lib',
      hooks: '@/hooks',
    },
    registries: { '@sapphire': urlTemplate },
  });
  const install = Bun.spawnSync(['bun', 'install', '--silent'], {
    cwd: app,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (install.exitCode !== 0) {
    console.error(install.stderr.toString());
    fail('consumer bun install failed');
  }
  return app;
}

async function main() {
  const { urlTemplate, base, stop } = process.env.REGISTRY_URL
    ? {
        urlTemplate: process.env.REGISTRY_URL,
        base: process.env.REGISTRY_URL.replace(/\/r\/\{name\}\.json$/, ''),
        stop: () => {},
      }
    : await serveLocalRegistry();

  const app = scaffoldConsumer(urlTemplate);
  const items = ['@sapphire/theme', '@sapphire/button', '@sapphire/sidebar'];
  console.log(`smoke: bunx shadcn add ${items.join(' ')}`);
  // stdin ignored + hard timeout: an unexpected CLI prompt must fail loudly
  // (with captured output), never hang the gate.
  const add = Bun.spawnSync(
    ['bunx', '--bun', 'shadcn@latest', 'add', ...items, '--yes', '--overwrite'],
    {
      cwd: app,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: 180_000,
    },
  );
  if (add.exitCode !== 0) {
    console.error(add.stdout.toString());
    console.error(add.stderr.toString());
    fail('shadcn add failed (or timed out after 180s)');
  }

  // theme + button + sidebar, plus sidebar's transitive registryDependencies.
  const expected = [
    'src/styles/sapphire-theme.css',
    'src/components/ui/button.tsx',
    'src/components/ui/sidebar.tsx',
    'src/components/ui/input.tsx',
    'src/components/ui/separator.tsx',
    'src/components/ui/sheet.tsx',
    'src/components/ui/skeleton.tsx',
    'src/components/ui/tooltip.tsx',
  ];
  const missing = expected.filter((f) => !existsSync(join(app, f)));
  if (missing.length > 0) {
    console.error(add.stdout.toString());
    console.error(add.stderr.toString());
    const tree = Bun.spawnSync(
      ['find', app, '-type', 'f', '-not', '-path', '*/node_modules/*'],
      { stdout: 'pipe' },
    );
    console.error(`app tree:\n${tree.stdout.toString()}`);
    fail(`missing vendored files: ${missing.join(', ')}`);
  }

  // Vendored source must be Sapphire's, not a same-named shadcn item's.
  const button = readFileSync(
    join(app, 'src/components/ui/button.tsx'),
    'utf8',
  );
  if (!button.includes('rounded-btn')) {
    fail('vendored button.tsx is not the Sapphire item (no rounded-btn)');
  }

  // Informational: a missing item should not 200 as HTML (SPA fallback).
  const bogus = await fetch(`${base}/r/definitely-not-an-item.json`);
  if (bogus.ok && (bogus.headers.get('content-type') ?? '').includes('html')) {
    console.warn(
      'smoke: WARN — missing /r/* items return the SPA index.html (typos will surface as JSON parse errors, not 404s)',
    );
  }
  stop();

  console.log(
    `smoke: OK — real shadcn add vendored ${expected.length} files (incl. transitive deps) from ${base}`,
  );
  process.exit(0);
}

await main();
