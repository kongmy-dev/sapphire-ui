import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './separator.examples.js';
import { Separator } from './separator.js';

it('distinguishes decorative and semantic orientations while preserving refs and native props', () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(<Separator ref={ref} className="custom" />);
  expect(ref.current?.className).toBe('sp-separator custom');
  expect(screen.queryByRole('separator')).toBeNull();
  rerender(
    <Separator
      ref={ref}
      orientation="vertical"
      decorative={false}
      aria-label="Section boundary"
    />,
  );
  expect<HTMLElement | null>(ref.current).toBe(
    screen.getByRole('separator', { name: 'Section boundary' }),
  );
  expect(ref.current?.getAttribute('aria-orientation')).toBe('vertical');
  expect(ref.current?.dataset.orientation).toBe('vertical');
});

it('supports a slotted semantic element', () => {
  render(
    <Separator asChild decorative={false}>
      <hr />
    </Separator>,
  );
  expect(screen.getByRole('separator').tagName).toBe('HR');
});

for (const { name, render: Example } of examples) {
  it(`renders ${name}`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-separator')).not.toBeNull();
  });
}
