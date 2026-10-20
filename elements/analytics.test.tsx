import { afterEach, expect, test } from 'bun:test';
import { act, render, within } from '@testing-library/react';
import { Analytics } from '../components/analytics/analytics.js';
import { getConsentStatus, setConsentStatus } from '../lib/consent.js';
import { examples } from './analytics.examples.js';
import { AnalyticsElement } from './analytics.js';

const originalURL = window.location.href;
const happyDOM: unknown = Reflect.get(window, 'happyDOM');
const settings: unknown =
  typeof happyDOM === 'object' && happyDOM !== null
    ? Reflect.get(happyDOM, 'settings')
    : undefined;
const originalLoading =
  typeof settings === 'object' && settings !== null
    ? Reflect.get(settings, 'handleDisabledFileLoadingAsSuccess')
    : undefined;
const cookie = Object.getOwnPropertyDescriptor(document, 'cookie');
const names = ['gtag', 'dataLayer', 'posthog', 'zaraz'];
const saved = names.map((name) => ({
  name,
  descriptor: Object.getOwnPropertyDescriptor(window, name),
}));
function restoreGlobals() {
  for (const item of saved) {
    if (item.descriptor)
      Object.defineProperty(window, item.name, item.descriptor);
    else Reflect.deleteProperty(window, item.name);
  }
}

afterEach(() => {
  for (const element of document.querySelectorAll(
    'sapphire-analytics, [data-analytics-example]',
  ))
    element.remove();
  document.documentElement.removeAttribute('data-sapphire-consent');
  for (const script of document.querySelectorAll(
    'script[data-sapphire-analytics]',
  ))
    script.remove();
  restoreGlobals();
  for (const name of Object.getOwnPropertyNames(window).filter((name) =>
    name.startsWith('ga-disable-'),
  ))
    Reflect.deleteProperty(window, name);
  window.location.href = originalURL;
  if (typeof settings === 'object' && settings !== null)
    Reflect.set(
      settings,
      'handleDisabledFileLoadingAsSuccess',
      originalLoading,
    );
  if (cookie) Object.defineProperty(document, 'cookie', cookie);
  else Reflect.deleteProperty(document, 'cookie');
});
function analytics() {
  window.location.href = 'https://example.com';
  if (typeof settings === 'object' && settings !== null)
    Reflect.set(settings, 'handleDisabledFileLoadingAsSuccess', true);
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    writable: true,
    value: '',
  });
  if (!AnalyticsElement) throw new Error('Missing browser constructor');
  return new AnalyticsElement();
}

test('registers and shares consent, withdrawal and multimount SDK ownership with React', () => {
  const element = analytics();
  element.setAttribute('ga-id', 'G-SHARED');
  document.body.append(element);
  const react = render(<Analytics gaId="G-SHARED" />);
  expect(customElements.get('sapphire-analytics')).toBe(AnalyticsElement);
  expect(element.childElementCount).toBe(0);
  expect(react.container.childElementCount).toBe(0);
  expect(
    document.querySelectorAll('script[data-sapphire-analytics]'),
  ).toHaveLength(0);
  act(() => setConsentStatus({ analytics: true }));
  expect(
    document.querySelectorAll('script[data-sapphire-analytics]'),
  ).toHaveLength(1);
  expect(document.querySelector('script')?.dataset.users).toBe('2');
  element.remove();
  expect(Reflect.get(window, 'ga-disable-G-SHARED')).toBe(false);
  act(() => setConsentStatus({ analytics: false }));
  expect(Reflect.get(window, 'ga-disable-G-SHARED')).toBe(true);
  react.unmount();
});

test('observes configuration changes and reconnects without duplicate SDKs or consent listeners', () => {
  const element = analytics();
  setConsentStatus({ analytics: true });
  element.setAttribute('ga-id', 'G-OLD');
  element.setAttribute('posthog-token', 'ph_test');
  element.setAttribute('domains', 'example.com');
  document.body.append(element);
  expect(
    document.querySelectorAll('script[data-sapphire-analytics]'),
  ).toHaveLength(2);
  element.setAttribute('ga-id', 'G-NEW');
  expect(Reflect.get(window, 'ga-disable-G-OLD')).toBe(true);
  expect(Reflect.get(window, 'ga-disable-G-NEW')).toBe(false);
  element.setAttribute('posthog-host', 'https://custom.example.com');
  element.setAttribute('posthog-ui-host', 'https://ui.example.com');
  element.remove();
  expect(Reflect.get(window, 'ga-disable-G-NEW')).toBe(true);
  element.setAttribute('ga-id', 'G-RECONNECTED');
  expect(Reflect.has(window, 'ga-disable-G-RECONNECTED')).toBe(false);
  document.body.append(element);
  expect(Reflect.get(window, 'ga-disable-G-RECONNECTED')).toBe(false);
  expect(
    document.querySelectorAll('script[src*="G-RECONNECTED"]'),
  ).toHaveLength(1);
  element.remove();
  const layer: unknown = Reflect.get(window, 'dataLayer');
  const count = Array.isArray(layer) ? layer.length : 0;
  setConsentStatus({ analytics: false });
  expect(Array.isArray(layer) ? layer.length : 0).toBe(count);
});

for (const example of examples)
  test(`native analytics example ${example.name}`, () => {
    analytics();
    const root = example.render();
    root.setAttribute('data-analytics-example', '');
    document.body.append(root);
    within(root).getByRole('button', { name: 'Allow analytics' }).click();
    expect(getConsentStatus()).toEqual({ analytics: true });
    within(root).getByRole('button', { name: 'Withdraw analytics' }).click();
    expect(getConsentStatus()).toEqual({ analytics: false });
    expect(
      document.querySelectorAll('script[data-sapphire-analytics]'),
    ).toHaveLength(0);
  });
