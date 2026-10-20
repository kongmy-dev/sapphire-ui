import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { examples } from './prose.examples.js';

for (const { name, render: Example } of examples)
  it(`renders accessible ${name} content`, () => {
    render(<Example />);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(
      screen.getByRole('heading', { name: 'Design for clarity' }),
    ).not.toBeNull();
  });
