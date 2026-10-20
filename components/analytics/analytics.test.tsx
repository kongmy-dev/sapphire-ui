import { afterEach, expect, mock, test } from 'bun:test';
import { act, render } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { CONSENT_CHANGE_EVENT, setConsentStatus } from '../../lib/consent.js';
import { examples } from './analytics.examples.js';
import { Analytics } from './analytics.js';

const originalURL = window.location.href;
const cookieDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie');
const browserSettings = value(value(window, 'happyDOM'), 'settings');
const oldLoadingSetting = value(
  browserSettings,
  'handleDisabledFileLoadingAsSuccess',
);
const trackers = ['posthog', 'gtag', 'dataLayer', 'zaraz'];
const saved = trackers.map((name) => ({
  name,
  descriptor: Object.getOwnPropertyDescriptor(window, name),
}));

function value(target: unknown, name: string): unknown {
  if (
    (typeof target === 'object' && target !== null) ||
    typeof target === 'function'
  )
    return Reflect.get(target, name);
  return undefined;
}

function consent(analytics: boolean) {
  act(() => setConsentStatus({ analytics }));
}

function production() {
  window.location.href = 'https://example.com/';
  if (typeof browserSettings === 'object' && browserSettings !== null)
    Reflect.set(browserSettings, 'handleDisabledFileLoadingAsSuccess', true);
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    writable: true,
    value: '',
  });
  document.documentElement.removeAttribute('data-sapphire-consent');
  for (const name of trackers) Reflect.deleteProperty(window, name);
}

function initialization(): Record<string, unknown> {
  const initializations = value(value(window, 'posthog'), '_i');
  if (!Array.isArray(initializations) || !Array.isArray(initializations[0]))
    throw new Error('Missing PostHog initialization');
  const options: unknown = initializations[0][1];
  if (typeof options !== 'object' || options === null)
    throw new Error('Missing SDK options');
  return Object.fromEntries(Object.entries(options));
}

function restoreTrackers() {
  for (const item of saved) {
    if (item.descriptor)
      Object.defineProperty(window, item.name, item.descriptor);
    else Reflect.deleteProperty(window, item.name);
  }
}

afterEach(() => {
  document.dispatchEvent(new Event('sapphire-tracker-consent'));
  document.documentElement.removeAttribute('data-sapphire-consent');
  for (const script of document.querySelectorAll(
    'script[data-sapphire-analytics]',
  ))
    script.remove();
  for (const name of Object.getOwnPropertyNames(window).filter((name) =>
    name.startsWith('ga-disable-'),
  ))
    Reflect.deleteProperty(window, name);
  restoreTrackers();
  window.location.href = originalURL;
  if (cookieDescriptor)
    Object.defineProperty(document, 'cookie', cookieDescriptor);
  else Reflect.deleteProperty(document, 'cookie');
  if (typeof browserSettings === 'object' && browserSettings !== null)
    Reflect.set(
      browserSettings,
      'handleDisabledFileLoadingAsSuccess',
      oldLoadingSetting,
    );
});

test('SSR and pending or denied consent cause no SDK downloads', () => {
  production();
  expect(
    renderToString(<Analytics gaId="G-SSR" posthogToken="ph_test" />),
  ).toBe('');
  const view = render(<Analytics gaId="G-ONE" posthogToken="ph_test" />);
  expect(
    document.querySelectorAll('script[data-sapphire-analytics]'),
  ).toHaveLength(0);
  consent(false);
  expect(
    document.querySelectorAll('script[data-sapphire-analytics]'),
  ).toHaveLength(0);
  consent(true);
  expect(
    document.querySelectorAll('script[data-sapphire-analytics]'),
  ).toHaveLength(2);
  view.unmount();
});

test('Google loads once with linker settings, reuses shared mounts and disables after withdrawal', () => {
  production();
  consent(true);
  const one = render(
    <Analytics gaId="G-ONE" domains=" example.com, , shop.example.com " />,
  );
  const two = render(<Analytics gaId="G-ONE" />);
  expect(
    document.querySelectorAll('script[src*="googletagmanager"]'),
  ).toHaveLength(1);
  const layer = value(window, 'dataLayer');
  expect(layer).toContainEqual([
    'set',
    'linker',
    { domains: ['example.com', 'shop.example.com'] },
  ]);
  expect(layer).toContainEqual([
    'config',
    'G-ONE',
    { anonymize_ip: true, url_passthrough: true },
  ]);
  one.unmount();
  expect(value(window, 'ga-disable-G-ONE')).toBe(false);
  consent(false);
  expect(value(window, 'ga-disable-G-ONE')).toBe(true);
  consent(true);
  expect(value(window, 'ga-disable-G-ONE')).toBe(false);
  two.unmount();
  expect(value(window, 'ga-disable-G-ONE')).toBe(true);
  const commands = Array.isArray(layer) ? layer.length : 0;
  consent(true);
  expect(Array.isArray(layer) ? layer.length : 0).toBe(commands);
});

