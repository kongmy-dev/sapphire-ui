import { useEffect, useState, useContext } from 'react';
import { ThemeContext } from '../ThemeProvider';
import { Button, type ButtonProps } from './Button';
import { getTheme, setTheme, subscribeTheme, type Theme } from '../../lib/theme';

export interface ThemeToggleProps extends Omit<ButtonProps, 'onClick' | 'icon' | 'children'> {
  /** Optional custom class name */
  className?: string;
}

/**
 * A sleek theme toggle button component.
 * Works seamlessly within a `<ThemeProvider />` or in standalone/SSR environments
 * by automatically falling back to direct DOM/localStorage subscriptions.
 */
export function ThemeToggle({
  variant = 'ghost',
  size = 'icon',
  className,
  ...props
}: ThemeToggleProps) {
  const context = useContext(ThemeContext);
  const [mounted, setMounted] = useState(false);
  const [localTheme, setLocalTheme] = useState<Theme>(() => getTheme());

  useEffect(() => {
    setMounted(true);
    if (!context) {
      // If no context, subscribe to theme changes directly
      const unsubscribe = subscribeTheme(setLocalTheme);
      return unsubscribe;
    }
    return undefined;
  }, [context]);

  // Determine active theme and toggle function
  const activeTheme = context ? context.theme : localTheme;
  const toggleTheme = () => {
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
    if (context) {
      context.setTheme(nextTheme);
    } else {
      setTheme(nextTheme);
      setLocalTheme(getTheme());
    }
  };

  const nextModeLabel = activeTheme === 'dark' ? 'light' : 'dark';
  const iconName = !mounted ? 'dark_mode' : activeTheme === 'dark' ? 'light_mode' : 'dark_mode';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextModeLabel} theme`}
      icon={iconName}
      className={className}
      {...props}
    />
  );
}
