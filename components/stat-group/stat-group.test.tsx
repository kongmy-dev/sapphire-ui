import { expect, it } from 'bun:test';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './stat-group.examples.js';
import { StatGroup } from './stat-group.js';

it('forwards refs, native attributes, children and column modifiers', () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(
    <StatGroup ref={ref} className="custom" cols={4} aria-label="Metrics">
      Metrics
    </StatGroup>,
  );
  expect(ref.current?.className).toBe('sp-stat-group custom');
  expect(ref.current?.dataset.cols).toBe('4');
  expect(ref.current?.getAttribute('aria-label')).toBe('Metrics');
  expect(ref.current?.textContent).toBe('Metrics');
  rerender(<StatGroup ref={ref} />);
  expect(ref.current?.dataset.cols).toBe('3');
});

for (const { name, render: Example } of examples) {
  it(`renders ${name}`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-stat-group')).not.toBeNull();
  });
}
