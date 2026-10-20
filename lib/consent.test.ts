import { afterEach, expect, mock, test } from 'bun:test';
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_COOKIE_NAME,
  CONSENT_DOMAIN,
  type ConsentPreferences,
  type ConsentState,
  getConsentStatus,
  setConsentStatus,
  updateTrackers,
} from './consent.js';

const cookieDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie');
const dnt = Object.getOwnPropertyDescriptor(navigator, 'doNotTrack');
const url = window.location.href;
const savedTrackers = ['posthog', 'gtag', 'zaraz'].map((name) => ({
  name,
  descriptor: Object.getOwnPropertyDescriptor(window, name),
}));

function restoreProperty(
  target: object,
  name: string,
  descriptor: PropertyDescriptor | undefined,
) {
  if (descriptor) Object.defineProperty(target, name, descriptor);
  else Reflect.deleteProperty(target, name);
}

afterEach(() => {
  document.dispatchEvent(new Event('sapphire-tracker-consent'));
  document.documentElement.removeAttribute('data-sapphire-consent');
  restoreProperty(document, 'cookie', cookieDescriptor);
  restoreProperty(navigator, 'doNotTrack', dnt);
  for (const item of savedTrackers)
    restoreProperty(window, item.name, item.descriptor);
  window.location.href = url;
});

function cookies(value: string) {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    writable: true,
    value,
  });
}

test('parses raw, encoded and legacy double-encoded JSON while rejecting malformed shapes', () => {
  let value = JSON.stringify({ analytics: true });
  for (let layer = 0; layer < 3; layer++) {
    cookies(`unrelated=a; ${CONSENT_COOKIE_NAME}=${value}; other=b`);
    expect(getConsentStatus()).toEqual({ analytics: true });
    value = encodeURIComponent(value);
  }
  for (const raw of [
    '',
    '%broken',
    '{}',
    'null',
    '[]',
    '{"analytics":"true"}',
    'not json',
  ]) {
    cookies(`${CONSENT_COOKIE_NAME}=${raw}`);
    const state: ConsentState = getConsentStatus();
    expect(state).toBe('pending');
  }
});

test('uses legacy values and DNT only when current preferences are unavailable', () => {
  cookies('ph_cookie_consent=granted');
  expect(getConsentStatus()).toEqual({ analytics: true });
  cookies('ph_cookie_consent=denied');
  expect(getConsentStatus()).toEqual({ analytics: false });
  Object.defineProperty(navigator, 'doNotTrack', {
    configurable: true,
    value: '1',
  });
  cookies('ph_cookie_consent=invalid');
  expect(getConsentStatus()).toEqual({ analytics: false });
  cookies(`${CONSENT_COOKIE_NAME}=${encodeURIComponent('{"analytics":true}')}`);
  expect(getConsentStatus()).toEqual({ analytics: true });
});

test('limits shared cookie scope to the matching domain and removes legacy cookies', () => {
  for (const hostname of [
    'kongmy.dev',
    'design.kongmy.dev',
    'client.example',
    'notkongmy.dev',
    'localhost',
  ]) {
    window.location.href = `https://${hostname}/`;
    const writes: string[] = [];
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => '',
      set: (value: string) => writes.push(value),
    });
    const preferences: ConsentPreferences = { analytics: false };
    setConsentStatus(preferences);
    expect(writes).toHaveLength(3);
    expect(writes[0]).toContain('Max-Age=31536000; Path=/; SameSite=Lax');
    expect(writes[0]).toContain('; Secure');
    expect(writes[0]?.includes(`Domain=${CONSENT_DOMAIN}`)).toBe(
      hostname === 'kongmy.dev' || hostname === 'design.kongmy.dev',
    );
    expect(writes[1]).toContain('ph_cookie_consent=; Max-Age=0');
  }
  window.location.href = 'http://localhost/';
  const write = mock((_value: string) => {});
  Object.defineProperty(document, 'cookie', { configurable: true, set: write });
  setConsentStatus({ analytics: true });
  expect(write.mock.calls[0]?.[0]).not.toContain('Secure');
});

