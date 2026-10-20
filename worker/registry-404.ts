type Env = {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
};

const isHtmlFallback = (response: Response) =>
  (response.headers.get('content-type') ?? '').includes('text/html');

const plainTextNotFound = () =>
  new Response('not found', {
    status: 404,
    headers: {
      'content-type': 'text/plain',
      'access-control-allow-origin': '*',
    },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    if (isHtmlFallback(response) || response.status === 404)
      return plainTextNotFound();
    const headers = new Headers(response.headers);
    headers.set('access-control-allow-origin', '*');
    headers.set(
      'cache-control',
      'public, max-age=300, stale-while-revalidate=3600',
    );
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
