import { forwardRef } from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { cn } from '../../lib/utils';

export interface SliderProps {
  /** Controlled value array. Use a single-element array for one thumb. */
  value?: number[];
  /** Uncontrolled initial value. */
  defaultValue?: number[];
  /** Fired continuously as the user drags. */
  onValueChange?: (value: number[]) => void;
  /** Fired once when the user commits the value (mouseup / keyup). */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
  className?: string;
  /** Show the numeric value next to the slider. */
  showValue?: boolean;
  /** Visual variant for light backgrounds. */
  variant?: 'default' | 'light';
  /**
   * Accessible name for the slider thumb(s). Required for screen readers —
   * Radix renders thumbs as `<span role="slider">` which has no implicit name
   * from a nearby `<label>`. Provide a string (applied to every thumb) or
   * an array (one entry per thumb, e.g. ['Min', 'Max'] for a range).
   */
  'aria-label'?: string | string[];
  /** Id of an element that labels the slider thumb. Alternative to aria-label. */
  'aria-labelledby'?: string;
}

/**
 * Accessible slider built on @radix-ui/react-slider.
 *
 * Breaking change from 0.1.x: value is now `number[]` (Radix supports
 * multi-thumb ranges), `onValueChange(values)` replaces native
 * `onChange(event)`. Single-thumb usage: `value={[42]}`.
 */
const Slider = forwardRef<HTMLSpanElement, SliderProps>(
  (
    {
      className,
      showValue,
      variant = 'default',
      value,
      defaultValue,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const display = value ?? defaultValue ?? [0];
    const labelFor = (i: number): string | undefined => {
      if (Array.isArray(ariaLabel)) return ariaLabel[i];
      return ariaLabel;
    };

    return (
      <div className="flex w-full items-center gap-3">
        <RadixSlider.Root
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'k-slider',
            variant === 'light' && 'k-slider--light',
            className,
          )}
          {...props}
        >
          <RadixSlider.Track className="k-slider-track">
            <RadixSlider.Range className="k-slider-range" />
          </RadixSlider.Track>
          {display.map((_, i) => (
            <RadixSlider.Thumb
              key={i}
              className="k-slider-thumb"
              aria-label={labelFor(i)}
              aria-labelledby={ariaLabelledBy}
            />
          ))}
        </RadixSlider.Root>
        {showValue && (
          <span className="min-w-[3ch] text-right font-mono text-sm text-(--color-text-muted) tabular-nums">
            {display.join('–')}
          </span>
        )}
      </div>
    );
  },
);
Slider.displayName = 'Slider';

/** Backwards-friendly alias from the previous shipping name. */
const RangeSlider = Slider;

export { Slider, RangeSlider };
export type { SliderProps as RangeSliderProps };
