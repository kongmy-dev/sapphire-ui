import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../Button';
import React from 'react';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="outline">Test</Button>);
    expect(container.firstChild).toHaveClass('border-[1.5px]');
  });

  it('forwards refs', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges custom className', () => {
    const { container } = render(<Button className="my-class">Test</Button>);
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('renders an icon if provided', () => {
    render(<Button icon="star">Favorite</Button>);
    expect(screen.getByText('star')).toHaveClass('material-symbols-outlined');
  });

  it('renders a loading spinner and disables the button', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    // testing internal DOM for spinner presence
    expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('supports asChild rendering', () => {
    render(
      <Button asChild>
        <a href="/link">Link Button</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/link');
  });
});
