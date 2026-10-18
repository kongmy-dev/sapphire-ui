#!/usr/bin/env bun
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  registryItemHeaderProblems,
  shadcnCliEnv,
} from './registry-smoke-checks';

type Registry = {
  readonly urlTemplate: string;
  readonly base: string;
  readonly isDeployed: boolean;
  readonly stop: () => void;
};

const cliTimeoutMs = 180_000;
const itemsToAdd = ['@sapphire/theme', '@sapphire/button', '@sapphire/sidebar'];
const expectedVendoredFiles = [
  'src/styles/sapphire-theme.css',
  'src/components/ui/button.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/separator.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/ui/tooltip.tsx',
];

function fail(msg: string): never {
  console.error(`smoke: FAIL — ${msg}`);
  process.exit(1);
}

const childProcessServerSource = `
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

async function isServing(base: string): Promise<boolean> {
  try {
    return (await fetch(`${base}/r/registry.json`)).ok;
  } catch {
    return false;
  }
}

async function waitUntilServing(base: string): Promise<boolean> {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await isServing(base)) return true;
    await Bun.sleep(100);
  }
  return false;
}

async function serveLocalRegistry(): Promise<Registry> {
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
  writeFileSync(serverFile, childProcessServerSource);
  const server = Bun.spawn(['bun', serverFile, out, String(port)], {
    stdout: 'ignore',
    stderr: 'ignore',
  });
  if (!(await waitUntilServing(base))) {
    server.kill();
    fail(`local registry server did not become ready on ${base}`);
  }
  console.log(`smoke: serving built registry at ${base}/r/`);
  return {
    urlTemplate: `${base}/r/{name}.json`,
    base,
    isDeployed: false,
    stop: () => server.kill(),
  };
}

function deployedRegistry(urlTemplate: string): Registry {
  return {
    urlTemplate,
    base: urlTemplate.replace(/\/r\/\{name\}\.json$/, ''),
    isDeployed: true,
    stop: () => {},
  };
}

function writeConsumerFiles(app: string, urlTemplate: string): void {
  const writeBeforeSpawn = (name: string, data: unknown) =>
    writeFileSync(
      join(app, name),
      typeof data === 'string' ? data : `${JSON.stringify(data, null, 2)}\n`,
    );
  writeBeforeSpawn('package.json', {
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
  writeBeforeSpawn(
    'vite.config.ts',
    [
      "import tailwindcss from '@tailwindcss/vite';",
      "import { defineConfig } from 'vite';",
      'export default defineConfig({ plugins: [tailwindcss()] });',
      '',
    ].join('\n'),
  );
  writeBeforeSpawn('tsconfig.json', {
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
  writeBeforeSpawn('src/index.css', "@import 'tailwindcss';\n");
  writeBeforeSpawn('components.json', {
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
}

function scaffoldTailwindViteConsumer(urlTemplate: string): string {
  const app = mkdtempSync(join(tmpdir(), 'sapphire-smoke-app-'));
  mkdirSync(join(app, 'src'));
  writeConsumerFiles(app, urlTemplate);
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

function addItems(app: string): string {
  console.log(`smoke: bunx shadcn add ${itemsToAdd.join(' ')}`);
  const add = Bun.spawnSync(
    [
      'bunx',
      '--bun',
      'shadcn@latest',
      'add',
      ...itemsToAdd,
      '--yes',
      '--overwrite',
    ],
    {
      cwd: app,
      env: shadcnCliEnv(process.env),
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: cliTimeoutMs,
    },
  );
  const output = `${add.stdout.toString()}\n${add.stderr.toString()}`;
  if (add.exitCode !== 0) {
    console.error(output);
    fail(
      `shadcn add failed, timed out after ${cliTimeoutMs} ms, or stopped at a prompt it could not answer`,
    );
  }
  return output;
}

function assertVendored(app: string, cliOutput: string): void {
  const missing = expectedVendoredFiles.filter(
    (f) => !existsSync(join(app, f)),
  );
  if (missing.length > 0) {
    console.error(cliOutput);
    const tree = Bun.spawnSync(
      ['find', app, '-type', 'f', '-not', '-path', '*/node_modules/*'],
      { stdout: 'pipe' },
    );
    console.error(`app tree:\n${tree.stdout.toString()}`);
    fail(`missing vendored files: ${missing.join(', ')}`);
  }
  const button = readFileSync(
    join(app, 'src/components/ui/button.tsx'),
    'utf8',
  );
  if (!button.includes('rounded-btn')) {
    fail('vendored button.tsx is not the Sapphire item (no rounded-btn)');
  }
}

async function assertRegistryResponses(registry: Registry): Promise<void> {
  const missing = await fetch(`${registry.base}/r/definitely-not-an-item.json`);
  if (missing.status !== 404) {
    fail(
      `a missing /r/* item answered ${missing.status} instead of 404: the shadcn CLI probes speculative URLs such as colors/<baseColor>.json and dies parsing an HTML fallback (is worker/registry-404.ts active?)`,
    );
  }
  if (!registry.isDeployed) return;
  const item = await fetch(`${registry.base}/r/button.json`);
  const problems = registryItemHeaderProblems(item.headers);
  if (problems.length > 0) {
    fail(`/r/button.json headers:\n  ${problems.join('\n  ')}`);
  }
}

async function main() {
  const deployedUrl = process.env.SAPPHIRE_REGISTRY_URL;
  const registry = deployedUrl
    ? deployedRegistry(deployedUrl)
    : await serveLocalRegistry();

  const app = scaffoldTailwindViteConsumer(registry.urlTemplate);
  const cliOutput = addItems(app);
  assertVendored(app, cliOutput);
  await assertRegistryResponses(registry);
  registry.stop();

  console.log(
    `smoke: OK — real shadcn add vendored ${expectedVendoredFiles.length} files (incl. transitive deps) from ${registry.base}`,
  );
  process.exit(0);
}

await main();
