import { afterEach, expect, test } from 'bun:test';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { setTheme } from '../../lib/theme.js';
import { examples } from './theme-provider.examples.js';
import { ThemeProvider, useTheme } from './theme-provider.js';

const storageDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'localStorage',
);
afterEach(() => {
  if (storageDescriptor !== undefined)
    Object.defineProperty(window, 'localStorage', storageDescriptor);
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-theme-preference');
});
function Consumer() {
  const { theme, preference, setTheme: change } = useTheme();
  return (
    <>
      <output>
        {theme}/{preference}
      </output>
      <button type="button" onClick={() => change('light')}>
        Light
      </button>
    </>
  );
}

test('applies defaults after hydration and synchronizes same-tab and storage changes', () => {
  const view = render(
    <ThemeProvider defaultPreference="dark">
      <Consumer />
    </ThemeProvider>,
  );
  expect(screen.getByRole('status').textContent).toBe('dark/dark');
  fireEvent.click(screen.getByRole('button', { name: 'Light' }));
  expect(screen.getByRole('status').textContent).toBe('light/light');
  act(() => setTheme('dark'));
  expect(screen.getByRole('status').textContent).toBe('dark/dark');
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'sapphire-theme',
        newValue: 'system',
      }),
    ),
  );
  expect(screen.getByRole('status').textContent).toContain('/system');
  view.unmount();
  act(() => setTheme('light'));
  expect(screen.queryByRole('status')).toBeNull();
});

test('respects an explicitly stored system preference and tolerates private storage', () => {
  localStorage.setItem('sapphire-theme', 'system');
  const view = render(
    <ThemeProvider defaultPreference="dark">
      <Consumer />
    </ThemeProvider>,
  );
  expect(screen.getByRole('status').textContent).toContain('/system');
  view.unmount();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme-preference');
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Denied');
    },
  });
  render(
    <ThemeProvider defaultPreference="dark">
      <Consumer />
    </ThemeProvider>,
  );
  expect(screen.getByRole('status').textContent).toBe('dark/dark');
});

test('renders a stable server fallback and fails clearly outside a provider', () => {
  expect(
    renderToString(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    ),
  ).toContain('light');
  expect(() => renderToString(<Consumer />)).toThrow(
    'useTheme() must be used inside <ThemeProvider />',
  );
});

for (const example of examples) {
  test(`example ${example.name} changes every supported preference`, () => {
    render(createElement(example.render));
    for (const preference of ['light', 'dark', 'system']) {
      fireEvent.click(
        screen.getByRole('button', { name: `Use ${preference} theme` }),
      );
      expect(screen.getByRole('status').textContent).toContain(
        `preference: ${preference}`,
      );
    }
    fireEvent.click(screen.getByRole('button', { name: /Switch to/ }));
    expect(screen.getByRole('status').textContent).not.toContain(
      'preference: system',
    );
  });
}
