import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './icon-mark.examples.js';
import { IconMark } from './icon-mark.js';

test('preserves consumer SVG native refs classes and accessible naming', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <IconMark
      ref={ref}
      role="img"
      aria-label="Verified"
      className="custom"
      size="lg"
      variant="on-dark"
      icon={<svg aria-hidden="true" data-consumer="true" />}
    />,
  );
  const mark = screen.getByRole('img', { name: 'Verified' });
  expect<HTMLElement | null>(ref.current).toBe(mark);
  expect(mark.className).toBe('sp-icon-mark custom');
  expect(mark.getAttribute('data-variant')).toBe('on-dark');
  expect(mark.getAttribute('data-size')).toBe('lg');
  expect(mark.querySelector('[data-consumer="true"]')).not.toBeNull();
});

for (const example of examples) {
  test(`example ${example.name} renders its public content`, () => {
    const view = render(createElement(example.render));
    expect(view.container.firstElementChild).not.toBeNull();
    expect(view.container.querySelector('[data-slot]')).not.toBeNull();
  });
}
