import { expect, test } from 'bun:test';

test('analytics, cookie and toast modules import without browser globals or fake constructors', () => {
  const result = Bun.spawnSync(
    [
      'bun',
      '-e',
      `
    const { AnalyticsElement } = await import('./elements/analytics.ts');
    const { CookieBannerElement } = await import('./elements/cookie-banner.ts');
    const { ToastElement } = await import('./elements/toast.ts');
    const { mountAnalytics } = await import('./lib/analytics.ts');
    mountAnalytics({ gaId: 'G-SSR' })();
    console.log(JSON.stringify([AnalyticsElement, CookieBannerElement, ToastElement].map(value => typeof value)));
  `,
    ],
    { cwd: new URL('..', import.meta.url).pathname },
  );
  expect(result.exitCode).toBe(0);
  expect(result.stdout.toString().trim()).toBe(
    '["undefined","undefined","undefined"]',
  );
});
