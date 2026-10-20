import { afterEach, expect, test } from 'bun:test';
import {
  getTheme,
  getThemePreference,
  initTheme,
  resolveSystemTheme,
  setTheme,
  subscribeTheme,
  THEME_INIT_SCRIPT,
} from './theme.js';

const originalMedia = window.matchMedia;
const storageDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'localStorage',
);
const media = originalMedia('(prefers-color-scheme: dark)');
const configureSystem = (dark: boolean) => {
  Object.defineProperty(media, 'matches', { configurable: true, value: dark });
  window.matchMedia = () => media;
};
const storage = (
  key: string | null,
  newValue: string | null,
  storageArea: Storage | null = null,
) =>
  window.dispatchEvent(
    new StorageEvent('storage', { key, newValue, storageArea }),
  );

afterEach(() => {
  if (storageDescriptor !== undefined)
    Object.defineProperty(window, 'localStorage', storageDescriptor);
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-theme-preference');
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: originalMedia,
  });
});

test('reads valid stored preferences and falls back to the current system for invalid values', () => {
  configureSystem(true);
  for (const value of ['invalid', 'system']) {
    localStorage.setItem('sapphire-theme', value);
    expect(getThemePreference()).toBe('system');
    expect(getTheme()).toBe('dark');
  }
  localStorage.setItem('sapphire-theme', 'light');
  expect(getTheme()).toBe('light');
  expect(initTheme()).toBe('light');
  expect(document.documentElement.dataset.theme).toBe('light');
});

test('notifies every same tab subscriber once and removes listeners on unsubscribe', () => {
  const first: string[] = [];
  const second: string[] = [];
  const stop = subscribeTheme((theme) => first.push(theme));
  const stopSecond = subscribeTheme((theme) => second.push(theme));
  setTheme('dark');
  expect(first).toEqual(['dark']);
  expect(second).toEqual(['dark']);
  expect(localStorage.getItem('sapphire-theme')).toBe('dark');
  expect(getTheme()).toBe('dark');
  stop();
  stopSecond();
  setTheme('light');
  expect(first).toEqual(['dark']);
});

test('tracks system changes only for the system preference and applies the new theme', () => {
  configureSystem(false);
  const themes: string[] = [];
  const stop = subscribeTheme((theme) => themes.push(theme));
  setTheme('light');
  configureSystem(true);
  media.dispatchEvent(new Event('change'));
  expect(themes).toEqual(['light']);
  setTheme('system');
  configureSystem(false);
  media.dispatchEvent(new Event('change'));
  expect(themes).toEqual(['light', 'dark', 'light']);
  expect(document.documentElement.dataset.theme).toBe('light');
  stop();
});

test('tracks cross tab preferences removals and storage clear while ignoring unrelated storage', () => {
  configureSystem(false);
  const themes: string[] = [];
  const stop = subscribeTheme((theme) => themes.push(theme));
  storage('unrelated', 'dark');
  storage('sapphire-theme', 'dark', sessionStorage);
  expect(themes).toEqual([]);
  storage('sapphire-theme', 'dark', localStorage);
  expect(getThemePreference()).toBe('dark');
  storage('sapphire-theme', null);
  storage(null, null);
  expect(themes).toEqual(['dark', 'light', 'light']);
  stop();
});

test('private storage cannot prevent applying and notifying an explicit in memory preference', () => {
  configureSystem(false);
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Private storage');
    },
  });
  expect(getThemePreference()).toBe('system');
  const themes: string[] = [];
  const stop = subscribeTheme((theme) => themes.push(theme));
  setTheme('dark');
  expect(themes).toEqual(['dark']);
  expect(getThemePreference()).toBe('dark');
  expect(getTheme()).toBe('dark');
  storage('sapphire-theme', 'light', sessionStorage);
  expect(themes).toEqual(['dark']);
  stop();
});

test('the startup script agrees with helpers and validates persisted preferences', () => {
  configureSystem(true);
  localStorage.setItem('sapphire-theme', 'dark');
  new Function(THEME_INIT_SCRIPT)();
  expect(getThemePreference()).toBe('dark');
  expect(document.documentElement.dataset.theme).toBe('dark');
  localStorage.removeItem('sapphire-theme');
  new Function(THEME_INIT_SCRIPT)();
  expect(getThemePreference()).toBe('system');
  expect(getTheme()).toBe('dark');
});

test('missing matchMedia falls back to light and subscriptions still notify', () => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: undefined,
  });
  expect(resolveSystemTheme()).toBe('light');
  const themes: string[] = [];
  const stop = subscribeTheme((theme) => themes.push(theme));
  setTheme('system');
  expect(themes).toEqual(['light']);
  stop();
});

test('theme helpers execute without browser globals', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: undefined,
  });
  try {
    expect(getThemePreference()).toBe('system');
    expect(getTheme()).toBe('light');
    expect(initTheme()).toBe('light');
    setTheme('dark');
    subscribeTheme(() => {
      throw new Error('Cannot notify during SSR');
    })();
  } finally {
    if (descriptor !== undefined)
      Object.defineProperty(globalThis, 'window', descriptor);
  }
});

test('the startup script tolerates denied storage and still applies the system theme', () => {
  configureSystem(true);
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Denied');
    },
  });
  new Function(THEME_INIT_SCRIPT)();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(getThemePreference()).toBe('system');
});

test('uses an explicit fallback only when no valid preference has been applied or stored', () => {
  expect(getThemePreference('dark')).toBe('dark');
  localStorage.setItem('sapphire-theme', 'invalid');
  expect(getThemePreference('light')).toBe('light');
  localStorage.setItem('sapphire-theme', 'system');
  expect(getThemePreference('dark')).toBe('system');
  setTheme('light');
  expect(getThemePreference('dark')).toBe('light');
});
