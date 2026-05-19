import Cookies from 'js-cookie';

export const CONSENT_COOKIE_NAME = 'kongmy_consent';
export const CONSENT_DOMAIN = '.kongmy.dev';

export interface ConsentPreferences {
  analytics: boolean;
}

export type ConsentState = ConsentPreferences | 'pending';

declare global {
  interface Window {
    posthog?: any;
    gtag?: any;
    zaraz?: any;
  }
}

export function getConsentStatus(): ConsentState {
  if (typeof document === 'undefined') return 'pending';

  const consentCookie = Cookies.get(CONSENT_COOKIE_NAME);
  if (consentCookie) {
    try {
      const value = decodeURIComponent(consentCookie);
      return JSON.parse(value) as ConsentPreferences;
    } catch (e) {
      // Fallthrough
    }
  }

  // Fallback to legacy version
  const legacyCookie = Cookies.get('ph_cookie_consent');
  if (legacyCookie) {
    if (legacyCookie === 'granted') return { analytics: true };
    if (legacyCookie === 'denied') return { analytics: false };
  }

  if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
    return { analytics: false };
  }

  return 'pending';
}

export function setConsentStatus(preferences: ConsentPreferences) {
  if (typeof document === 'undefined') return;

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  Cookies.set(CONSENT_COOKIE_NAME, encodeURIComponent(JSON.stringify(preferences)), {
    expires: 365,
    domain: isLocalhost ? undefined : CONSENT_DOMAIN,
    path: '/',
    sameSite: 'Lax'
  });

  // Clear legacy cookie to avoid conflicts
  Cookies.remove('ph_cookie_consent', {
    domain: isLocalhost ? undefined : CONSENT_DOMAIN,
    path: '/'
  });
}

export function updateTrackers(preferences: ConsentPreferences) {
  if (typeof window === 'undefined') return;

  // Update PostHog
  if (window.posthog) {
    if (preferences.analytics) {
      if (window.posthog.has_opted_out_capturing && window.posthog.has_opted_out_capturing()) {
        window.posthog.opt_in_capturing();
      }
      if (window.posthog.set_config) {
        window.posthog.set_config({ persistence: 'localStorage+cookie' });
      }
    } else {
      if (window.posthog.opt_out_capturing) {
        window.posthog.opt_out_capturing();
      }
    }
  }

  // Update Google Analytics
  if (window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
    });
  }

  // Update Cloudflare Zaraz
  if (window.zaraz?.consent?.set) {
    try {
      window.zaraz.consent.set({
        analytics: preferences.analytics,
      });
    } catch (e) {
      console.warn('[Sapphire Analytics] Failed to sync consent with Cloudflare Zaraz:', e);
    }
  }
}
