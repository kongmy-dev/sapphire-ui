import { expect, it } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Input } from '../input/input.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select/select.js';
import { examples } from './form-field.examples.js';
import { FormField } from './form-field.js';

it('associates generated labels, required controls, hints and root refs', async () => {
  const ref = createRef<HTMLDivElement>();
  const control = createRef<HTMLInputElement>();
  render(
    <FormField
      ref={ref}
      className="custom"
      label="Email"
      hint="Work email"
      required
    >
      <Input ref={control} type="email" />
    </FormField>,
  );
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(ref.current?.className).toBe('sp-form-field custom');
  expect<HTMLElement | null>(control.current).toBe(input);
  expect(input.hasAttribute('required')).toBe(true);
  expect(
    document.getElementById(input.getAttribute('aria-describedby') ?? '')
      ?.textContent,
  ).toBe('Work email');
  await userEvent.click(screen.getByText('Email'));
  expect(document.activeElement).toBe(input);
});

it('keeps child identity, required and invalid state and merges descriptions', () => {
  render(
    <>
      <p id="existing">Existing description</p>
      <FormField id="wrapper-id" label="Name" hint="Hint">
        <Input
          id="child-id"
          required
          aria-invalid="grammar"
          aria-describedby="existing child-id-hint existing"
        />
      </FormField>
    </>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  expect(input.id).toBe('child-id');
  expect(input.getAttribute('aria-describedby')).toBe('existing child-id-hint');
  expect(input.getAttribute('aria-invalid')).toBe('grammar');
  expect(input.hasAttribute('required')).toBe(true);
  expect(screen.getByText('Name').getAttribute('for')).toBe('child-id');
});

it('uses explicit ids and retains help with errors and caller descriptions', () => {
  const { rerender } = render(
    <FormField id="email" label="Email" hint="Hint" error="Invalid">
      <Input aria-describedby="external email-hint email-error external" />
    </FormField>,
  );
  const input = screen.getByRole('textbox');
  expect(input.id).toBe('email');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-describedby')).toBe(
    'external email-hint email-error',
  );
  expect(screen.getByText('Hint')).not.toBeNull();
  rerender(
    <FormField id="email" hint="Hint">
      <Input aria-describedby="external" />
    </FormField>,
  );
  expect(input.getAttribute('aria-describedby')).toBe('external email-hint');
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  rerender(
    <FormField id="email">
      <Input />
    </FormField>,
  );
  expect(input.hasAttribute('aria-describedby')).toBe(false);
});

for (const { name, render: Example } of examples) {
  it(`renders the ${name} example`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-form-field')).not.toBeNull();
  });
}

it('announces validation errors and restores the hint after correcting the value', () => {
  const example = examples.find((item) => item.name === 'validation');
  if (!example) throw new Error('Validation example missing');
  const Example = example.render;
  render(<Example />);
  const input = screen.getByRole('textbox', { name: 'Validated email' });
  fireEvent.change(input, { target: { value: 'invalid' } });
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByText('Enter an email with @.')).not.toBeNull();
  fireEvent.change(input, { target: { value: 'alex@example.com' } });
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  expect(screen.getByText('Use your work email.')).not.toBeNull();
});

it('connects a compound select label, required state and both descriptions to its actual trigger', async () => {
  render(
    <FormField
      label="Country"
      required
      hint="Choose your billing country"
      error="Country is required"
    >
      {({ controlProps, required }) => (
        <Select required={required} name="country">
          <SelectTrigger {...controlProps}>
            <SelectValue placeholder="Choose country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="my">Malaysia</SelectItem>
          </SelectContent>
        </Select>
      )}
    </FormField>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Country' });
  expect(trigger.getAttribute('aria-required')).toBe('true');
  expect(trigger.getAttribute('aria-invalid')).toBe('true');
  const descriptions = trigger
    .getAttribute('aria-describedby')
    ?.split(' ')
    .map((id) => document.getElementById(id)?.textContent);
  expect(descriptions).toEqual([
    'Choose your billing country',
    'Country is required',
  ]);
  await userEvent.click(screen.getByText('Country'));
  expect(screen.getByRole('option', { name: 'Malaysia' })).not.toBeNull();
});

it('supports an optional render child without descriptions or errors', () => {
  render(
    <FormField label="Code">
      {({ controlProps, required }) => (
        <button type="button" {...controlProps}>
          {required ? 'Required' : 'Optional'}
        </button>
      )}
    </FormField>,
  );
  const control = screen.getByRole('button', { name: 'Code' });
  expect(control.textContent).toBe('Optional');
  expect(control.hasAttribute('aria-describedby')).toBe(false);
  expect(control.hasAttribute('aria-invalid')).toBe(false);
  expect(control.hasAttribute('aria-required')).toBe(false);
});
