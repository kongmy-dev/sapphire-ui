import React from 'react';
import './AnalyticsElement';

export interface AnalyticsProps {
  gaId?: string;
  posthogToken?: string;
  posthogHost?: string;
  posthogUiHost?: string;
  domains?: string;
}

export function Analytics({ gaId, posthogToken, posthogHost, posthogUiHost, domains }: AnalyticsProps) {
  // Use React.createElement to dynamically load the custom element in React SPA environments
  return React.createElement('sapphire-analytics', {
    'ga-id': gaId,
    'posthog-token': posthogToken,
    'posthog-host': posthogHost,
    'posthog-ui-host': posthogUiHost,
    'domains': domains,
  });
}
