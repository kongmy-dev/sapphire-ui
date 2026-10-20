import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './container.examples.js';
import { Container } from './container.js';

test('preserves native refs style children and bounded layout modifiers', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Container
      ref={ref}
      maxWidth="md"
      padding="none"
      className="custom"
      style={{ maxWidth: '50%' }}
    >
      <form aria-label="Contact">
        <input aria-label="Email" />
      </form>
    </Container>,
  );
  expect(ref.current?.className).toBe('sp-container custom');
  expect(ref.current?.getAttribute('data-size')).toBe('md');
  expect(ref.current?.getAttribute('data-padding')).toBe('none');
  expect(ref.current?.style.maxWidth).toBe('50%');
  expect(screen.getByRole('form', { name: 'Contact' })).not.toBeNull();
});

for (const example of examples) {
  test(`example ${example.name} renders its public content`, () => {
    const view = render(createElement(example.render));
    expect(view.container.firstElementChild).not.toBeNull();
    expect(view.container.querySelector('[data-slot]')).not.toBeNull();
  });
}
