import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './table-of-contents.examples.js';
import {
  TableOfContents,
  type TableOfContentsProps,
} from './table-of-contents.js';

it('renders no empty navigation', () => {
  render(<TableOfContents items={[]} />);
  expect(screen.queryByRole('navigation')).toBeNull();
});

it('preserves native props and ref and identifies only the current location', () => {
  const ref = createRef<HTMLElement>();
  const props = {
    items: [
      { id: 'intro', title: 'Introduction', level: 2 },
      { id: 'detail', title: 'Details', level: 3 },
    ],
    activeId: 'detail',
  } satisfies TableOfContentsProps;
  render(
    <TableOfContents
      {...props}
      ref={ref}
      className="custom"
      title="Sections"
    />,
  );
  expect(ref.current).toBe(
    screen.getByRole('navigation', { name: 'Table of Contents' }),
  );
  expect(ref.current?.className).toBe('sp-toc custom');
  expect(
    screen.getByRole('link', { name: 'Details' }).getAttribute('aria-current'),
  ).toBe('location');
  expect(
    screen
      .getByRole('link', { name: 'Introduction' })
      .hasAttribute('aria-current'),
  ).toBe(false);
});

for (const { name, render: Example } of examples)
  it(`renders ${name} destination links`, () => {
    render(<Example />);
    for (const link of screen.getAllByRole('link'))
      expect(link.getAttribute('href')).toMatch(/^#.+/);
  });
