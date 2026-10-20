import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './select.examples.js';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select.js';

function Options() {
  return (
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Plans</SelectLabel>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="locked" disabled>
          Locked
        </SelectItem>
      </SelectGroup>
      <SelectSeparator />
    </SelectContent>
  );
}

it('opens by keyboard, selects an item, calls back and returns focus', async () => {
  const change = mock((_value: string) => {});
  render(
    <Select defaultValue="free" onValueChange={change}>
      <SelectTrigger aria-label="Plan">
        <SelectValue />
      </SelectTrigger>
      <Options />
    </Select>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Plan' });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByRole('listbox')).not.toBeNull();
  expect(
    screen
      .getByRole('option', { name: 'Locked' })
      .getAttribute('aria-disabled'),
  ).toBe('true');
  await userEvent.click(screen.getByRole('option', { name: 'Pro' }));
  expect(change).toHaveBeenCalledWith('pro');
  expect(trigger.textContent).toContain('Pro');
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it('supports controlled values, placeholder, nullable trigger size and disabled state', async () => {
  const change = mock((_value: string) => {});
  const { rerender } = render(
    <Select value="" onValueChange={change}>
      <SelectTrigger size={null} aria-label="Plan">
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
      <Options />
    </Select>,
  );
  const trigger = screen.getByRole('combobox');
  expect(trigger.textContent).toContain('Choose');
  expect(trigger.hasAttribute('data-size')).toBe(false);
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  await userEvent.click(screen.getByRole('option', { name: 'Pro' }));
  expect(change).toHaveBeenCalledWith('pro');
  expect(trigger.textContent).toContain('Choose');
  rerender(
    <Select disabled value="free" onValueChange={change}>
      <SelectTrigger aria-label="Plan">
        <SelectValue />
      </SelectTrigger>
      <Options />
    </Select>,
  );
  await userEvent.click(trigger);
  expect(screen.queryByRole('listbox')).toBeNull();
  expect(change).toHaveBeenCalledTimes(1);
});

it('preserves refs, classes and content composition attributes', async () => {
  const trigger = createRef<HTMLButtonElement>();
  const content = createRef<HTMLDivElement>();
  const item = createRef<HTMLDivElement>();
  const label = createRef<HTMLDivElement>();
  const separator = createRef<HTMLDivElement>();
  const value = createRef<HTMLSpanElement>();
  render(
    <Select defaultOpen defaultValue="free">
      <SelectTrigger ref={trigger} className="custom" aria-label="Plan">
        <SelectValue ref={value} className="value" />
      </SelectTrigger>
      <SelectContent ref={content} position="item-aligned" className="content">
        <SelectGroup>
          <SelectLabel ref={label} className="label">
            Plans
          </SelectLabel>
          <SelectItem ref={item} className="item" value="free">
            Free
          </SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
        </SelectGroup>
        <SelectSeparator ref={separator} className="separator" />
      </SelectContent>
    </Select>,
  );
  expect(trigger.current?.className).toBe('sp-select-trigger custom');
  expect(content.current?.className).toBe('sp-select-content content');
  expect(item.current?.className).toBe('sp-select-item item');
  expect(label.current?.className).toBe('sp-select-label label');
  expect(separator.current?.className).toBe('sp-select-separator separator');
  expect(value.current?.className).toBe('sp-select-value value');
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
});

it('submits and resets its native form value', async () => {
  render(
    <form aria-label="Preferences">
      <Select name="plan" defaultValue="free">
        <SelectTrigger aria-label="Plan">
          <SelectValue />
        </SelectTrigger>
        <Options />
      </Select>
    </form>,
  );
  const form = screen.getByRole('form');
  if (!(form instanceof HTMLFormElement)) throw new Error('Form missing');
  expect(new FormData(form).get('plan')).toBe('free');
  screen.getByRole('combobox').focus();
  await userEvent.keyboard('{Enter}');
  await userEvent.click(screen.getByRole('option', { name: 'Pro' }));
  expect(new FormData(form).get('plan')).toBe('pro');
  fireEvent.reset(form);
  await waitFor(() =>
    expect(screen.getByRole('combobox').textContent).toContain('Free'),
  );
  expect(new FormData(form).get('plan')).toBe('free');
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, async () => {
    render(<Example />);
    const trigger = screen.getAllByRole('combobox')[0];
    if (!trigger) throw new Error('Select missing');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(screen.getByRole('option', { name: 'Pro' }));
    if (name === 'controlled')
      expect(screen.getByRole('status').textContent).toBe('pro');
  });
}
