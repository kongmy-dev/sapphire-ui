import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './stat.examples.js';
import { Stat } from './stat.js';

it('pairs labels and values semantically, preserves zero changes, description and refs', () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(
    <Stat
      ref={ref}
      className="custom"
      label="Users"
      value={42}
      change={0}
      changeDirection="down"
      description="Today"
      size="lg"
    />,
  );
  expect(ref.current?.className).toBe('sp-stat custom');
  expect(ref.current?.dataset.size).toBe('lg');
  expect(screen.getByText('Users').tagName).toBe('DT');
  expect(screen.getByText('42').closest('dd')).not.toBeNull();
  expect(screen.getByText('0').getAttribute('data-direction')).toBe('down');
  expect(screen.getByText('Today')).not.toBeNull();
  rerender(<Stat ref={ref} label="Users" value={42} change={null} />);
  expect(ref.current?.querySelector('.sp-stat-change')).toBeNull();
  expect(ref.current?.querySelector('.sp-stat-description')).toBeNull();
});

for (const { name, render: Example } of examples) {
  it(`renders ${name}`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-stat')).not.toBeNull();
  });
}
