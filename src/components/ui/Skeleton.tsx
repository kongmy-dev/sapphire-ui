import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: 'line' | 'card' | 'circle';
  /** Size for line variant */
  size?: 'sm' | 'md' | 'lg';
}

function Skeleton({ className, variant = 'line', size = 'md', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-[skeleton-shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] rounded-[var(--radius-sm)]',
        'bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-border)] to-[var(--color-surface)]',
        'motion-reduce:animate-none',
        variant === 'line' && size === 'sm' && 'h-3.5 w-2/5',
        variant === 'line' && size === 'md' && 'h-5 w-4/5',
        variant === 'line' && size === 'lg' && 'h-8 w-3/5',
        variant === 'card' && 'h-48 w-full rounded-[var(--radius-md)]',
        variant === 'circle' && 'rounded-full w-10 h-10',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
