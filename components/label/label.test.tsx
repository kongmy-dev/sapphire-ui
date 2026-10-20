import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './label.examples.js';
import { Label } from './label.js';

it('associates its control and forwards refs, class and size', async () => {
  const ref = createRef<HTMLLabelElement>();
  const { rerender } = render(
    <>
      <Label ref={ref} htmlFor="name" className="custom" size="lg" required>
        Name
      </Label>
      <input id="name" />
    </>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  expect(ref.current?.className).toBe('sp-label custom');
  expect(ref.current?.dataset.size).toBe('lg');
  expect(ref.current?.querySelector('span')?.getAttribute('aria-hidden')).toBe(
    'true',
  );
  await userEvent.click(screen.getByText('Name'));
  expect(document.activeElement).toBe(input);
  rerender(
    <Label ref={ref} size={null}>
      Optional
    </Label>,
  );
  expect(ref.current?.hasAttribute('data-size')).toBe(false);
  expect(ref.current?.querySelector('span')).toBeNull();
});

for (const { name, render: Example } of examples) {
  it(`renders the ${name} example with accessible controls`, () => {
    render(<Example />);
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
  });
}
