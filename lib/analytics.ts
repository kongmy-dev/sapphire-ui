import { acquireGoogle } from './analytics-google.js';
import { acquirePosthog } from './analytics-posthog.js';
import { member } from './analytics-sdk.js';
import {
  CONSENT_CHANGE_EVENT,
  getConsentStatus,
  updateTrackers,
} from './consent.js';

export type AnalyticsOptions = {
  gaId?: string | undefined;
  posthogToken?: string | undefined;
  posthogHost?: string | undefined;
  posthogUiHost?: string | undefined;
  domains?: string | undefined;
};

function isLocal() {
  const host = window.location.hostname;
  return (
    host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')
  );
}

function startTrackers(props: AnalyticsOptions): (() => void)[] {
  const releases: (() => void)[] = [];
  if (props.posthogToken) releases.push(acquirePosthog(props));
  if (props.gaId && !member(window, 'zaraz'))
    releases.push(acquireGoogle(props));
  return releases;
}

export function mountAnalytics(props: AnalyticsOptions): () => void {
  const { gaId, posthogToken, posthogHost, posthogUiHost, domains } = props;
  if (typeof window === 'undefined' || isLocal()) return () => {};
  const releases: (() => void)[] = [];
  let cleanupTrackers = () => {};
  const sync = () => {
    const consent = getConsentStatus();
    const preferences = consent === 'pending' ? { analytics: false } : consent;
    cleanupTrackers();
    if (preferences.analytics && releases.length === 0)
      releases.push(
        ...startTrackers({
          gaId,
          domains,
          posthogToken,
          posthogHost,
          posthogUiHost,
        }),
      );
    if (gaId) Reflect.set(window, `ga-disable-${gaId}`, !preferences.analytics);
    cleanupTrackers = updateTrackers(preferences);
  };
  sync();
  document.addEventListener(CONSENT_CHANGE_EVENT, sync);
  return () => {
    document.removeEventListener(CONSENT_CHANGE_EVENT, sync);
    cleanupTrackers();
    for (const release of releases) release();
  };
}
