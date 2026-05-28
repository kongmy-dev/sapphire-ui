// Framework-agnostic theming helper. Toggles `data-theme` on the document
// element so the CSS variable overrides in index.css (`:root[data-theme="dark"]`)
// take effect. Works in vanilla JS, Astro, and any React app — pair with the
// optional <ThemeProvider /> React component for declarative usage.

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'sapphire-theme';
const ATTRIBUTE = 'data-theme';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/** Resolve `'system'` against the user's OS preference. */
export function resolveSystemTheme(): Theme {
  if (!isBrowser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Read the user's stored preference, falling back to `'system'`. */
export function getThemePreference(): ThemePreference {
  if (!isBrowser) return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

/** Read the currently-applied theme (resolves `'system'` to light or dark). */
export function getTheme(): Theme {
  const pref = getThemePreference();
  return pref === 'system' ? resolveSystemTheme() : pref;
}

/** Apply a theme to the document and persist the preference. */
export function setTheme(preference: ThemePreference): void {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, preference);
  const applied = preference === 'system' ? resolveSystemTheme() : preference;
  document.documentElement.setAttribute(ATTRIBUTE, applied);
}

/**
 * Subscribe to theme changes. Fires when:
 *  - `setTheme()` is called from anywhere on the page.
 *  - The user's OS preference changes (only when preference is `'system'`).
 *
 * Returns an unsubscribe function.
 */
export function subscribeTheme(callback: (theme: Theme) => void): () => void {
  if (!isBrowser) return () => {};

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handleMedia = () => {
    if (getThemePreference() === 'system') callback(resolveSystemTheme());
  };
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback(getTheme());
  };

  mq.addEventListener('change', handleMedia);
  window.addEventListener('storage', handleStorage);
  return () => {
    mq.removeEventListener('change', handleMedia);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Apply the stored preference to the document. Call once at startup
 * (e.g. in a `<script>` tag before React hydrates) to avoid a flash of
 * the wrong theme on page load. Returns the applied theme.
 */
export function initTheme(): Theme {
  const applied = getTheme();
  if (isBrowser) document.documentElement.setAttribute(ATTRIBUTE, applied);
  return applied;
}

/**
 * Minified inline script that applies the stored theme before any paint,
 * preventing a flash of the wrong theme (FOUC). Intended for `<head>` use.
 *
 * Astro usage:
 * ```astro
 * ---
 * import { THEME_INIT_SCRIPT } from '@kongmy-dev/sapphire-ui';
 * ---
 * <script is:inline set:html={THEME_INIT_SCRIPT} />
 * ```
 */
export const THEME_INIT_SCRIPT =
  `(function(){var k='${STORAGE_KEY}',a='${ATTRIBUTE}',s=function(){return window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';},p;try{p=localStorage.getItem(k)}catch(e){}p=p==='light'||p==='dark'||p==='system'?p:'system';document.documentElement.setAttribute(a,p==='system'?s():p);})();`;