test('PostHog uses a native queue and blocks late events after withdrawal and unmount', () => {
  production();
  consent(true);
  const one = render(<Analytics posthogToken="ph_test" />);
  const two = render(<Analytics posthogToken="ph_test" />);
  expect(
    document.querySelectorAll('script[data-sapphire-posthog]'),
  ).toHaveLength(1);
  const people = value(value(window, 'posthog'), 'people');
  const setPerson = value(people, 'set');
  if (typeof setPerson !== 'function')
    throw new Error('Missing queued person properties');
  setPerson({ team: 'design' });
  expect(people).toContainEqual(['set', { team: 'design' }]);
  const options = initialization();
  expect(options).toMatchObject({
    api_host: 'https://phg-t.kongmy.dev',
    ui_host: 'https://eu.posthog.com',
    persistence: 'localStorage+cookie',
    capture_pageview: true,
  });
  const beforeSend = options.before_send;
  if (typeof beforeSend !== 'function')
    throw new Error('Missing event consent guard');
  const event = { event: 'pageview' };
  expect(beforeSend(event)).toBe(event);
  one.unmount();
  expect(beforeSend(event)).toBe(event);
  consent(false);
  expect(beforeSend(event)).toBeNull();
  expect(value(window, 'posthog')).toContainEqual([
    'opt_out_capturing',
    { clear_persistence: true },
  ]);
  consent(true);
  expect(beforeSend(event)).toBe(event);
  two.unmount();
  expect(beforeSend(event)).toBeNull();
});

test('existing SDKs receive consent and config without being replaced', () => {
  production();
  const gtag = mock(() => {});
  const init = mock(() => {});
  const optIn = mock(() => {});
  const optOut = mock(() => {});
  const sdk = {
    init,
    opt_in_capturing: optIn,
    opt_out_capturing: optOut,
    has_opted_out_capturing: () => false,
    set_config: mock(() => {}),
  };
  Reflect.set(window, 'gtag', gtag);
  Reflect.set(window, 'posthog', sdk);
  Reflect.set(window, 'dataLayer', []);
  consent(true);
  const view = render(
    <Analytics
      gaId="G-EXISTING"
      posthogToken="ph_existing"
      posthogHost="https://eu.i.posthog.com/"
      posthogUiHost="https://custom.example.com"
    />,
  );
  expect(value(window, 'gtag')).toBe(gtag);
  expect(value(window, 'posthog')).toBe(sdk);
  expect(init).toHaveBeenCalledTimes(1);
  expect(
    document.querySelector<HTMLScriptElement>('script[data-sapphire-posthog]')
      ?.src,
  ).toBe('https://eu-assets.i.posthog.com/static/array.js');
  expect(gtag).toHaveBeenCalledWith('config', 'G-EXISTING', {
    anonymize_ip: true,
    url_passthrough: true,
  });
  view.unmount();
  expect(optOut).toHaveBeenCalled();
});

test('Zaraz bypasses client Google and local domains disable all tracking', () => {
  production();
  consent(true);
  Reflect.set(window, 'zaraz', {});
  const view = render(<Analytics gaId="G-ZARAZ" />);
  expect(document.querySelectorAll('script')).toHaveLength(0);
  view.unmount();
  for (const host of ['localhost', '127.0.0.1', 'app.local']) {
    window.location.href = `http://${host}/`;
    const local = render(<Analytics gaId="G-LOCAL" posthogToken="ph_local" />);
    expect(document.querySelectorAll('script')).toHaveLength(0);
    local.unmount();
  }
});

test('changed configurations clean up old measurement and safely reuse loaded PostHog', () => {
  production();
  consent(true);
  const view = render(<Analytics gaId="G-OLD" posthogToken="ph_old" />);
  const oldBeforeSend = initialization().before_send;
  view.rerender(
    <Analytics
      gaId="G-NEW"
      posthogToken="ph_new"
      posthogHost="https://custom.example.com"
    />,
  );
  if (typeof oldBeforeSend !== 'function')
    throw new Error('Missing previous consent guard');
  expect(oldBeforeSend({ event: 'stale' })).toBeNull();
  expect(value(window, 'ga-disable-G-OLD')).toBe(true);
  expect(value(window, 'ga-disable-G-NEW')).toBe(false);
  const initializations = value(value(window, 'posthog'), '_i');
  expect(Array.isArray(initializations) ? initializations.length : 0).toBe(2);
  view.unmount();
});

test('conflicting simultaneous PostHog configurations fail before changing the active instance', () => {
  production();
  consent(true);
  const first = render(<Analytics posthogToken="ph_original" />);
  const sdk = value(window, 'posthog');
  const script = document.querySelector<HTMLScriptElement>(
    'script[data-sapphire-posthog]',
  );
  const configuration = script?.dataset.config;
  expect(() => render(<Analytics posthogToken="ph_conflict" />)).toThrow(
    'conflicting PostHog configurations',
  );
  expect(value(window, 'posthog')).toBe(sdk);
  expect(script?.dataset.config).toBe(configuration);
  expect(script?.dataset.users).toBe('1');
  first.unmount();
});

test('hostile optional SDK methods do not interrupt lifecycle cleanup', () => {
  production();
  consent(true);
  Reflect.set(window, 'posthog', {
    init: () => {
      throw new Error('blocked');
    },
    opt_in_capturing: () => {
      throw new Error('blocked');
    },
  });
  Reflect.set(window, 'gtag', () => {
    throw new Error('blocked');
  });
  const view = render(<Analytics posthogToken="ph_bad" gaId="G-BAD" />);
  expect(() => view.unmount()).not.toThrow();
});

for (const example of examples) {
  test(`example ${example.name} explains idle tracking without SDK traffic`, () => {
    production();
    const view = render(createElement(example.render));
    expect(view.container.textContent).toContain('consent');
    expect(document.querySelectorAll('script')).toHaveLength(0);
    act(() => document.dispatchEvent(new Event(CONSENT_CHANGE_EVENT)));
    view.unmount();
  });
}
