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
          'relative w-full overflow-hidden rounded-full border border-border bg-surface',
          size === 'sm' && 'h-1.5',
          size === 'default' && 'h-2.5',
          size === 'lg' && 'h-4',
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full rounded-full bg-accent transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <span className="min-w-[3ch] font-mono text-xs text-(--color-text-muted) tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );
});
Progress.displayName = 'Progress';

export { Progress };
