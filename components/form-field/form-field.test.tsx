import { expect, it } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Input } from '../input/input.js';
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

it('uses explicit ids and swaps error over hint without dropping caller descriptions', () => {
  const { rerender } = render(
    <FormField id="email" label="Email" hint="Hint" error="Invalid">
      <Input aria-describedby="external" />
    </FormField>,
  );
  const input = screen.getByRole('textbox');
  expect(input.id).toBe('email');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-describedby')).toBe('external email-error');
  expect(screen.queryByText('Hint')).toBeNull();
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
