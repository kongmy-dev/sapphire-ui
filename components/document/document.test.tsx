import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { examples } from './document.examples.js';

for (const { name, render: Example } of examples)
  it(`renders accessible ${name} content`, () => {
    render(<Example />);
    expect(
      screen.getByRole('heading', { name: 'Cloud migration' }),
    ).not.toBeNull();
    expect(screen.getByRole('region', { name: 'Scope' })).not.toBeNull();
  });
