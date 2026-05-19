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
        'inline-block border-2 border-current border-t-transparent rounded-full animate-spin motion-reduce:animate-none',
        size === 'sm' && 'w-3.5 h-3.5',
        size === 'default' && 'w-[18px] h-[18px]',
        size === 'lg' && 'w-6 h-6',
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
