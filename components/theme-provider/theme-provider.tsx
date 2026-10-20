'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getThemePreference,
  setTheme,
  subscribeTheme,
  type Theme,
  type ThemePreference,
} from '../../lib/theme.js';

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (preference: ThemePreference) => void;
};
export const ThemeContext = createContext<ThemeContextValue | null>(null);
export type ThemeProviderProps = {
  defaultPreference?: ThemePreference | undefined;
  children: ReactNode;
};

export function ThemeProvider({
  defaultPreference = 'system',
  children,
}: ThemeProviderProps) {
  const [state, setState] = useState<{
    theme: Theme;
    preference: ThemePreference;
  }>({ theme: 'light', preference: defaultPreference });
  useEffect(() => {
    const unsubscribe = subscribeTheme((theme) =>
      setState({ theme, preference: getThemePreference() }),
    );
    setTheme(getThemePreference(defaultPreference));
    return unsubscribe;
  }, [defaultPreference]);
  return (
    <ThemeContext.Provider value={{ ...state, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null)
    throw new Error('useTheme() must be used inside <ThemeProvider />');
  return context;
}
