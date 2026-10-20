export const CONSENT_COOKIE_NAME = 'kongmy_consent';
export const CONSENT_DOMAIN = '.kongmy.dev';
export const CONSENT_CHANGE_EVENT = 'sapphire-consent-change';
export type ConsentPreferences = { readonly analytics: boolean };
export type ConsentState = ConsentPreferences | 'pending';

const LEGACY_COOKIE = 'ph_cookie_consent';
const TRACKER_EVENT = 'sapphire-tracker-consent';
const ZARAZ_READY = 'zarazConsentAPIReady';
const SESSION_ATTRIBUTE = 'data-sapphire-consent';
const isBrowser = () =>
  typeof document !== 'undefined' && typeof window !== 'undefined';

function cookieValue(name: string): string {
  try {
    return (
      document.cookie
        .split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith(`${name}=`))
        ?.slice(name.length + 1) ?? ''
    );
  } catch {
    return '';
  }
}

function preferences(value: unknown): ConsentPreferences | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('analytics' in value) ||
    typeof value.analytics !== 'boolean'
  )
    return null;
  return { analytics: value.analytics };
}

function parseValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function decodeValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

function parseCookie(value: string): ConsentPreferences | null {
  let decoded = value;
  for (let attempt = 0; attempt < 3; attempt++) {
    const parsed = preferences(parseValue(decoded));
    if (parsed) return parsed;
    decoded = decodeValue(decoded);
  }
  return null;
}

export function getConsentStatus(): ConsentState {
  if (!isBrowser()) return 'pending';
  const current = document.documentElement.getAttribute(SESSION_ATTRIBUTE);
  if (current === 'true' || current === 'false')
    return { analytics: current === 'true' };
  const saved = parseCookie(cookieValue(CONSENT_COOKIE_NAME));
  if (saved) return saved;
  const legacy = cookieValue(LEGACY_COOKIE);
  if (legacy === 'granted' || legacy === 'denied')
    return { analytics: legacy === 'granted' };
  if (navigator.doNotTrack === '1') return { analytics: false };
  return 'pending';
}

function cookieScope(): string {
  const hostname = window.location.hostname;
  const shared =
    hostname === CONSENT_DOMAIN.slice(1) || hostname.endsWith(CONSENT_DOMAIN);
  const domain = shared ? `; Domain=${CONSENT_DOMAIN}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  return `; Path=/; SameSite=Lax${domain}${secure}`;
}

export function setConsentStatus(value: ConsentPreferences): void {
  if (!isBrowser()) return;
  document.documentElement.setAttribute(
    SESSION_ATTRIBUTE,
    String(value.analytics),
  );
  try {
    const scope = cookieScope();
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=31536000${scope}`;
    document.cookie = `${LEGACY_COOKIE}=; Max-Age=0${scope}`;
    document.cookie = `${LEGACY_COOKIE}=; Max-Age=0; Path=/`;
  } catch {
    document.dispatchEvent(
      new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }),
    );
    return;
  }
  document.dispatchEvent(
    new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }),
  );
}

function member(target: unknown, name: string): unknown {
  if (
    (typeof target !== 'object' || target === null) &&
    typeof target !== 'function'
  )
    return undefined;
  return Reflect.get(target, name);
}

function invoke(
  target: unknown,
  name: string,
  args: readonly unknown[] = [],
): unknown {
  try {
    const method = member(target, name);
    if (typeof method === 'function')
      return Reflect.apply(method, target, args);
  } catch {
    return undefined;
  }
  return undefined;
}

function syncZaraz(value: ConsentPreferences): void {
  const zaraz = member(window, 'zaraz');
  invoke(zaraz, 'set', [
    'analytics_consent',
    value.analytics ? 'granted' : 'denied',
  ]);
  invoke(member(zaraz, 'consent'), 'set', [{ analytics: value.analytics }]);
}

function syncPosthog(value: ConsentPreferences): void {
  const tracker = member(window, 'posthog');
  if (!value.analytics) {
    invoke(tracker, 'opt_out_capturing', [{ clear_persistence: true }]);
    return;
  }
  if (invoke(tracker, 'has_opted_out_capturing') !== false)
    invoke(tracker, 'opt_in_capturing');
  invoke(tracker, 'set_config', [{ persistence: 'localStorage+cookie' }]);
}

export function updateTrackers(value: ConsentPreferences): () => void {
  if (!isBrowser()) return () => {};
  document.dispatchEvent(new Event(TRACKER_EVENT));
  syncPosthog(value);
  invoke(window, 'gtag', [
    'consent',
    'update',
    {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: value.analytics ? 'granted' : 'denied',
    },
  ]);
  syncZaraz(value);
  const cleanup = () => {
    document.removeEventListener(ZARAZ_READY, ready);
    document.removeEventListener(TRACKER_EVENT, cleanup);
  };
  const ready = () => {
    syncZaraz(value);
    cleanup();
  };
  if (member(member(member(window, 'zaraz'), 'consent'), 'APIReady') !== true) {
    document.addEventListener(ZARAZ_READY, ready, { once: true });
    document.addEventListener(TRACKER_EVENT, cleanup, { once: true });
  }
  return cleanup;
}
