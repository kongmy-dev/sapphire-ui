import { existsSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist-site');
const port = Number(process.argv[3] ?? 4178);
Bun.serve({
  port,
  fetch(request) {
    const url = new URL(request.url);
    let path: string;
    try {
      path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    } catch {
      return new Response('Invalid path', { status: 400 });
    }
    if (path !== root && !path.startsWith(root + sep))
      return new Response('Not found', { status: 404 });
    if (existsSync(path) && statSync(path).isDirectory())
      path = join(path, 'index.html');
    if (!existsSync(path)) return new Response('Not found', { status: 404 });
    return new Response(Bun.file(path));
  },
});
console.log(`Sapphire site: http://localhost:${port}`);
