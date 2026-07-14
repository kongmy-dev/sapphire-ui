/**
 * Runs in front of static assets for /r/* only (wrangler.toml
 * `run_worker_first = ["/r/*"]`). Everything else is served directly from
 * assets with the SPA fallback.
 *
 * Why: `not_found_handling = "single-page-application"` returns index.html
 * (200, text/html) for ANY missing path — including missing registry JSON.
 * The shadcn CLI treats that as a fatal "Failed to parse JSON" instead of a
 * tolerable 404. It even probes speculative URLs on every fresh install
 * (e.g. `/r/{name}.json/colors/neutral.json` for the project baseColor), so
 * the fallback breaks `shadcn add` for every new consumer app — a real 404
 * lets the CLI fall back gracefully. Verified by `bun run smoke:registry`.
 */
interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    const type = response.headers.get('content-type') ?? '';
    if (type.includes('text/html')) {
      return new Response(
        JSON.stringify({ error: 'registry item not found' }),
        {
          status: 404,
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
          },
        },
      );
    }
    return response;
  },
};
