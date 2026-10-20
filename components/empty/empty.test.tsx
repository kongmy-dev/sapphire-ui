import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './empty.examples.js';
import { Empty } from './empty.js';

test('renders descriptive content and preserves an actionable child', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Empty
      ref={ref}
      role="region"
      aria-label="Results"
      className="consumer"
      title="No items"
      description="Create one"
      icon={<svg />}
      action={<button type="button">Create</button>}
    />,
  );
  expect(ref.current).toBe(screen.getByRole('region', { name: 'Results' }));
  expect(screen.getByRole('heading', { name: 'No items' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
  expect(screen.getByText('Create one')).toBeTruthy();
});

test('renders the published message and action examples', () => {
  for (const { render: Example } of examples) {
    const view = render(<Example />);
    expect(screen.getByRole('heading')).toBeTruthy();
    view.unmount();
  }
});
