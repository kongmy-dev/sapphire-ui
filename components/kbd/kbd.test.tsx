import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './kbd.examples.js';
import { Kbd } from './kbd.js';

test('renders semantic keyboard input with native refs classes and size', () => {
  const ref = createRef<HTMLElement>();
  render(
    <Kbd ref={ref} size="lg" className="custom" title="Escape key">
      Esc
    </Kbd>,
  );
  const key = screen.getByText('Esc');
  expect<HTMLElement | null>(ref.current).toBe(key);
  expect(key.tagName).toBe('KBD');
  expect(key.getAttribute('data-size')).toBe('lg');
  expect(key.className).toBe('sp-kbd custom');
  expect(key.title).toBe('Escape key');
});

for (const example of examples) {
  test(`example ${example.name} contains semantic key labels`, () => {
    const view = render(createElement(example.render));
    expect(view.container.querySelectorAll('kbd').length).toBeGreaterThan(0);
    expect(view.container.textContent).not.toBe('');
  });
}
