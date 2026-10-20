import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './passphrase-gate.examples.js';
import { PassphraseGate, type PassphraseGateProps } from './passphrase-gate.js';

it('preserves native ref and custom title and hides the gate when requested', () => {
  const ref = createRef<HTMLDivElement>();
  const props = {
    children: <input aria-label="Secret" />,
    title: 'Restricted',
  } satisfies PassphraseGateProps;
  const { rerender } = render(
    <PassphraseGate {...props} ref={ref} className="custom" />,
  );
  expect(ref.current?.className).toBe('sp-passphrase-gate custom');
  expect(screen.getByRole('heading', { name: 'Restricted' })).not.toBeNull();
  rerender(<PassphraseGate {...props} ref={ref} isHidden />);
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(ref.current?.hidden).toBe(true);
});

for (const { name, render: Example } of examples)
  it(`validates and unlocks ${name} then relocks`, async () => {
    render(<Example />);
    const input = screen.getByLabelText('Passphrase');
    await userEvent.type(input, 'wrong');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('alert').textContent).toContain(
      'Incorrect passphrase',
    );
    expect(input.getAttribute('aria-invalid')).toBe('true');
    await userEvent.clear(input);
    await userEvent.type(input, 'demo');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Document unlocked.')).not.toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Lock document' }),
    );
    expect(screen.getByRole('button', { name: 'Unlock' })).not.toBeNull();
  });
