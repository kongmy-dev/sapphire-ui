import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './radio-group.examples.js';
import { RadioGroup, RadioGroupItem } from './radio-group.js';

it('supports labels, description associations, refs and keyboard selection skipping disabled items', async () => {
  const ref = createRef<HTMLDivElement>();
  const item = createRef<HTMLButtonElement>();
  const change = mock((_value: string) => {});
  render(
    <RadioGroup
      ref={ref}
      className="custom"
      aria-label="Plan"
      defaultValue="free"
      onValueChange={change}
    >
      <RadioGroupItem
        ref={item}
        id="free"
        className="custom-item"
        value="free"
        label="Free"
        description="Personal use"
        aria-describedby="external"
      />
      <RadioGroupItem value="locked" label="Locked" disabled />
      <RadioGroupItem value="pro" label="Pro" />
    </RadioGroup>,
  );
  expect<HTMLElement | null>(ref.current).toBe(
    screen.getByRole('radiogroup', { name: 'Plan' }),
  );
  expect(ref.current?.className).toBe('sp-radio-group custom');
  const free = screen.getByRole('radio', { name: 'Free' });
  expect<HTMLElement | null>(item.current).toBe(free);
  expect(free.className).toBe('sp-radio-group-item custom-item');
  expect(free.getAttribute('aria-describedby')).toBe('external free-desc');
  free.focus();
  await userEvent.keyboard('{ArrowDown>}');
  await waitFor(() =>
    expect(
      screen.getByRole('radio', { name: 'Pro' }).getAttribute('aria-checked'),
    ).toBe('true'),
  );
  await userEvent.keyboard('{/ArrowDown}');
  expect(change).toHaveBeenCalledWith('pro');
  await userEvent.click(screen.getByText('Free'));
  expect(free.getAttribute('aria-checked')).toBe('true');
});

it('keeps controlled selection and respects group disabling', async () => {
  const change = mock((_value: string) => {});
  const { rerender } = render(
    <RadioGroup value="a" onValueChange={change}>
      <RadioGroupItem value="a" aria-label="A" />
      <RadioGroupItem value="b" aria-label="B" />
    </RadioGroup>,
  );
  await userEvent.click(screen.getByRole('radio', { name: 'B' }));
  expect(change).toHaveBeenCalledWith('b');
  expect(
    screen.getByRole('radio', { name: 'A' }).getAttribute('aria-checked'),
  ).toBe('true');
  rerender(
    <RadioGroup value="a" disabled onValueChange={change}>
      <RadioGroupItem value="a" aria-label="A" />
      <RadioGroupItem value="b" aria-label="B" />
    </RadioGroup>,
  );
  await userEvent.click(screen.getByRole('radio', { name: 'B' }));
  expect(change).toHaveBeenCalledTimes(1);
});

it('submits and resets the selected native form value', async () => {
  render(
    <form aria-label="Preferences">
      <RadioGroup name="plan" defaultValue="free">
        <RadioGroupItem value="free" label="Free" />
        <RadioGroupItem value="pro" label="Pro" />
      </RadioGroup>
    </form>,
  );
  const form = screen.getByRole('form');
  if (!(form instanceof HTMLFormElement)) throw new Error('Form missing');
  expect(new FormData(form).get('plan')).toBe('free');
  await userEvent.click(screen.getByRole('radio', { name: 'Pro' }));
  expect(new FormData(form).get('plan')).toBe('pro');
  fireEvent.reset(form);
  await waitFor(() =>
    expect(
      screen.getByRole('radio', { name: 'Free' }).getAttribute('aria-checked'),
    ).toBe('true'),
  );
  expect(new FormData(form).get('plan')).toBe('free');
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, async () => {
    render(<Example />);
    const radios = screen.getAllByRole('radio');
    const next = radios[1];
    if (!next) throw new Error('Radio missing');
    await userEvent.click(next);
    if (name === 'controlled')
      expect(screen.getByRole('status').textContent).toBe('annual');
  });
}
