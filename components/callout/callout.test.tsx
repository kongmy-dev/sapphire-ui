import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './callout.examples.js';
import { Callout, type CalloutProps } from './callout.js';

it('preserves native semantics, ref and nullable variants with optional content', () => {
  const ref = createRef<HTMLDivElement>();
  const props = {
    variant: null,
    title: <strong>Notice</strong>,
  } satisfies CalloutProps;
  render(
    <Callout {...props} ref={ref} className="custom" role="note">
      Read carefully.
    </Callout>,
  );
  expect<HTMLElement | null>(ref.current).toBe(screen.getByRole('note'));
  expect(ref.current?.className).toBe('sp-callout custom');
  expect(ref.current?.hasAttribute('data-variant')).toBe(false);
  expect(screen.getByText('Notice').tagName).toBe('STRONG');
  expect(screen.getByText('Read carefully.')).not.toBeNull();
});

for (const { name, render: Example } of examples)
  it(`renders ${name}`, () => {
    render(<Example />);
    if (name === 'notice')
      expect(screen.getByRole('link', { name: 'requirements' })).not.toBeNull();
    else expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
