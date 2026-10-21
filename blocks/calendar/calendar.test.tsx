import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Calendar } from './calendar.js';

it('preserves the calendar DOM and focus when navigation styling changes', () => {
  const month = new Date(2026, 0, 1);
  const view = render(<Calendar month={month} buttonVariant="ghost" />);
  const root = view.container.querySelector('[data-slot="calendar"]');
  const next = screen.getByRole('button', { name: /next month/i });
  next.focus();
  expect(next.dataset.variant).toBe('ghost');
  view.rerender(<Calendar month={month} buttonVariant="outline" />);
  expect(view.container.querySelector('[data-slot="calendar"]')).toBe(root);
  expect(screen.getByRole('button', { name: /next month/i })).toBe(next);
  expect(document.activeElement).toBe(next);
  expect(next.dataset.variant).toBe('outline');
});

it('keeps navigation variants local to each calendar', () => {
  render(
    <>
      <Calendar buttonVariant="outline" />
      <Calendar buttonVariant="ghost" />
    </>,
  );
  expect(
    screen
      .getAllByRole('button', { name: /next month/i })
      .map((button) => button.getAttribute('data-variant')),
  ).toEqual(['outline', 'ghost']);
});
