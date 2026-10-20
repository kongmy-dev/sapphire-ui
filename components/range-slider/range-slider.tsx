'use client';

import { Slider as Primitive } from 'radix-ui';
import { type ComponentProps, useState } from 'react';

const variants = ['default', 'light'] as const;

export type SliderProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  'asChild' | 'aria-label'
> & {
  showValue?: boolean | undefined;
  variant?: (typeof variants)[number] | undefined;
  'aria-label'?: string | string[] | undefined;
};

function thumbLabel(label: SliderProps['aria-label'], index: number) {
  return Array.isArray(label) ? label[index] : label;
}

export function Slider({
  className,
  showValue,
  variant = 'default',
  value,
  defaultValue,
  min,
  onValueChange,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  ...props
}: SliderProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? [min ?? 0]);
  const display = value ?? uncontrolled;
  function change(next: number[]) {
    setUncontrolled(next);
    onValueChange?.(next);
  }
  return (
    <div className="sp-range-slider-field" data-slot="range-slider-field">
      <Primitive.Root
        {...props}
        min={min}
        value={value}
        defaultValue={defaultValue}
        onValueChange={change}
        className={['sp-range-slider', className].filter(Boolean).join(' ')}
        data-slot="range-slider"
        data-variant={variant}
      >
        <Primitive.Track
          className="sp-range-slider-track"
          data-slot="range-slider-track"
        >
          <Primitive.Range
            className="sp-range-slider-range"
            data-slot="range-slider-range"
          />
        </Primitive.Track>
        {display.map((_, index) => (
          <Primitive.Thumb
            key={`thumb-${index}`}
            className="sp-range-slider-thumb"
            data-slot="range-slider-thumb"
            aria-label={thumbLabel(ariaLabel, index)}
            aria-labelledby={labelledBy}
          />
        ))}
      </Primitive.Root>
      {showValue && (
        <span className="sp-range-slider-value" data-slot="range-slider-value">
          {display.join('–')}
        </span>
      )}
    </div>
  );
}

export type { SliderProps as RangeSliderProps };
export { Slider as RangeSlider };
