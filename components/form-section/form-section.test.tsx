import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './form-section.examples.js';
import { FormSection } from './form-section.js';

test('groups controls under a legend and links both descriptions', () => {
  const ref = createRef<HTMLFieldSetElement>();
  render(
    <>
      <p id="help">Required for billing</p>
      <FormSection
        ref={ref}
        className="custom"
        legend="Business details"
        description="Shown on invoices"
        aria-describedby="help"
      >
        <input aria-label="Name" />
      </FormSection>
    </>,
  );
  const group = screen.getByRole('group', { name: 'Business details' });
  expect<HTMLElement | null>(ref.current).toBe(group);
  expect(group.className).toBe('sp-form-section custom');
  const descriptions = group
    .getAttribute('aria-describedby')
    ?.split(' ')
    .map((id) => document.getElementById(id)?.textContent);
  expect(descriptions).toEqual(['Required for billing', 'Shown on invoices']);
  expect(screen.getByRole('textbox', { name: 'Name' })).not.toBeNull();
});

test('preserves native disabled grouping and omits absent description', () => {
  render(
    <FormSection legend="Locked details" disabled>
      <input aria-label="Account" />
    </FormSection>,
  );
  const group = screen.getByRole('group', { name: 'Locked details' });
  expect(group.hasAttribute('disabled')).toBe(true);
  expect(group.hasAttribute('aria-describedby')).toBe(false);
});

for (const { name, render: Example } of examples) {
  test(`renders the ${name} example`, () => {
    render(<Example />);
    expect(screen.getByRole('group')).not.toBeNull();
  });
}
