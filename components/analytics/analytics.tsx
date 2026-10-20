'use client';

import { useEffect } from 'react';
import { type AnalyticsOptions, mountAnalytics } from '../../lib/analytics.js';

export type AnalyticsProps = AnalyticsOptions;

export function Analytics(props: AnalyticsProps) {
  const { gaId, posthogToken, posthogHost, posthogUiHost, domains } = props;
  useEffect(
    () =>
      mountAnalytics({
        gaId,
        posthogToken,
        posthogHost,
        posthogUiHost,
        domains,
      }),
    [gaId, posthogToken, posthogHost, posthogUiHost, domains],
  );
  return null;
}
