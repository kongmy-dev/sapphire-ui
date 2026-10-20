import { expect, test } from 'bun:test';
import worker from './registry-404';

for (const path of ['/r/button.json', '/r/v4/button.json']) {
  test(`serves cacheable cross-origin JSON at ${path}`, async () => {
    const response = await worker.fetch(
      new Request(`https://example.test${path}`),
      {
        ASSETS: {
          fetch: async () => Response.json({ name: 'button' }),
        },
      },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=300, stale-while-revalidate=3600',
    );
    expect(await response.json()).toEqual({ name: 'button' });
  });
}

for (const status of [200, 404]) {
  test(`missing nested registry URL rejects HTML with status ${status}`, async () => {
    const response = await worker.fetch(
      new Request('https://example.test/r/v4/nested/missing.json'),
      {
        ASSETS: {
          fetch: async () =>
            new Response('<html>fallback</html>', {
              status,
              headers: { 'content-type': 'text/html' },
            }),
        },
      },
    );
    expect(response.status).toBe(404);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(await response.text()).toBe('not found');
  });
}
