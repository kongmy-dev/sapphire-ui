import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildStylesheet, FONT_DIR } from '../css/build';
import { SCHEMES, type Scheme } from '../source/token-values';
import { SPECIMEN_PORT, specimenFiles, specimenPage } from './specimens';

const root = process.cwd();
const out = mkdtempSync(join(tmpdir(), 'sapphire-specimens-'));
process.on('exit', () => rmSync(out, { recursive: true, force: true }));
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => process.exit(0));
}

await buildStylesheet(root, out, { minify: true });

const FONT_FILE = /^\/fonts\/([a-z0-9-]+\.woff2)$/;

const isScheme = (value: string | null): value is Scheme =>
  SCHEMES.some((scheme) => scheme === value);

const html = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

function listing(files: readonly string[]): string {
  const links = files
    .map((file) => `<li><a href="/${file}">${file}</a></li>`)
    .join('');
  return `<!doctype html><title>specimens</title><ul>${links}</ul>`;
}

function respond(request: Request): Response {
  const url = new URL(request.url);
  const files = specimenFiles(root);
  const path = decodeURIComponent(url.pathname);
  const file = path.slice(1);
  if (path === '/') return html(listing(files));
  if (path === '/sapphire.css')
    return new Response(Bun.file(join(out, 'sapphire.css')));
  if (path === '/specimen.css')
    return new Response(Bun.file(join(root, 'site/specimen.css')));
  const font = FONT_FILE.exec(path)?.[1];
  if (font !== undefined)
    return new Response(Bun.file(join(out, FONT_DIR, font)));
  if (!files.includes(file)) return html('not found', 404);
  const scheme = url.searchParams.get('scheme') ?? 'light';
  if (!isScheme(scheme)) return html('scheme must be light or dark', 400);
  const fragment = readFileSync(join(root, file), 'utf8');
  return html(specimenPage(file, fragment, scheme));
}

Bun.serve({ port: SPECIMEN_PORT, fetch: respond });
console.log(`specimens: http://localhost:${SPECIMEN_PORT}`);
