import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SCHEMES } from '../source/token-values';
import { buildExamples } from './build';
import { EXAMPLE_PORT, EXAMPLE_URL, readExamples } from './catalog';

const root = process.cwd();
const examples = readExamples(root);
if (!examples.length) throw new Error('No React examples were found');
const out = mkdtempSync(join(tmpdir(), 'sapphire-react-examples-'));
process.on('exit', () => rmSync(out, { recursive: true, force: true }));
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => process.exit(0));
await buildExamples({ root, out, examples });

const html = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

const requestedScheme = (url: URL) => url.searchParams.get('scheme') ?? 'light';

function respond(request: Request): Response {
  const url = new URL(request.url);
  const asset =
    /^\/(examples-entry\.js|examples\.css|sapphire\.css|fonts\/[a-z0-9-]+\.woff2)$/.exec(
      url.pathname,
    )?.[1];
  if (asset) return new Response(Bun.file(join(out, asset)));
  if (url.pathname === '/catalog.json') return Response.json(examples);
  if (url.pathname !== '/') return html('Not found', 404);
  const component = url.searchParams.get('component');
  const name = url.searchParams.get('example');
  const scheme = requestedScheme(url);
  if (!SCHEMES.some((value) => value === scheme))
    return html('Invalid scheme', 400);
  if (!component && !name)
    return html(
      '<!doctype html><title>React examples</title><h1>React examples</h1>',
    );
  const example = examples.find(
    (row) => row.component === component && row.name === name,
  );
  if (!example) return html('Unknown example', 404);
  return html(
    [
      '<!doctype html>',
      `<html lang="en" data-theme="${scheme}">`,
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
      `<title>${example.component}: ${example.name}</title>`,
      '<link rel="stylesheet" href="/sapphire.css">',
      '<link rel="stylesheet" href="/examples.css">',
      '<body data-example-root><main class="sp-page sp-stack">',
      `<h1>${example.component}: ${example.name}</h1>`,
      '<section id="example" class="sp-stack" aria-label="Component example"></section>',
      '</main><script type="module" src="/examples-entry.js"></script></body></html>',
    ].join('\n'),
  );
}

Bun.serve({ port: EXAMPLE_PORT, fetch: respond });
console.log(`React examples: ${EXAMPLE_URL}`);
