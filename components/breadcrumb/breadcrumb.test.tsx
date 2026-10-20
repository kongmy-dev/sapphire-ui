import { expect, test } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, createRef } from 'react';
import { examples } from './breadcrumb.examples.js';
import { Breadcrumb } from './breadcrumb.js';

test('renders an ordered named trail with only its final item marked current', async () => {
  const ref = createRef<HTMLElement>();
  render(
    <Breadcrumb
      ref={ref}
      className="custom"
      items={[
        { label: 'Home', href: '#home' },
        { label: 'Section' },
        { label: 'Current', href: '#current' },
      ]}
    />,
  );
  const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
  expect<HTMLElement | null>(ref.current).toBe(nav);
  expect(nav.className).toBe('sp-breadcrumb custom');
  expect(screen.getAllByRole('link').length).toBe(1);
  expect(screen.getByText('Current').getAttribute('aria-current')).toBe('page');
  expect(screen.getByText('Section').hasAttribute('aria-current')).toBe(false);
  expect(
    screen
      .getAllByText('/')
      .every((separator) => separator.getAttribute('aria-hidden') === 'true'),
  ).toBe(true);
  await userEvent.tab();
  expect(document.activeElement).toBe(
    screen.getByRole('link', { name: 'Home' }),
  );
  fireEvent.click(screen.getByRole('link'));
});

test('supports an empty trail without inventing a current page', () => {
  render(<Breadcrumb items={[]} />);
  expect(screen.getByRole('list').children.length).toBe(0);
});

for (const example of examples) {
  test(`example ${example.name} exposes its navigation contract`, () => {
    render(createElement(example.render));
    expect(screen.getByRole('navigation')).not.toBeNull();
    if (example.name === 'navigation') {
      fireEvent.click(screen.getByRole('link', { name: 'Projects' }));
      expect(screen.getByText('Destination: #projects')).not.toBeNull();
    }
  });
}
