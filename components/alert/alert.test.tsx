import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './alert.examples.js';
import { Alert } from './alert.js';

test('announces alert content and preserves native attributes classes and refs', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Alert ref={ref} title="Saved" className="custom" aria-label="Update">
      Your changes are safe.
    </Alert>,
  );
  const alert = screen.getByRole('alert', { name: 'Update' });
  expect<HTMLElement | null>(ref.current).toBe(alert);
  expect(alert.className).toBe('sp-alert custom');
  expect(screen.getByText('Saved')).not.toBeNull();
  expect(screen.getByText('Your changes are safe.')).not.toBeNull();
  expect(alert.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
});

test('accepts null base variants custom icons and caller role overrides', () => {
  render(
    <Alert variant={null} role="status" icon={<svg data-custom="true" />}>
      Ready
    </Alert>,
  );
  const alert = screen.getByRole('status');
  expect(alert.hasAttribute('data-variant')).toBe(false);
  expect(alert.querySelector('[data-custom="true"]')).not.toBeNull();
});
for (const { name, render: Example } of examples) {
  test(`renders the ${name} alert example with meaningful content`, () => {
    render(<Example />);
    expect(
      screen.getAllByRole('alert').every((alert) => alert.textContent !== ''),
    ).toBe(true);
  });
}
