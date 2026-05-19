import { getConsentStatus } from '../lib/consent';

declare global {
  interface Window {
    dataLayer?: any[];
    zaraz?: any;
  }
}

const SSRHTMLElement = typeof window !== 'undefined' ? HTMLElement : class {} as typeof HTMLElement;

export class AnalyticsElement extends SSRHTMLElement {
  connectedCallback() {
    if (typeof window === 'undefined') return;

    // Detect localhost or local development domains to prevent data pollution
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname.endsWith('.local');

    if (isLocalhost) {
      console.log('[Sapphire Analytics] Localhost environment detected. Tracking is disabled.');
      return;
    }

    const gaId = this.getAttribute('ga-id');
    const posthogToken = this.getAttribute('posthog-token');
    const posthogHost = this.getAttribute('posthog-host') || 'https://phg-t.kongmy.dev';
    const posthogUiHost = this.getAttribute('posthog-ui-host') || 'https://eu.posthog.com';
    const domainsAttr = this.getAttribute('domains') || '';
    const domains = domainsAttr ? domainsAttr.split(',').map(d => d.trim()) : [];

    // Parse current consent status
    const consent = this.parseConsent();

    // 1. Initialize Google Analytics
    if (gaId) {
      this.initGA(gaId, consent.analytics, domains);
    }

    // 2. Initialize PostHog
    if (posthogToken) {
      this.initPostHog(posthogToken, posthogHost, posthogUiHost, consent.analytics);
    }

    // 3. Sync initial consent state with Cloudflare Zaraz
    if (window.zaraz?.consent?.set) {
      try {
        window.zaraz.consent.set({
          analytics: consent.analytics,
        });
      } catch (e) {
        // Silently capture if Zaraz is still initializing asynchronously
      }
    }
  }

  private parseConsent(): { analytics: boolean } {
    const status = getConsentStatus();
    if (status === 'pending') {
      return { analytics: false };
    }
    return status;
  }

  private initGA(gaId: string, allowed: boolean, domains: string[]) {
    // Inject script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Set up gtag global function
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() {
      window.dataLayer!.push(arguments);
    };

    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: allowed ? 'granted' : 'denied',
      wait_for_update: 500,
    });

    window.gtag('js', new Date());

    if (domains.length > 0) {
      window.gtag('set', 'linker', { domains });
    }

    window.gtag('config', gaId, {
      anonymize_ip: true,
      url_passthrough: true,
    });
  }

  private initPostHog(token: string, host: string, uiHost: string, allowed: boolean) {
    // Dynamic snippet setup
    (function(t, e: any) {
      var r;
      e.__SV || (window.posthog = e, e._i = [], e.init = function(i: any, s: any, a: any) {
        function g(t: any, e: any) {
          var o = e.split(".");
          2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function() {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
          }
        }
        var o = t.createElement("script");
        o.type = "text/javascript";
        o.crossOrigin = "anonymous";
        o.async = !0;
        o.src = s.api_host + "/static/array.js";
        var n = t.getElementsByTagName("script")[0];
        n.parentNode?.insertBefore(o, n);
        var p = e;
        void 0 !== a ? p = e[a] = [] : a = "posthog";
        p.people = p.people || [];
        p.toString = function(t: any) {
          var e = "posthog";
          return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e
        };
        p.people.toString = function() {
          return p.toString(1) + ".people (stub)"
        };
        r = "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" ");
        for (var c = 0; c < r.length; c++) g(p, r[c]);
        e._i.push([i, s, a])
      }, e.__SV = 1)
    })(document, (window as any).posthog || []);

    if (window.posthog) {
      window.posthog.init(token, {
        api_host: host,
        ui_host: uiHost,
        persistence: allowed ? 'localStorage+cookie' : 'memory',
        opt_in_site_apps: false, // Disables surveys to save bundle size
        autocapture: true,
        capture_pageview: true,
      });

      // Apply initial consent behavior cloned from landing-page
      if (!allowed) {
        window.posthog.opt_out_capturing({ clear_persistence: true });
      } else {
        window.posthog.opt_in_capturing();
      }
    }
  }
}

if (typeof window !== 'undefined' && !customElements.get('sapphire-analytics')) {
  customElements.define('sapphire-analytics', AnalyticsElement);
}
