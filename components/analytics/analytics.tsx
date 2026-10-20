'use client';

import { useEffect } from 'react';
import {
  CONSENT_CHANGE_EVENT,
  getConsentStatus,
  updateTrackers,
} from '../../lib/consent.js';
import type { AnalyticsProps } from './analytics-types.js';
import { acquireGoogle } from './google.js';
import { acquirePosthog } from './posthog.js';
import { member } from './sdk.js';

export type { AnalyticsProps } from './analytics-types.js';

function isLocal() {
  const host = window.location.hostname;
  return (
    host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')
  );
}

function startTrackers(props: AnalyticsProps): (() => void)[] {
  const releases: (() => void)[] = [];
  if (props.posthogToken) releases.push(acquirePosthog(props));
  if (props.gaId && !member(window, 'zaraz'))
    releases.push(acquireGoogle(props));
  return releases;
}

export function Analytics(props: AnalyticsProps) {
  const { gaId, posthogToken, posthogHost, posthogUiHost, domains } = props;
  useEffect(() => {
    if (isLocal()) return;
    const releases: (() => void)[] = [];
    let cleanupTrackers = () => {};
    const sync = () => {
      const consent = getConsentStatus();
      const preferences =
        consent === 'pending' ? { analytics: false } : consent;
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
      if (gaId)
        Reflect.set(window, `ga-disable-${gaId}`, !preferences.analytics);
      cleanupTrackers = updateTrackers(preferences);
    };
    sync();
    document.addEventListener(CONSENT_CHANGE_EVENT, sync);
    return () => {
      document.removeEventListener(CONSENT_CHANGE_EVENT, sync);
      cleanupTrackers();
      for (const release of releases) release();
    };
  }, [gaId, posthogToken, posthogHost, posthogUiHost, domains]);
  return null;
}
