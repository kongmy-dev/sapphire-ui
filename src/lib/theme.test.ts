import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resolveSystemTheme,
  getThemePreference,
  getTheme,
  setTheme,
  subscribeTheme,
  initTheme,
  THEME_INIT_SCRIPT,
} from './theme';

const STORAGE_KEY = 'sapphire-theme';

/** Point window.matchMedia at a fixed `prefers-color-scheme: dark` result. */
function stubPrefersDark(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as typeof window.matchMedia;
}

describe('theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    stubPrefersDark(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('resolveSystemTheme', () => {
    it('returns dark when the OS prefers dark', () => {
      stubPrefersDark(true);
      expect(resolveSystemTheme()).toBe('dark');
    });

    it('returns light when the OS prefers light', () => {
      stubPrefersDark(false);
      expect(resolveSystemTheme()).toBe('light');
    });
  });

  describe('getThemePreference', () => {
    it('defaults to "system" when nothing is stored', () => {
      expect(getThemePreference()).toBe('system');
    });

    it('returns a valid stored preference', () => {
      window.localStorage.setItem(STORAGE_KEY, 'dark');
      expect(getThemePreference()).toBe('dark');
    });

    it('falls back to "system" for an invalid stored value', () => {
      window.localStorage.setItem(STORAGE_KEY, 'banana');
      expect(getThemePreference()).toBe('system');
    });
  });

  describe('getTheme', () => {
    it('resolves "system" against the OS preference', () => {
      stubPrefersDark(true);
      expect(getTheme()).toBe('dark');
    });

    it('returns the explicit preference verbatim', () => {
      window.localStorage.setItem(STORAGE_KEY, 'light');
      stubPrefersDark(true); // should be ignored
      expect(getTheme()).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('persists the preference and applies the resolved theme to the document', () => {
      setTheme('dark');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('resolves "system" to the OS theme when applying', () => {
      stubPrefersDark(true);
      setTheme('system');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('system');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('initTheme', () => {
    it('applies the stored preference and returns the resolved theme', () => {
      window.localStorage.setItem(STORAGE_KEY, 'dark');
      expect(initTheme()).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('subscribeTheme', () => {
    it('fires the callback on a cross-tab storage change and detaches on unsubscribe', () => {
      const cb = vi.fn();
      window.localStorage.setItem(STORAGE_KEY, 'light');
      const unsubscribe = subscribeTheme(cb);

      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenLastCalledWith('light');

      unsubscribe();
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
      expect(cb).toHaveBeenCalledTimes(1); // no further calls after unsubscribe
    });

    it('ignores storage events for unrelated keys', () => {
      const cb = vi.fn();
      subscribeTheme(cb);
      window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }));
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('THEME_INIT_SCRIPT', () => {
    it('is a self-invoking IIFE referencing the storage key and attribute', () => {
      expect(THEME_INIT_SCRIPT).toContain(STORAGE_KEY);
      expect(THEME_INIT_SCRIPT).toContain('data-theme');
      expect(THEME_INIT_SCRIPT.trim().startsWith('(function()')).toBe(true);
    });
  });
});
