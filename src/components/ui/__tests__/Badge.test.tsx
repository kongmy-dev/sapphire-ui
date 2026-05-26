import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders without crashing', () => {
    const { container } = render(<Badge>Status</Badge>);
    expect(container.firstChild).toHaveTextContent('Status');
  });

  it('applies variant classes', () => {
    const { container } = render(<Badge variant="success">Pass</Badge>);
    expect(container.firstChild).toHaveClass('bg-(--color-success-bg)');
  });

  it('merges custom className', () => {
    const { container } = render(<Badge className="custom-badge">Tag</Badge>);
    expect(container.firstChild).toHaveClass('custom-badge');
  });
});
