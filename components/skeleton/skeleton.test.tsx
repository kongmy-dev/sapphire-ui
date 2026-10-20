import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './skeleton.examples.js';
import { Skeleton } from './skeleton.js';

test('keeps placeholders out of the accessibility tree and forwards the ref', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Skeleton
      ref={ref}
      role="img"
      aria-label="Placeholder"
      variant="circle"
      size="sm"
      className="consumer"
    />,
  );
  expect(screen.queryByRole('img')).toBeNull();
  expect(ref.current).toBe(screen.getByRole('img', { hidden: true }));
  expect(ref.current?.className).toContain('consumer');
});

test('renders every published placeholder example', () => {
  for (const { render: Example } of examples) {
    const view = render(<Example />);
    expect(view.container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    view.unmount();
  }
});
