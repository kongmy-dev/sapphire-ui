import {
  test as base,
  expect,
  type Route,
  type TestInfo,
} from '@playwright/test';
import {
  captureCountProblem,
  STATE_COUNT_ANNOTATION,
  type StateInventory,
  stateName,
} from '../../tooling/visual/state-inventory';
import inventory from './state-inventory.json' with { type: 'json' };

const expectedCounts: StateInventory = inventory;

function assertStateCount(info: TestInfo) {
  const key = `${stateName(info.title)}/${info.project.name}`;
  const captured = info.annotations.filter(
    (item) => item.type === 'v4-state',
  ).length;
  info.annotations.push({
    type: STATE_COUNT_ANNOTATION,
    description: `${key}=${captured}`,
  });
  expect(
    captureCountProblem({
      expected: expectedCounts[key] ?? 0,
      captured,
      updating: info.config.updateSnapshots !== 'none',
    }),
  ).toBeNull();
}

const THEME_KEY = 'sapphire-theme';
const CONSENT_COOKIE = 'kongmy_consent';
const DECLINED_CONSENT = encodeURIComponent(
  JSON.stringify({ analytics: false }),
);
const UNREACHABLE_HOSTS = ['avatars.githubusercontent.com'];
async function answer(route: Route, blocked: string[]) {
  const url = new URL(route.request().url());
  if (url.hostname === 'localhost') return route.continue();
  if (UNREACHABLE_HOSTS.includes(url.hostname))
    return route.fulfill({ status: 404 });
  blocked.push(url.href);
  return route.abort();
}

export const test = base.extend({
  context: async ({ context, colorScheme }, use, info) => {
    const blocked: string[] = [];
    const scheme = colorScheme === 'dark' ? 'dark' : 'light';
    await context.addInitScript(
      ({ key, value }) => {
        if (location.hostname === 'localhost') localStorage.setItem(key, value);
      },
      { key: THEME_KEY, value: scheme },
    );
    await context.addCookies([
      {
        name: CONSENT_COOKIE,
        value: DECLINED_CONSENT,
        domain: 'localhost',
        path: '/',
      },
    ]);
    await context.route(/^https?:/, (route) => answer(route, blocked));
    await use(context);
    assertStateCount(info);
    expect(blocked, 'requests beyond localhost').toEqual([]);
  },
});

export { expect };
