import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { buildExamples } from '../examples/build';
import { readExamples } from '../examples/catalog';
import { readElementExamples } from '../examples/elements';
import { buildRegistry } from '../registry/build';
import { foundationGuides } from './foundations';
import { code } from './html';
import { navigation } from './navigation';
import { propReader } from './props';
import { catalogPage, componentPage, page } from './render';
import { hookGuide } from './utilities';

const root = process.cwd();
const destination = resolve(root, process.argv[2] ?? 'dist-site');
const cache = join(root, 'node_modules/.cache/sapphire-site');
mkdirSync(cache, { recursive: true });
const scratch = mkdtempSync(join(cache, 'build-'));
const out = join(scratch, 'output');
const assets = join(out, 'assets');
mkdirSync(assets, { recursive: true });
const react = readExamples(root);
const native = readElementExamples(root);
const readProps = propReader(root);
await buildExamples({ root, out: assets, examples: react, production: true });
const client = await Bun.build({
  entrypoints: [join(root, 'site/client.ts')],
  outdir: assets,
  naming: 'site-client.js',
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
  target: 'browser',
});
if (!client.success)
  throw new Error(client.logs.map((log) => log.message).join('\n'));
function write(route: string, body: string) {
  const directory = join(out, route);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), body);
}
write('', catalogPage(react, false, navigation(react, native, '')));
write('native', catalogPage(native, true, navigation(react, native, 'native')));
for (const [prefix, rows] of [
  ['components', react],
  ['native', native],
] as const) {
  for (const name of new Set(rows.map((row) => row.component))) {
    write(
      `${prefix}/${name}`,
      componentPage(
        root,
        rows.filter((row) => row.component === name),
        prefix === 'native',
        navigation(react, native, `${prefix}/${name}`),
        prefix === 'native' ? [] : readProps(name),
      ),
    );
  }
}
write(
  'foundations',
  page(
    'Foundations',
    `<p>Load foundations once for fonts, tokens, base styles and layout primitives.</p>${code('import "@kongmy-dev/sapphire-ui/foundations.css";')}<nav class="sp-cluster" aria-label="Foundation guides"><a href="/colors/">Colors</a><a href="/typography/">Typography</a><a href="/tokens/">Tokens and themes</a><a href="/layout/">Layout primitives</a><a href="/prose/">Prose</a></nav><p>Each component stylesheet is separate. Use the full sapphire.css convenience entry only when every component comes from the package.</p>`,
    navigation(react, native, 'foundations'),
  ),
);
for (const guide of foundationGuides(root))
  write(
    guide.route,
    page(guide.title, guide.body, navigation(react, native, guide.route)),
  );
write(
  'hooks',
  page('Hooks and utilities', hookGuide(), navigation(react, native, 'hooks')),
);
cpSync(join(root, 'site/docs.css'), join(assets, 'docs.css'));
cpSync(join(root, 'site/reference.css'), join(assets, 'reference.css'));
if (existsSync(join(root, 'registry/legacy-r')))
  cpSync(join(root, 'registry/legacy-r'), join(out, 'r'), { recursive: true });
cpSync(join(root, 'public/_headers'), join(out, '_headers'));
if (process.argv.includes('--registry')) buildRegistry(root, join(out, 'r/v5'));
mkdirSync(dirname(destination), { recursive: true });
if (existsSync(destination)) renameSync(destination, join(scratch, 'previous'));
renameSync(out, destination);
console.log(
  `Built ${new Set(react.map((row) => row.component)).size} React component pages and ${new Set(native.map((row) => row.component)).size} native pages in ${destination}`,
);
