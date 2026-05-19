import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import {
  getTheme,
  getThemePreference,
  setTheme as setThemeImpl,
  subscribeTheme,
  type Theme,
  type ThemePreference,
} from '../lib/theme';

interface ThemeContextValue {
  /** The currently-applied theme (always 'light' or 'dark'; resolved from preference). */
  theme: Theme;
  /** The stored preference, which may be 'system'. */
  preference: ThemePreference;
  /** Change the preference. Persists to localStorage and updates the document. */
  setTheme: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  /** Initial preference when nothing is stored. Defaults to 'system'. */
  defaultPreference?: ThemePreference;
  children: ReactNode;
}

/**
 * Provides theme state and toggle helpers to descendants. On mount, applies
 * the stored preference (or `defaultPreference`) to `<html data-theme="...">`.
 * Listens for OS preference changes when preference is `'system'`.
 *
 * For Astro / vanilla usage, import the underlying helpers from
 * `@kongmy-dev/sapphire-ui` (`getTheme`, `setTheme`, `initTheme`,
 * `subscribeTheme`) directly — this provider is just a React convenience.
 */
export function ThemeProvider({ defaultPreference = 'system', children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => getTheme());
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const stored = getThemePreference();
    return stored === 'system' ? defaultPreference : stored;
  });

  useEffect(() => {
    setThemeImpl(preference);
    setTheme(getTheme());
  }, [preference]);

  useEffect(() => subscribeTheme(setTheme), []);

  const updatePreference = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, preference, setTheme: updatePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to read the current theme and change the preference. Must be used
 * inside a <ThemeProvider />. Throws otherwise so consumers get a clear
 * error instead of a silent no-op.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used inside <ThemeProvider />');
  }
  return ctx;
}
