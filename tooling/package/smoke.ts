import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPackage } from './build.js';
import {
  consumerCommand,
  installConsumer,
  packPackage,
  requireNoPeers,
  runConsumer,
} from './consumer.js';
import { packageEntries, packageSources } from './entries.js';

const NAME = '@kongmy-dev/sapphire-ui';
const PEERS = ['react', 'react-dom', 'radix-ui', 'react-resizable-panels'];

async function cssOnly(root: string, scratch: string, tarball: string) {
  const cwd = await installConsumer({ scratch, tarball, name: 'css-only' });
  requireNoPeers(cwd, PEERS);
  writeFileSync(
    join(cwd, 'app.css'),
    `@import '${NAME}/foundations.css';\n@import '${NAME}/button.css';`,
  );
  const css = await Bun.build({
    entrypoints: [join(cwd, 'app.css')],
    outdir: join(cwd, 'build'),
  });
  if (!css.success)
    throw new Error(css.logs.map((log) => log.message).join('\n'));
  const foundation = readFileSync(
    join(cwd, 'node_modules', NAME, 'dist/foundations.css'),
    'utf8',
  );
  if (foundation.includes('.sp-button'))
    throw new Error('Foundations includes component styles');
  const elements = Object.keys(packageEntries(root)).filter((key) =>
    key.startsWith('./elements/'),
  );
  if (elements.length !== 6)
    throw new Error(`Expected six native entries, found ${elements.length}`);
  await runConsumer(
    cwd,
    `for (const key of ${JSON.stringify(elements)}) { const module = await import('${NAME}/' + key.slice(2)); if (Object.values(module).some(value => value !== undefined)) throw new Error('Server element constructor must be undefined'); } const { generateSEOTags } = await import('${NAME}/seo-tags'); if (!generateSEOTags({title:'Smoke'}).includes('Smoke')) throw new Error('Missing metadata');`,
  );
  return cwd;
}

async function exportBoundaries(root: string, cwd: string) {
  const publicKeys = Object.keys(packageEntries(root));
  const blocked = packageSources(root)
    .flatMap((file) => {
      const stem = file.replace(/\.tsx?$/, '');
      return [`./dist/${stem}.js`, `./${stem}`, `./${stem}.js`];
    })
    .filter((key) => !publicKeys.includes(key.replace(/\.js$/, '')));
  await runConsumer(
    cwd,
    `for (const key of ${JSON.stringify(publicKeys)}) import.meta.resolve('${NAME}/'+key.slice(2)); for (const key of ${JSON.stringify(blocked)}) { let denied = false; try { import.meta.resolve('${NAME}/'+key.slice(2)); } catch { denied = true; } if (!denied) throw new Error('Internal path leaked: '+key); } for (const key of ['', '/button/button', '/button.examples', '/button.test', '/elements/banner/private']) { let denied = false; try { import.meta.resolve('${NAME}'+key); } catch { denied=true; } if (!denied) throw new Error('Unintended path leaked: '+key); }`,
  );
}

async function elementSideEffects(root: string, cwd: string) {
  const entries = Object.keys(packageEntries(root)).filter((key) =>
    key.startsWith('./elements/'),
  );
  const source = entries
    .map((key) => `import '${NAME}/${key.slice(2)}';`)
    .join('\n');
  const entry = join(cwd, 'elements.js');
  writeFileSync(entry, source);
  const result = await Bun.build({ entrypoints: [entry], target: 'browser' });
  if (!result.success)
    throw new Error(result.logs.map((log) => log.message).join('\n'));
  const output = (await result.outputs[0]?.text()) ?? '';
  for (const key of entries) {
    const name = key.slice('./elements/'.length);
    const tag = name === 'cookie-banner' ? name : `sapphire-${name}`;
    if (
      !new RegExp(`customElements\\.define\\(\\s*["']${tag}["']`).test(output)
    )
      throw new Error(`Side-effect registration removed: ${tag}`);
  }
}

async function reactWithoutRadix(scratch: string, tarball: string) {
  const cwd = await installConsumer({
    scratch,
    tarball,
    name: 'react-without-radix',
    dependencies: { react: '19.2.7', 'react-dom': '19.2.7' },
  });
  requireNoPeers(cwd, ['radix-ui', 'react-resizable-panels']);
  await runConsumer(
    cwd,
    `import {createElement} from 'react'; import {renderToString} from 'react-dom/server'; for (const name of ['button','card','badge','alert']) { const module = await import('${NAME}/'+name); const component = module[name[0].toUpperCase()+name.slice(1)]; if (!renderToString(createElement(component,null,'Smoke')).includes('Smoke')) throw new Error('SSR failed: '+name); }`,
  );
}

async function dialogBuild(root: string, scratch: string, tarball: string) {
  const cwd = await installConsumer({
    scratch,
    tarball,
    name: 'dialog-app',
    dependencies: {
      react: '19.2.7',
      'react-dom': '19.2.7',
      'radix-ui': '1.8.1',
      '@types/react': '19.3.0',
      '@types/react-dom': '19.3.0',
    },
  });
  writeFileSync(
    join(cwd, 'app.jsx'),
    `import {createRoot} from 'react-dom/client'; import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription} from '${NAME}/dialog'; import '${NAME}/foundations.css'; import '${NAME}/dialog.css'; createRoot(document.getElementById('root')).render(<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogTitle>Title</DialogTitle><DialogDescription>Description</DialogDescription></DialogContent></Dialog>);`,
  );
  const result = await Bun.build({
    entrypoints: [join(cwd, 'app.jsx')],
    outdir: join(cwd, 'build'),
    target: 'browser',
  });
  if (!result.success)
    throw new Error(result.logs.map((log) => log.message).join('\n'));
  writeFileSync(
    join(cwd, 'typed.tsx'),
    `import { Button } from '${NAME}/button'; import { Dialog } from '${NAME}/dialog'; import type { BannerElement } from '${NAME}/elements/banner'; const element: BannerElement | undefined = undefined; export const page = <Dialog><Button>Open</Button></Dialog>; export { element };`,
  );
  await consumerCommand(cwd, [
    join(root, 'node_modules/typescript/bin/tsc'),
    '--ignoreConfig',
    '--noEmit',
    '--strict',
    '--skipLibCheck',
    '--jsx',
    'react-jsx',
    '--target',
    'esnext',
    '--module',
    'nodenext',
    '--moduleResolution',
    'nodenext',
    'typed.tsx',
  ]);
}

export async function smokePackage(root: string) {
  const scratch = mkdtempSync(join(tmpdir(), 'sapphire-package-'));
  await buildPackage(root);
  const tarball = await packPackage(root, scratch);
  await smokeTarball(root, tarball);
  return tarball;
}

export async function smokeTarball(root: string, tarball: string) {
  const scratch = mkdtempSync(join(tmpdir(), 'sapphire-consumer-'));
  const cwd = await cssOnly(root, scratch, tarball);
  await exportBoundaries(root, cwd);
  await elementSideEffects(root, cwd);
  await reactWithoutRadix(scratch, tarball);
  await dialogBuild(root, scratch, tarball);
  process.stdout.write(
    `Package consumer smokes passed: ${scratch}\n${Object.keys(packageEntries(root)).length} reachable public subpaths\nTarball: ${tarball}\n`,
  );
}

if (import.meta.main) await smokePackage(process.cwd());
