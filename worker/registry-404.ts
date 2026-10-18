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
    return isHtmlFallback(response) ? plainTextNotFound() : response;
  },
};
