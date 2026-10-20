import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './spinner.examples.js';
import { Spinner } from './spinner.js';

test('announces the supplied loading status and forwards native props and ref', () => {
  const ref = createRef<HTMLSpanElement>();
  render(
    <Spinner
      ref={ref}
      label="Saving profile"
      size="lg"
      tone="brand"
      className="consumer"
    />,
  );
  const spinner = screen.getByRole('status', { name: 'Saving profile' });
  expect(ref.current).toBe(spinner);
  expect(spinner.className).toContain('consumer');
});

test('renders every published spinner with an accessible status name', () => {
  for (const { render: Example } of examples) {
    const view = render(<Example />);
    for (const status of screen.getAllByRole('status'))
      expect(status.getAttribute('aria-label')).toBeTruthy();
    view.unmount();
  }
});