test('keeps a new choice and broadcasts it even when browser cookie access is denied', () => {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => {
      throw new Error('denied');
    },
    set: () => {
      throw new Error('denied');
    },
  });
  expect(getConsentStatus()).toBe('pending');
  const changed = mock((_event: Event) => {});
  document.addEventListener(CONSENT_CHANGE_EVENT, changed);
  setConsentStatus({ analytics: false });
  expect(getConsentStatus()).toEqual({ analytics: false });
  expect(changed).toHaveBeenCalledTimes(1);
  document.removeEventListener(CONSENT_CHANGE_EVENT, changed);
});

test('updates tracker consent without enabling advertising and clears persistence on withdrawal', () => {
  const optedOut = mock(() => true);
  const optIn = mock(() => {});
  const optOut = mock((_options: unknown) => {});
  const config = mock((_options: unknown) => {});
  const gtag = mock((..._args: unknown[]) => {});
  const set = mock((..._args: unknown[]) => {});
  const consent = mock((_options: unknown) => {});
  Reflect.set(window, 'posthog', {
    has_opted_out_capturing: optedOut,
    opt_in_capturing: optIn,
    opt_out_capturing: optOut,
    set_config: config,
  });
  Reflect.set(window, 'gtag', gtag);
  Reflect.set(window, 'zaraz', {
    set,
    consent: { APIReady: true, set: consent },
  });
  updateTrackers({ analytics: true })();
  expect(optIn).toHaveBeenCalledTimes(1);
  expect(config).toHaveBeenCalledWith({ persistence: 'localStorage+cookie' });
  expect(gtag).toHaveBeenLastCalledWith('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });
  optedOut.mockImplementation(() => false);
  updateTrackers({ analytics: true })();
  expect(optIn).toHaveBeenCalledTimes(1);
  updateTrackers({ analytics: false })();
  expect(optOut).toHaveBeenCalledWith({ clear_persistence: true });
  expect(set).toHaveBeenLastCalledWith('analytics_consent', 'denied');
  expect(consent).toHaveBeenLastCalledWith({ analytics: false });
});

test('a late tracker sees only the latest choice and cleanup cancels deferred work', () => {
  Reflect.deleteProperty(window, 'zaraz');
  updateTrackers({ analytics: true });
  updateTrackers({ analytics: false });
  const set = mock((_options: unknown) => {});
  Reflect.set(window, 'zaraz', { consent: { set } });
  document.dispatchEvent(new Event('zarazConsentAPIReady'));
  expect(set).toHaveBeenCalledTimes(1);
  expect(set).toHaveBeenCalledWith({ analytics: false });
  const cleanup = updateTrackers({ analytics: true });
  set.mockClear();
  cleanup();
  document.dispatchEvent(new Event('zarazConsentAPIReady'));
  expect(set).not.toHaveBeenCalled();
});

test('isolates tracker failures so one broken integration cannot block withdrawal elsewhere', () => {
  Reflect.set(window, 'posthog', {
    opt_out_capturing: () => {
      throw new Error('not ready');
    },
  });
  const gtag = mock((..._args: unknown[]) => {});
  Reflect.set(window, 'gtag', gtag);
  Reflect.set(window, 'zaraz', { consent: { set: 'not callable' } });
  updateTrackers({ analytics: false })();
  expect(gtag).toHaveBeenCalledTimes(1);
});

test('is safe to import and call without browser globals', () => {
  const result = Bun.spawnSync({
    cmd: [
      process.execPath,
      '-e',
      `import {getConsentStatus,setConsentStatus,updateTrackers} from './lib/consent.ts'; if(getConsentStatus()!=='pending')process.exit(1); setConsentStatus({analytics:false}); updateTrackers({analytics:false})();`,
    ],
    cwd: process.cwd(),
  });
  expect(result.exitCode).toBe(0);
});

test('returns an executable no-op disposer while browser globals are unavailable', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Reflect.deleteProperty(globalThis, 'window');
  try {
    expect(getConsentStatus()).toBe('pending');
    setConsentStatus({ analytics: false });
    expect(updateTrackers({ analytics: false })()).toBeUndefined();
  } finally {
    restoreProperty(globalThis, 'window', descriptor);
  }
});
