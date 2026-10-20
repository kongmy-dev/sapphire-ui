'use client';

import { Button } from '../button/button.js';
import { ThemeToggle } from '../theme-toggle/theme-toggle.js';
import { ThemeProvider, useTheme } from './theme-provider.js';

function ThemeControls() {
  const { theme, preference, setTheme } = useTheme();
  return (
    <div className="sp-stack">
      <output>
        Theme: {theme}; preference: {preference}
      </output>
      <div className="sp-cluster">
        <Button onClick={() => setTheme('light')}>Use light theme</Button>
        <Button onClick={() => setTheme('dark')}>Use dark theme</Button>
        <Button onClick={() => setTheme('system')}>Use system theme</Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
function ThemeProviderPreferences() {
  return (
    <ThemeProvider>
      <ThemeControls />
    </ThemeProvider>
  );
}
export const examples = [
  { name: 'preferences', render: ThemeProviderPreferences },
] as const;
