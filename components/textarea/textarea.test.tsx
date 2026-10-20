import { expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './textarea.examples.js';
import { Textarea } from './textarea.js';

it('preserves native attributes, callbacks, ref and uncontrolled editing', async () => {
  const ref = createRef<HTMLTextAreaElement>();
  const changed = mock(() => {});
  render(
    <Textarea
      ref={ref}
      className="custom"
      name="message"
      defaultValue="Start"
      aria-label="Message"
      required
      onChange={changed}
    />,
  );
  const field = screen.getByRole('textbox');
  expect<HTMLElement | null>(ref.current).toBe(field);
  expect(field.className).toBe('sp-textarea custom');
  expect(field.getAttribute('name')).toBe('message');
  expect(field.hasAttribute('required')).toBe(true);
  await userEvent.type(field, ' end');
  expect(ref.current?.value).toBe('Start end');
  expect(changed).toHaveBeenCalled();
});

it('supports variants, sizes, invalid and busy state with nullable modifiers', () => {
  const { rerender } = render(
    <Textarea
      variant="mono"
      size="lg"
      aria-label="Message"
      aria-invalid="true"
      aria-busy="true"
      aria-describedby="help"
    />,
  );
  const field = screen.getByRole('textbox');
  expect(field.dataset.variant).toBe('mono');
  expect(field.dataset.size).toBe('lg');
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(field.getAttribute('aria-busy')).toBe('true');
  expect(field.getAttribute('aria-describedby')).toBe('help');
  rerender(<Textarea variant={null} size={null} aria-label="Message" />);
  expect(field.hasAttribute('data-variant')).toBe(false);
  expect(field.hasAttribute('data-size')).toBe(false);
});

it('retains controlled values and prevents disabled or readonly edits', async () => {
  const ref = createRef<HTMLTextAreaElement>();
  const { rerender } = render(
    <Textarea
      ref={ref}
      value="Controlled"
      onChange={() => {}}
      aria-label="Message"
    />,
  );
  await userEvent.type(screen.getByRole('textbox'), ' ignored');
  expect(ref.current?.value).toBe('Controlled');
  rerender(
    <Textarea
      ref={ref}
      disabled
      defaultValue="Disabled"
      aria-label="Message"
    />,
  );
  await userEvent.type(screen.getByRole('textbox'), ' ignored');
  expect(ref.current?.value).toBe('Controlled');
  rerender(
    <Textarea ref={ref} readOnly value="Read only" aria-label="Message" />,
  );
  await userEvent.type(screen.getByRole('textbox'), ' ignored');
  expect(ref.current?.value).toBe('Read only');
});

for (const { name, render: Example } of examples) {
  it(`renders the ${name} example`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-textarea')).not.toBeNull();
  });
}

it('updates the controlled example through typing', async () => {
  const example = examples.find((item) => item.name === 'controlled');
  if (!example) throw new Error('Controlled example missing');
  const Example = example.render;
  render(<Example />);
  await userEvent.type(screen.getByRole('textbox'), 'alex@example.com');
  expect(screen.getByRole('status').textContent).toBe('alex@example.com');
});
