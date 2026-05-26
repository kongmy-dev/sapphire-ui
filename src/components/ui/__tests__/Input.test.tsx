import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';
import React from 'react';

describe('Input', () => {
  it('renders without crashing', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Input variant="mono" />);
    expect(container.firstChild).toHaveClass('font-mono');
  });

  it('forwards refs', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('handles user input', async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} data-testid="input" />);
    
    const input = screen.getByTestId('input');
    await userEvent.type(input, 'hello');
    
    expect(input).toHaveValue('hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });
});
