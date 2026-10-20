import type { ComponentProps } from 'react';

const statuses = ['success', 'warning', 'error', 'neutral'] as const;

export type SparklineDataPoint = {
  status: (typeof statuses)[number];
  tooltip?: string | undefined;
};

export type SparklineProps = Omit<ComponentProps<'div'>, 'children'> & {
  data: SparklineDataPoint[];
  height?: string | number | undefined;
};

export function Sparkline({
  data,
  height,
  className,
  style,
  ...props
}: SparklineProps) {
  return (
    <div
      role="group"
      {...props}
      className={['sp-sparkline', className].filter(Boolean).join(' ')}
      data-slot="sparkline"
      style={{ ...style, height: height ?? style?.height }}
    >
      {data.map((point, index) => (
        <div
          key={`point-${index}`}
          className="sp-sparkline-bar"
          data-status={point.status}
          role="img"
          aria-label={
            point.tooltip ? `${point.status}: ${point.tooltip}` : point.status
          }
          title={point.tooltip}
        />
      ))}
    </div>
  );
}
