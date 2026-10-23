import { expect, test } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { FormField } from '../../components/form-field/form-field.js';
import { Combobox } from './combobox.js';

const options = [
  { value: 'my', label: 'Malaysia' },
  { value: 'sg', label: 'Singapore' },
] as const;

function CountryForm() {
  const [value, setValue] = useState('');
  return (
    <form aria-label="Billing">
      <FormField
        label="Billing country"
        required
        hint="Used for tax"
        error={!value ? 'Choose a country' : undefined}
      >
        {({ controlProps }) => (
          <Combobox
            {...controlProps}
            options={options}
            name="country"
            value={value}
            onValueChange={setValue}
          />
        )}
      </FormField>
    </form>
  );
}

test('searches visible labels while submitting identifiers and clearing selection', async () => {
  render(<CountryForm />);
  const trigger = screen.getByRole('combobox', { name: 'Billing country' });
  expect(trigger.getAttribute('aria-required')).toBe('true');
  expect(trigger.getAttribute('aria-invalid')).toBe('true');
  const descriptions = trigger
    .getAttribute('aria-describedby')
    ?.split(' ')
    .map((id) => document.getElementById(id)?.textContent);
  expect(descriptions).toEqual(['Used for tax', 'Choose a country']);
  await userEvent.click(trigger);
  const search = screen.getByPlaceholderText('Search…');
  await userEvent.type(search, 'Malaysia');
  await waitFor(() =>
    expect(screen.queryByRole('option', { name: 'Singapore' })).toBeNull(),
  );
  await userEvent.click(screen.getByRole('option', { name: 'Malaysia' }));
  expect(trigger.textContent).toBe('Malaysia');
  expect(trigger.hasAttribute('aria-invalid')).toBe(false);
  const form = screen.getByRole('form', { name: 'Billing' });
  if (!(form instanceof HTMLFormElement))
    throw new Error('Billing form missing');
  expect(new FormData(form).get('country')).toBe('my');
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('option', { name: 'Malaysia' }));
  expect(new FormData(form).get('country')).toBe('');
});

test('forwards native trigger props, refs and disabled form state', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <form aria-label="Disabled">
      <Combobox
        ref={ref}
        options={options}
        id="country"
        aria-label="Country"
        className="custom"
        disabled
        name="country"
        value="sg"
      />
    </form>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Country' });
  expect<HTMLElement | null>(ref.current).toBe(trigger);
  expect(trigger.id).toBe('country');
  expect(trigger.classList.contains('custom')).toBe(true);
  expect(trigger.hasAttribute('disabled')).toBe(true);
  await userEvent.click(trigger);
  expect(screen.queryByRole('listbox')).toBeNull();
  const form = screen.getByRole('form');
  if (!(form instanceof HTMLFormElement))
    throw new Error('Disabled form missing');
  expect(new FormData(form).has('country')).toBe(false);
});

test('shows custom empty results and permits selection without a callback', async () => {
  render(
    <Combobox
      options={options}
      aria-label="Country"
      placeholder="Pick country"
      searchPlaceholder="Find country"
      emptyText="Nothing found"
    />,
  );
  const trigger = screen.getByRole('combobox', { name: 'Country' });
  await userEvent.click(trigger);
  await userEvent.type(screen.getByPlaceholderText('Find country'), 'missing');
  expect(await screen.findByText('Nothing found')).not.toBeNull();
  await userEvent.clear(screen.getByPlaceholderText('Find country'));
  await userEvent.click(screen.getByRole('option', { name: 'Singapore' }));
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});

test('associates the selected identifier with an external native form', () => {
  render(
    <>
      <form id="external-billing" aria-label="External billing" />
      <Combobox
        options={options}
        value="my"
        name="country"
        form="external-billing"
        aria-label="Country"
      />
    </>,
  );
  const form = screen.getByRole('form', { name: 'External billing' });
  if (!(form instanceof HTMLFormElement))
    throw new Error('External billing form missing');
  expect(new FormData(form).get('country')).toBe('my');
});
