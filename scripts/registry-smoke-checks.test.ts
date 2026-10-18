import { describe, expect, it } from 'bun:test';
import {
  registryItemHeaderProblems,
  shadcnCliEnv,
} from './registry-smoke-checks';

describe('shadcnCliEnv', () => {
  it('hides REGISTRY_URL from the shadcn CLI, which reads it as its default registry and would fetch colors/<baseColor>.json from ours', () => {
    const env = shadcnCliEnv({
      PATH: '/usr/bin',
      REGISTRY_URL: 'https://design.kongmy.dev/r/{name}.json',
    });

    expect(env).toEqual({ PATH: '/usr/bin' });
  });
});

describe('registryItemHeaderProblems', () => {
  it('accepts open CORS and the one registry cache policy', () => {
    const headers = new Headers({
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=300, stale-while-revalidate=3600',
    });

    expect(registryItemHeaderProblems(headers)).toEqual([]);
  });

  it('rejects the page and JSON cache values combined with the registry one, as _headers serves them without "! Cache-Control"', () => {
    const headers = new Headers({ 'access-control-allow-origin': '*' });
    headers.append(
      'cache-control',
      'public, max-age=60, stale-while-revalidate=600',
    );
    headers.append('cache-control', 'public, max-age=3600');
    headers.append(
      'cache-control',
      'public, max-age=300, stale-while-revalidate=3600',
    );

    expect(registryItemHeaderProblems(headers)).toEqual([
      expect.stringContaining('Cache-Control is'),
    ]);
  });

  it('rejects an item served without CORS, which the CLI cannot fetch cross-origin', () => {
    const headers = new Headers({
      'cache-control': 'public, max-age=300, stale-while-revalidate=3600',
    });

    expect(registryItemHeaderProblems(headers)).toEqual([
      expect.stringContaining('Access-Control-Allow-Origin is null'),
    ]);
  });
});
