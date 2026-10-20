import type { ComponentProps } from 'react';

type BarChartProps = Omit<ComponentProps<'div'>, 'children'> & {
  data: number[];
  height?: string | number | undefined;
  labels?: string[] | undefined;
  tooltipSuffix?: string | undefined;
};

export function BarChart({
  data,
  height,
  className,
  labels,
  tooltipSuffix = '',
  style,
  ...props
}: BarChartProps) {
  return (
    <div
      role="group"
      {...props}
      className={['sp-bar-chart', className].filter(Boolean).join(' ')}
      data-slot="bar-chart"
      style={{ ...style, height: height ?? style?.height }}
    >
      {data.map((value, index) => {
        const label = labels?.[index];
        const amount = Number.isFinite(value) ? value : 0;
        return (
          <button
            type="button"
            key={`bar-${index}`}
            className="sp-bar-chart-column"
            aria-label={`${label || `Bar ${index + 1}`}: ${amount}${tooltipSuffix}`}
          >
            <div
              className="sp-bar-chart-bar"
              style={{ height: `${Math.min(100, Math.max(0, amount))}%` }}
              aria-hidden="true"
            >
              <div className="sp-bar-chart-value">
                {amount}
                {tooltipSuffix}
              </div>
            </div>
            {label && (
              <span className="sp-bar-chart-label" aria-hidden="true">
                {label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
