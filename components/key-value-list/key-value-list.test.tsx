import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { examples } from './key-value-list.examples.js';

for (const { name, render: Example } of examples)
  it(`renders accessible ${name} content`, () => {
    render(<Example />);
    expect(screen.getAllByRole('term')).toHaveLength(3);
    expect(screen.getAllByRole('definition')).toHaveLength(3);
  });
