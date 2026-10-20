import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './checkbox.examples.js';
import { Checkbox } from './checkbox.js';

it('supports label activation, descriptions, refs and Space toggling', async () => {
  const ref = createRef<HTMLButtonElement>();
  const change = mock((_value: boolean | 'indeterminate') => {});
  render(
    <>
      <p id="external">External help</p>
      <Checkbox
        ref={ref}
        id="terms"
        className="custom"
        label="Terms"
        description="Read carefully"
        aria-describedby="external"
        onCheckedChange={change}
      />
    </>,
  );
  const checkbox = screen.getByRole('checkbox', { name: 'Terms' });
  expect<HTMLElement | null>(ref.current).toBe(checkbox);
  expect(checkbox.className).toBe('sp-checkbox custom');
  expect(checkbox.getAttribute('aria-describedby')).toBe('external terms-desc');
  expect(document.getElementById('terms-desc')?.textContent).toBe(
    'Read carefully',
  );
  await userEvent.click(screen.getByText('Terms'));
  expect(checkbox.getAttribute('aria-checked')).toBe('true');
  checkbox.focus();
  await userEvent.keyboard(' ');
  expect(checkbox.getAttribute('aria-checked')).toBe('false');
  expect(change.mock.calls).toEqual([[true], [false]]);
});

it('keeps controlled mixed state and ignores disabled activation', async () => {
  const change = mock((_value: boolean | 'indeterminate') => {});
  const { rerender } = render(
    <Checkbox
      checked="indeterminate"
      aria-label="Mixed"
      onCheckedChange={change}
    />,
  );
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
  await userEvent.click(checkbox);
  expect(change).toHaveBeenCalledWith(true);
  expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
  rerender(
    <Checkbox
      checked={false}
      disabled
      aria-label="Mixed"
      onCheckedChange={change}
    />,
  );
  await userEvent.click(checkbox);
  expect(change).toHaveBeenCalledTimes(1);
  expect(checkbox.getAttribute('aria-checked')).toBe('false');
});

it('submits its native form value and resets uncontrolled checked state', async () => {
  render(
    <form aria-label="Preferences">
      <Checkbox
        name="terms"
        value="accepted"
        defaultChecked
        label="Terms"
        required
      />
    </form>,
  );
  const form = screen.getByRole('form');
  if (!(form instanceof HTMLFormElement)) throw new Error('Form missing');
  expect(new FormData(form).get('terms')).toBe('accepted');
  await userEvent.click(screen.getByRole('checkbox'));
  expect(new FormData(form).has('terms')).toBe(false);
  fireEvent.reset(form);
  await waitFor(() =>
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe(
      'true',
    ),
  );
  expect(new FormData(form).get('terms')).toBe('accepted');
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, async () => {
    render(<Example />);
    const checkbox = screen.getAllByRole('checkbox')[0];
    if (!checkbox) throw new Error('Checkbox missing');
    await userEvent.click(checkbox);
    if (name === 'controlled') {
      expect(screen.getByRole('status').textContent).toBe('true');
      await userEvent.click(
        screen.getByRole('button', { name: 'Reset mixed selection' }),
      );
      expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
    }
  });
}
