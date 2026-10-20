const registryCacheControl = 'public, max-age=300, stale-while-revalidate=3600';

const shadcnDefaultRegistryVariable = 'REGISTRY_URL';

export function shadcnCliEnv(
  env: Readonly<Record<string, string | undefined>>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(env).filter(
      ([name]) => name !== shadcnDefaultRegistryVariable,
    ),
  );
}

export function registryItemHeaderProblems(headers: Headers): string[] {
  const problems: string[] = [];
  const allowOrigin = headers.get('access-control-allow-origin');
  if (allowOrigin !== '*') {
    problems.push(
      `Access-Control-Allow-Origin is ${JSON.stringify(allowOrigin)}, expected "*": the shadcn CLI fetches cross-origin`,
    );
  }
  const cacheControl = headers.get('cache-control');
  if (cacheControl !== registryCacheControl) {
    problems.push(
      `Cache-Control is ${JSON.stringify(cacheControl)}, expected exactly "${registryCacheControl}": registry responses must use the exact registry cache policy`,
    );
  }
  return problems;
}
