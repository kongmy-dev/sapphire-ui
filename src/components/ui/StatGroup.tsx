import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(
  ({ className, cols = 3, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid gap-6 rounded-md border border-border p-6',
          cols === 1 && 'grid-cols-1',
          cols === 2 && 'grid-cols-1 sm:grid-cols-2',
          cols === 3 && 'grid-cols-1 sm:grid-cols-3',
          cols === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          className
        )}
        {...props}
      />
    );
  }
);
StatGroup.displayName = 'StatGroup';

export { StatGroup };
