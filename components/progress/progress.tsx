'use client';

import { Progress as ProgressPrimitive } from 'radix-ui';
import type { ComponentProps, CSSProperties } from 'react';

const sizes = ['sm', 'default', 'lg'] as const;
export type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root> & {
  showLabel?: boolean | undefined;
  size?: (typeof sizes)[number] | undefined;
  indicatorClassName?: string | undefined;
};

export function Progress({
  className,
  value = 0,
  max = 100,
  showLabel,
  size = 'default',
  indicatorClassName,
  style,
  ...props
}: ProgressProps) {
  const maximum = Number.isFinite(max) && max > 0 ? max : 100;
  const current =
    value !== null && Number.isFinite(value) && value >= 0 && value <= maximum
      ? value
      : null;
  const percentage =
    current === null ? 0 : Math.round((current / maximum) * 100);
  const progressStyle: CSSProperties & { '--sp-progress-value': string } = {
    '--sp-progress-value': `${percentage}%`,
  };
  return (
    <div
      className="sp-progress"
      data-slot="progress"
      data-size={size}
      style={progressStyle}
    >
      <ProgressPrimitive.Root
        {...props}
        value={current}
        max={maximum}
        style={style}
        className={['sp-progress-track', className].filter(Boolean).join(' ')}
        data-slot="progress-track"
      >
        <ProgressPrimitive.Indicator
          className={['sp-progress-indicator', indicatorClassName]
            .filter(Boolean)
            .join(' ')}
          data-slot="progress-indicator"
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <span className="sp-progress-value" aria-hidden="true">
          {current === null ? '…' : `${percentage}%`}
        </span>
      )}
    </div>
  );
}
