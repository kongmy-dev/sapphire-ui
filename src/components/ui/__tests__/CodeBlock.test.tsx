import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CodeBlock } from '../CodeBlock';

describe('CodeBlock', () => {
  it('renders the code and forwards language as data-lang', () => {
    const { container } = render(<CodeBlock code="const x = 1;" language="ts" />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    expect(container.querySelector('pre')).toHaveAttribute('data-lang', 'ts');
  });

  it('omits the copy button unless copyable is set', () => {
    render(<CodeBlock code="x" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  describe('copy interaction', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
      });
    });
    afterEach(() => vi.restoreAllMocks());

    it('copies the code and shows a transient "Copied!" label', async () => {
      render(<CodeBlock code="copy me" copyable />);

      fireEvent.click(screen.getByRole('button', { name: 'Copy code to clipboard' }));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
      // State flips once the writeText promise resolves (findBy awaits it).
      expect(await screen.findByRole('button', { name: 'Copied' })).toHaveTextContent('Copied!');
    });
  });
});
