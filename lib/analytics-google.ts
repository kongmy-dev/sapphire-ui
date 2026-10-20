import type { AnalyticsOptions } from './analytics.js';
import { call, member, retain, sdkScript } from './analytics-sdk.js';

function configure(props: AnalyticsOptions) {
  const dataLayer: unknown[] = [];
  if (!Array.isArray(member(window, 'dataLayer')))
    Reflect.set(window, 'dataLayer', dataLayer);
  if (typeof member(window, 'gtag') !== 'function')
    Reflect.set(window, 'gtag', (...args: unknown[]) => {
      call({
        target: member(window, 'dataLayer'),
        method: 'push',
        args: [args],
      });
    });
  call({
    target: window,
    method: 'gtag',
    args: [
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      },
    ],
  });
  call({ target: window, method: 'gtag', args: ['js', new Date()] });
  const domains =
    props.domains
      ?.split(',')
      .map((domain) => domain.trim())
      .filter(Boolean) ?? [];
  if (domains.length)
    call({
      target: window,
      method: 'gtag',
      args: ['set', 'linker', { domains }],
    });
  call({
    target: window,
    method: 'gtag',
    args: ['config', props.gaId, { anonymize_ip: true, url_passthrough: true }],
  });
}

export function acquireGoogle(props: AnalyticsOptions): () => void {
  const key = `ga-disable-${props.gaId}`;
  const source = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(props.gaId ?? '')}`;
  let script = Array.from(document.scripts).find(
    (script) => script.src === source,
  );
  if (!script) {
    configure(props);
    script = sdkScript(source);
    document.head.append(script);
  }
  Reflect.set(window, key, false);
  const release = retain(script);
  return () => {
    if (release()) Reflect.set(window, key, true);
  };
}
