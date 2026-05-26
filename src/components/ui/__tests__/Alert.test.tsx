import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert } from '../Alert';

describe('Alert', () => {
  it('renders without crashing', () => {
    render(<Alert title="Alert Title">Alert Content</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert Content')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Alert variant="error">Error!</Alert>);
    expect(container.firstChild).toHaveClass('bg-(--color-error-bg)');
  });

  it('renders a custom icon', () => {
    render(<Alert icon="star">Custom icon</Alert>);
    expect(screen.getByText('star')).toBeInTheDocument();
  });
});
