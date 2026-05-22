import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Spinner size */
  size?: 'sm' | 'default' | 'lg';
}

function Spinner({ className, size = 'default', ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none',
        size === 'sm' && 'size-3.5',
        size === 'default' && 'size-[18px]',
        size === 'lg' && 'size-6',
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
