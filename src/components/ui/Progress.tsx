import * as ProgressPrimitive from '@radix-ui/react-progress';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Show percentage label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
}

const Progress = forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, max = 100, showLabel, size = 'default', ...props }, ref) => {
  const percentage = Math.round(((value ?? 0) / max) * 100);

  return (
    <div className="flex items-center gap-3">
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        max={max}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]',
          size === 'sm' && 'h-1.5',
          size === 'default' && 'h-2.5',
          size === 'lg' && 'h-4',
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full bg-[var(--color-accent)] transition-transform duration-500 ease-out rounded-full"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <span className="font-mono text-xs text-[var(--color-text-muted)] min-w-[3ch] tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );
});
Progress.displayName = 'Progress';

export { Progress };
