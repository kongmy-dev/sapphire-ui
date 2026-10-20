import { expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './badge.examples.js';
import { Badge } from './badge.js';

it('preserves native attributes, refs and nullable variants', () => {
  const ref = createRef<HTMLSpanElement>();
  const { rerender } = render(
    <Badge ref={ref} className="custom" variant="brand" size="lg" role="status">
      Ready
    </Badge>,
  );
  expect<HTMLElement | null>(ref.current).toBe(screen.getByRole('status'));
  expect(ref.current?.className).toBe('sp-badge custom');
  expect(ref.current?.dataset.variant).toBe('brand');
  expect(ref.current?.dataset.size).toBe('lg');
  rerender(
    <Badge ref={ref} variant={null} size={null}>
      Ready
    </Badge>,
  );
  expect(ref.current?.hasAttribute('data-variant')).toBe(false);
  expect(ref.current?.hasAttribute('data-size')).toBe(false);
});

it('slots an accessible link with child-first handlers', async () => {
  const order: string[] = [];
  const clicked = mock(() => order.push('parent'));
  render(
    <Badge asChild onClick={clicked}>
      <a href="#ready" onClick={() => order.push('child')}>
        Ready details
      </a>
    </Badge>,
  );
  const link = screen.getByRole('link', { name: 'Ready details' });
  link.focus();
  await userEvent.keyboard('{Enter}');
  expect(order).toEqual(['child', 'parent']);
  expect(link.getAttribute('href')).toBe('#ready');
});

for (const { name, render: Example } of examples) {
  it(`renders ${name}`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-badge')).not.toBeNull();
  });
}
