import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './page-header.examples.js';
import { PageHeader } from './page-header.js';

test('renders a semantic title with optional breadcrumbs, description and actions', () => {
  const ref = createRef<HTMLElement>();
  render(
    <PageHeader
      ref={ref}
      className="custom"
      title={<span>Invoices</span>}
      description="Track outstanding payments"
      breadcrumbs={<nav aria-label="Breadcrumb">Accounts</nav>}
      actions={<button type="button">Create invoice</button>}
    >
      <p>Four invoices pending</p>
    </PageHeader>,
  );
  expect(
    screen.getByRole('heading', { level: 1, name: 'Invoices' }),
  ).not.toBeNull();
  expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Create invoice' })).not.toBeNull();
  expect(screen.getByText('Track outstanding payments')).not.toBeNull();
  expect(screen.getByText('Four invoices pending')).not.toBeNull();
  expect(ref.current?.className).toBe('sp-page-header custom');
});

test('allows a title without optional content', () => {
  const { container } = render(<PageHeader title="Settings" />);
  expect(screen.getByRole('heading', { name: 'Settings' })).not.toBeNull();
  expect(container.querySelector('.sp-page-header-actions')).toBeNull();
  expect(container.querySelector('.sp-page-header-description')).toBeNull();
  expect(container.querySelector('.sp-page-header-breadcrumbs')).toBeNull();
});

for (const { name, render: Example } of examples) {
  test(`renders the ${name} example`, () => {
    render(<Example />);
    expect(screen.getByRole('heading', { level: 1 })).not.toBeNull();
  });
}
