import { expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './chip.examples.js';
import { Chip } from './chip.js';

it('preserves native props, leading content, refs and nullable variants', () => {
  const ref = createRef<HTMLSpanElement>();
  const { rerender } = render(
    <Chip
      ref={ref}
      className="custom"
      variant="brand"
      size="lg"
      leading={<svg aria-label="Approved" />}
    >
      Design
    </Chip>,
  );
  expect(ref.current?.className).toBe('sp-chip custom');
  expect(ref.current?.dataset.variant).toBe('brand');
  expect(ref.current?.dataset.size).toBe('lg');
  expect(screen.getByLabelText('Approved')).not.toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
  rerender(
    <Chip ref={ref} variant={null} size={null}>
      Design
    </Chip>,
  );
  expect(ref.current?.hasAttribute('data-variant')).toBe(false);
  expect(ref.current?.hasAttribute('data-size')).toBe(false);
});

it('dismisses with a localized keyboard-accessible button and does not submit a form', async () => {
  const dismiss = mock(() => {});
  const submit = mock((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Chip onDismiss={dismiss} dismissLabel="Buang reka bentuk">
        Design
      </Chip>
    </form>,
  );
  screen.getByRole('button', { name: 'Buang reka bentuk' }).focus();
  await userEvent.keyboard('{Enter}');
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, async () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-chip')).not.toBeNull();
    if (name === 'dismissible') {
      await userEvent.click(
        screen.getByRole('button', { name: 'Remove design filter' }),
      );
      expect(screen.queryByText('Design')).toBeNull();
      await userEvent.click(
        screen.getByRole('button', { name: 'Restore filter' }),
      );
      expect(screen.getByText('Design')).not.toBeNull();
    }
  });
}
