'use client';

import { useContext, useEffect, useState } from 'react';
import {
  getTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from '../../lib/theme.js';
import { Button, type ButtonProps } from '../button/button.js';
import { ThemeContext } from '../theme-provider/theme-provider.js';

export type ThemeToggleProps = Omit<
  ButtonProps,
  'onClick' | 'icon' | 'children'
>;

export function ThemeToggle({
  variant = 'ghost',
  size = 'icon',
  className,
  ...props
}: ThemeToggleProps) {
  const context = useContext(ThemeContext);
  const hasProvider = context !== null;
  const [localTheme, setLocalTheme] = useState<Theme>('light');
  useEffect(() => {
    if (hasProvider) return;
    setLocalTheme(getTheme());
    return subscribeTheme(setLocalTheme);
  }, [hasProvider]);
  const theme = context?.theme ?? localTheme;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      className={['sp-theme-toggle', className].filter(Boolean).join(' ')}
      aria-label={props['aria-label'] ?? `Switch to ${nextTheme} theme`}
      onClick={() => {
        (context?.setTheme ?? setTheme)(nextTheme);
      }}
      icon={
        <svg
          className="sp-theme-toggle-icon sp-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {theme === 'dark' ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </>
          ) : (
            <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
          )}
        </svg>
      }
    />
  );
}
