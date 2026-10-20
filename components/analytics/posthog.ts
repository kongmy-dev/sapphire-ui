import { getConsentStatus } from '../../lib/consent.js';
import type { AnalyticsProps } from './analytics.js';
import { call, member, retain, sdkScript } from './sdk.js';

function stub() {
  const queue: unknown[] = [];
  const initializations: unknown[] = [];
  const sdk = Object.assign(queue, { __SV: 1, _i: initializations });
  for (const name of 'capture identify alias set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId'.split(
    ' ',
  ))
    Reflect.set(sdk, name, (...args: unknown[]) => {
      queue.push([name, ...args]);
    });
  const people: unknown[] = [];
  for (const name of ['set', 'set_once'])
    Reflect.set(people, name, (...args: unknown[]) => {
      people.push([name, ...args]);
    });
  Reflect.set(sdk, 'people', people);
  Reflect.set(sdk, 'init', (...args: unknown[]) => {
    initializations.push([...args, 'posthog']);
  });
  Reflect.set(window, 'posthog', sdk);
  return sdk;
}

function options(props: AnalyticsProps, script: HTMLScriptElement) {
  const config = script.dataset.config;
  return {
    api_host: props.posthogHost || 'https://phg-t.kongmy.dev',
    ui_host: props.posthogUiHost || 'https://eu.posthog.com',
    persistence: 'localStorage+cookie',
    opt_in_site_apps: false,
    autocapture: true,
    capture_pageview: true,
    opt_out_capturing_by_default: false,
    before_send: (event: unknown) => {
      const consent = getConsentStatus();
      return consent !== 'pending' &&
        consent.analytics &&
        Number(script.dataset.users) > 0 &&
        script.dataset.config === config
        ? event
        : null;
    },
  };
}

export function acquirePosthog(props: AnalyticsProps): () => void {
  const host = props.posthogHost || 'https://phg-t.kongmy.dev';
  const config = JSON.stringify([
    props.posthogToken,
    host,
    props.posthogUiHost || 'https://eu.posthog.com',
  ]);
  let script = document.querySelector<HTMLScriptElement>(
    'script[data-sapphire-posthog]',
  );
  assertCompatible(script, config);
  const initialize = !script || script.dataset.config !== config;
  if (!script) {
    script = sdkScript(
      `${host.replace('.i.posthog.com', '-assets.i.posthog.com').replace(/\/$/, '')}/static/array.js`,
    );
    script.dataset.sapphirePosthog = '';
    document.head.append(script);
  }
  script.dataset.config = config;
  const release = retain(script);
  const sdk = member(window, 'posthog') ?? stub();
  if (initialize)
    call({
      target: sdk,
      method: 'init',
      args: [props.posthogToken, options(props, script)],
    });
  call({ target: sdk, method: 'opt_in_capturing' });
  return () => {
    if (release())
      call({
        target: member(window, 'posthog'),
        method: 'opt_out_capturing',
        args: [{ clear_persistence: true }],
      });
  };
}

function assertCompatible(script: HTMLScriptElement | null, config: string) {
  if (
    script &&
    script.dataset.config !== config &&
    Number(script.dataset.users) > 0
  )
    throw new Error(
      'Analytics cannot mount conflicting PostHog configurations',
    );
}
