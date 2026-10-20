export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'sapphire-theme';
const ATTRIBUTE = 'data-theme';
const PREFERENCE_ATTRIBUTE = 'data-theme-preference';
const CHANGE_EVENT = 'sapphire-theme-change';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const isBrowser = () =>
  typeof window !== 'undefined' && typeof document !== 'undefined';
const isPreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';
const preferenceOf = (value: unknown): ThemePreference =>
  isPreference(value) ? value : 'system';

function storedPreference(fallback: ThemePreference): ThemePreference {
  try {
    const value: unknown = window.localStorage.getItem(STORAGE_KEY);
    return isPreference(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function mediaQuery(): MediaQueryList | null {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(MEDIA_QUERY);
}

export function resolveSystemTheme(): Theme {
  return mediaQuery()?.matches ? 'dark' : 'light';
}

export function getThemePreference(
  fallback: ThemePreference = 'system',
): ThemePreference {
  if (!isBrowser()) return fallback;
  const applied = document.documentElement.getAttribute(PREFERENCE_ATTRIBUTE);
  return isPreference(applied) ? applied : storedPreference(fallback);
}

export function getTheme(): Theme {
  const preference = getThemePreference();
  return preference === 'system' ? resolveSystemTheme() : preference;
}

function applyPreference(preference: ThemePreference): Theme {
  const theme = preference === 'system' ? resolveSystemTheme() : preference;
  document.documentElement.setAttribute(PREFERENCE_ATTRIBUTE, preference);
  document.documentElement.setAttribute(ATTRIBUTE, theme);
  return theme;
}

function persistPreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    return;
  }
}

export function setTheme(preference: ThemePreference): void {
  if (!isBrowser()) return;
  applyPreference(preference);
  persistPreference(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function isThemeStorage(event: StorageEvent): boolean {
  if (event.key !== null && event.key !== STORAGE_KEY) return false;
  if (event.storageArea === null) return true;
  try {
    return event.storageArea === window.localStorage;
  } catch {
    return false;
  }
}

export function subscribeTheme(callback: (theme: Theme) => void): () => void {
  if (!isBrowser()) return () => {};
  const media = mediaQuery();
  const changed = () => callback(getTheme());
  const systemChanged = () => {
    if (getThemePreference() === 'system') callback(applyPreference('system'));
  };
  const storageChanged = (event: StorageEvent) => {
    if (isThemeStorage(event))
      callback(applyPreference(preferenceOf(event.newValue)));
  };
  media?.addEventListener('change', systemChanged);
  window.addEventListener('storage', storageChanged);
  window.addEventListener(CHANGE_EVENT, changed);
  return () => {
    media?.removeEventListener('change', systemChanged);
    window.removeEventListener('storage', storageChanged);
    window.removeEventListener(CHANGE_EVENT, changed);
  };
}

export function initTheme(): Theme {
  return isBrowser() ? applyPreference(getThemePreference()) : 'light';
}

export const THEME_INIT_SCRIPT = `(function(){var k='${STORAGE_KEY}',a='${ATTRIBUTE}',r='${PREFERENCE_ATTRIBUTE}',p;try{p=window.localStorage.getItem(k)}catch(e){}p=p==='light'||p==='dark'||p==='system'?p:'system';document.documentElement.setAttribute(r,p);document.documentElement.setAttribute(a,p==='system'?(window.matchMedia&&window.matchMedia('${MEDIA_QUERY}').matches?'dark':'light'):p);})();`;
