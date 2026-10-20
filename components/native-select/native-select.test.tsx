import { expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './native-select.examples.js';
import { NativeSelect } from './native-select.js';

it('supports native selection, callbacks, ref and option disabling', async () => {
  const ref = createRef<HTMLSelectElement>();
  const change = mock(() => {});
  render(
    <NativeSelect
      ref={ref}
      className="custom"
      name="plan"
      required
      aria-label="Plan"
      defaultValue="free"
      onChange={change}
    >
      <option value="free">Free</option>
      <option value="pro">Pro</option>
      <option value="locked" disabled>
        Locked
      </option>
    </NativeSelect>,
  );
  const select = screen.getByRole('combobox');
  expect<HTMLElement | null>(ref.current).toBe(select);
  expect(select.className).toBe('sp-native-select custom');
  expect(select.getAttribute('name')).toBe('plan');
  expect(select.hasAttribute('required')).toBe(true);
  await userEvent.selectOptions(select, 'pro');
  expect(ref.current?.value).toBe('pro');
  expect(change).toHaveBeenCalledTimes(1);
  await userEvent.selectOptions(select, 'locked');
  expect(ref.current?.value).toBe('pro');
});

it('supports controlled and disabled values, nullable variants, native multiple and aria state', async () => {
  const ref = createRef<HTMLSelectElement>();
  const { rerender } = render(
    <NativeSelect
      ref={ref}
      aria-label="Plan"
      value="free"
      onChange={() => {}}
      variant="on-dark"
      size="sm"
      aria-invalid="true"
      aria-describedby="help"
      aria-busy="true"
    >
      <option value="free">Free</option>
      <option value="pro">Pro</option>
    </NativeSelect>,
  );
  const select = screen.getByRole('combobox');
  await userEvent.selectOptions(select, 'pro');
  expect(ref.current?.value).toBe('free');
  expect(select.dataset.variant).toBe('on-dark');
  expect(select.dataset.size).toBe('sm');
  expect(select.getAttribute('aria-invalid')).toBe('true');
  expect(select.getAttribute('aria-describedby')).toBe('help');
  expect(select.getAttribute('aria-busy')).toBe('true');
  rerender(
    <NativeSelect
      ref={ref}
      disabled
      aria-label="Plan"
      variant={null}
      size={null}
    >
      <option value="free">Free</option>
      <option value="pro">Pro</option>
    </NativeSelect>,
  );
  await userEvent.selectOptions(select, 'pro');
  expect(ref.current?.value).toBe('free');
  expect(select.hasAttribute('data-variant')).toBe(false);
  expect(select.hasAttribute('data-size')).toBe(false);
  rerender(
    <NativeSelect ref={ref} multiple aria-label="Plans" defaultValue={['free']}>
      <option value="free">Free</option>
      <option value="pro">Pro</option>
    </NativeSelect>,
  );
  await userEvent.selectOptions(screen.getByRole('listbox'), ['free', 'pro']);
  expect(ref.current?.selectedOptions.length).toBe(2);
});

for (const { name, render: Example } of examples) {
  it(`renders the ${name} example`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('select')).not.toBeNull();
  });
}

it('updates the controlled example from a native choice', async () => {
  const example = examples.find((item) => item.name === 'controlled');
  if (!example) throw new Error('Controlled example missing');
  const Example = example.render;
  render(<Example />);
  await userEvent.selectOptions(screen.getByRole('combobox'), 'pro');
  expect(screen.getByText('pro')).not.toBeNull();
});
