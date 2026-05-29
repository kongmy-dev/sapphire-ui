import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// In-memory js-cookie mock so we can drive every getConsentStatus branch
// without touching document.cookie / jsdom encoding quirks.
const cookieMock = vi.hoisted(() => {
  const store: Record<string, string | undefined> = {};
  return {
    store,
    get: vi.fn((key?: string) => (key ? store[key] : store)),
    set: vi.fn((key: string, value: string, options?: unknown) => {
      store[key] = value;
      void options; // 3rd arg (cookie options) is asserted on via mock.calls
    }),
    remove: vi.fn((key: string) => {
      delete store[key];
    }),
  };
});

vi.mock('js-cookie', () => ({
  default: { get: cookieMock.get, set: cookieMock.set, remove: cookieMock.remove },
}));

import {
  getConsentStatus,
  setConsentStatus,
  updateTrackers,
  CONSENT_COOKIE_NAME,
} from './consent';

function clearStore() {
  for (const key of Object.keys(cookieMock.store)) delete cookieMock.store[key];
}

describe('getConsentStatus', () => {
  beforeEach(() => {
    clearStore();
    Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true });
  });

  it('parses the JSON consent cookie', () => {
    cookieMock.store[CONSENT_COOKIE_NAME] = JSON.stringify({ analytics: true });
    expect(getConsentStatus()).toEqual({ analytics: true });
  });

  it('maps the legacy "granted" / "denied" cookie', () => {
    cookieMock.store['ph_cookie_consent'] = 'granted';
    expect(getConsentStatus()).toEqual({ analytics: true });

    clearStore();
    cookieMock.store['ph_cookie_consent'] = 'denied';
    expect(getConsentStatus()).toEqual({ analytics: false });
  });

  it('honours Do Not Track when no cookie is present', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    expect(getConsentStatus()).toEqual({ analytics: false });
  });

  it('returns "pending" when nothing is known', () => {
    expect(getConsentStatus()).toBe('pending');
  });

  it('falls through to "pending" on a malformed JSON cookie', () => {
    cookieMock.store[CONSENT_COOKIE_NAME] = 'not-valid-json';
    expect(getConsentStatus()).toBe('pending');
  });
});

describe('setConsentStatus', () => {
  beforeEach(() => {
    clearStore();
    cookieMock.set.mockClear();
    cookieMock.remove.mockClear();
  });

  it('writes the consent cookie without a domain on localhost', () => {
    // jsdom's default hostname is "localhost".
    setConsentStatus({ analytics: true });
    expect(cookieMock.set).toHaveBeenCalledTimes(1);
    const [name, , options] = cookieMock.set.mock.calls[0];
    expect(name).toBe(CONSENT_COOKIE_NAME);
    expect(options).toMatchObject({ domain: undefined, path: '/', sameSite: 'Lax' });
  });

  it('clears the legacy cookie to avoid conflicts', () => {
    setConsentStatus({ analytics: false });
    expect(cookieMock.remove).toHaveBeenCalledWith('ph_cookie_consent', expect.any(Object));
  });
});

describe('updateTrackers', () => {
  afterEach(() => {
    delete (window as Window & { posthog?: unknown }).posthog;
    delete (window as Window & { gtag?: unknown }).gtag;
    delete (window as Window & { zaraz?: unknown }).zaraz;
  });

  it('opts PostHog back in when analytics is granted', () => {
    const opt_in_capturing = vi.fn();
    window.posthog = {
      has_opted_out_capturing: () => true,
      opt_in_capturing,
      set_config: vi.fn(),
    };
    updateTrackers({ analytics: true });
    expect(opt_in_capturing).toHaveBeenCalled();
  });

  it('opts PostHog out when analytics is denied', () => {
    const opt_out_capturing = vi.fn();
    window.posthog = { opt_out_capturing };
    updateTrackers({ analytics: false });
    expect(opt_out_capturing).toHaveBeenCalled();
  });

  it('updates Google Analytics consent state', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    updateTrackers({ analytics: true });
    expect(gtag).toHaveBeenCalledWith(
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'granted' }),
    );
  });

  it('syncs Cloudflare Zaraz consent', () => {
    const set = vi.fn();
    const consentSet = vi.fn();
    window.zaraz = { set, consent: { set: consentSet } };
    updateTrackers({ analytics: false });
    expect(set).toHaveBeenCalledWith('analytics_consent', 'denied');
    expect(consentSet).toHaveBeenCalledWith({ analytics: false });
  });
});
