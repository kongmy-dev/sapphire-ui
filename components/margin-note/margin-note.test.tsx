import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './margin-note.examples.js';
import { MarginNote, type MarginNoteProps } from './margin-note.js';

it('provides a keyboard reachable reference to one descriptive note', async () => {
  const ref = createRef<HTMLSpanElement>();
  const props = {
    id: 'terms-note',
    note: 'Terms apply.',
    children: 'Read terms',
  } satisfies MarginNoteProps;
  render(<MarginNote {...props} ref={ref} className="custom" />);
  const link = screen.getByRole('link', { name: 'Read terms' });
  expect(ref.current?.className).toBe('sp-margin-note custom');
  expect(link.getAttribute('aria-describedby')).toBe('terms-note');
  expect(link.getAttribute('href')).toBe('#terms-note');
  expect(screen.getAllByText('Terms apply.')).toHaveLength(1);
  await userEvent.tab();
  expect(document.activeElement).toBe(link);
  await userEvent.keyboard('{Enter}');
  expect(screen.getByText('Terms apply.').id).toBe('terms-note');
});

for (const { name, render: Example } of examples)
  it(`exposes ${name} without duplicate descriptions`, () => {
    render(<Example />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    for (const link of links) {
      const id = link.getAttribute('aria-describedby');
      expect(id ? document.getElementById(id)?.textContent : '').not.toBe('');
    }
  });
