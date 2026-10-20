import { afterEach, expect, test } from 'bun:test';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement, createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { setTheme } from '../../lib/theme.js';
import { examples } from './theme-toggle.examples.js';
import { ThemeToggle } from './theme-toggle.js';

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-theme-preference');
});

test('toggles standalone consumers together and preserves native refs and labels', () => {
  setTheme('light');
  const ref = createRef<HTMLButtonElement>();
  const view = render(
    <>
      <ThemeToggle ref={ref} className="custom" />
      <ThemeToggle aria-label="Custom theme control" />
    </>,
  );
  const toggle = screen.getByRole('button', { name: 'Switch to dark theme' });
  expect<HTMLElement | null>(ref.current).toBe(toggle);
  expect(toggle.className).toContain('sp-theme-toggle custom');
  fireEvent.click(toggle);
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(
    screen.getByRole('button', { name: 'Switch to light theme' }),
  ).not.toBeNull();
  expect(
    screen.getByRole('button', { name: 'Custom theme control' }),
  ).not.toBeNull();
  act(() => setTheme('light'));
  expect(
    screen.getByRole('button', { name: 'Switch to dark theme' }),
  ).not.toBeNull();
  view.unmount();
  act(() => setTheme('dark'));
  expect(screen.queryByRole('button')).toBeNull();
});

test('renders a stable server label without reading the browser theme', () => {
  setTheme('dark');
  expect(renderToString(<ThemeToggle />)).toContain('Switch to dark theme');
});

for (const example of examples) {
  test(`example ${example.name} synchronizes active controls and leaves disabled controls inert`, () => {
    render(createElement(example.render));
    const controls = screen.getAllByRole('button');
    const first = controls[0];
    if (first === undefined) throw new Error('Missing theme control');
    fireEvent.click(first);
    expect(
      controls.every(
        (control) =>
          control.getAttribute('aria-label') ===
          first.getAttribute('aria-label'),
      ),
    ).toBe(true);
    const disabled = controls.find((control) =>
      control.hasAttribute('disabled'),
    );
    if (disabled === undefined) throw new Error('Missing disabled control');
    const theme = document.documentElement.dataset.theme;
    fireEvent.click(disabled);
    expect(document.documentElement.dataset.theme).toBe(theme);
  });
}
