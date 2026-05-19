import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface RangeSliderProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Show current value label */
  showValue?: boolean;
  /** Light theme variant */
  variant?: 'default' | 'light';
}

const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
  ({ className, showValue, variant = 'default', value, ...props }, ref) => {
    return (
      <div className="flex items-center gap-3 w-full">
        <input
          type="range"
          ref={ref}
          value={value}
          className={cn(
            'k-slider',
            variant === 'light' && 'k-slider--light',
            className,
          )}
          {...props}
        />
        {showValue && (
          <span className="font-mono text-sm text-[var(--color-text-muted)] min-w-[3ch] text-right tabular-nums">
            {value}
          </span>
        )}
      </div>
    );
  },
);
RangeSlider.displayName = 'RangeSlider';

/** Alias for shadcn naming convention */
const Slider = RangeSlider;

export { RangeSlider, Slider };
