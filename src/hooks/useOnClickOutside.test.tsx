import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useOnClickOutside } from './useOnClickOutside';

function Harness({ handler }: { handler: (() => void) | null | false }) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, handler);
  return (
    <div>
      <div ref={ref} data-testid="inside">
        inside
      </div>
      <button data-testid="outside">outside</button>
    </div>
  );
}

describe('useOnClickOutside', () => {
  it('fires when the user mousedowns outside the ref element', () => {
    const handler = vi.fn();
    const { getByTestId } = render(<Harness handler={handler} />);
    fireEvent.mouseDown(getByTestId('outside'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire when the click is inside the ref element', () => {
    const handler = vi.fn();
    const { getByTestId } = render(<Harness handler={handler} />);
    fireEvent.mouseDown(getByTestId('inside'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('detaches when handler is falsy', () => {
    const { getByTestId } = render(<Harness handler={false} />);
    // No handler attached — dispatching must not throw.
    expect(() => fireEvent.mouseDown(getByTestId('outside'))).not.toThrow();
  });
});
