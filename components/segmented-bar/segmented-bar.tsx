import type { ComponentProps, CSSProperties } from 'react';

export type SegmentedBarSegment = {
  value: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};
export type SegmentedBarMarker = {
  position: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};
export type SegmentedBarProps = ComponentProps<'div'> & {
  segments: readonly SegmentedBarSegment[];
  markers?: readonly SegmentedBarMarker[];
  size?: 'sm' | 'default' | 'lg';
};
const percentage = (value: number) =>
  Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

export function SegmentedBar({
  segments,
  markers = [],
  size = 'default',
  className,
  'aria-label': label,
  ...props
}: SegmentedBarProps) {
  const values = segments.map((segment) => percentage(segment.value));
  const total = values.reduce((sum, value) => sum + value, 0);
  const scale = total > 100 ? 100 / total : 1;
  const summary = values.map((value) => `${value * scale}%`).join(', ');
  return (
    <div
      {...props}
      role="group"
      aria-label={label ?? `Segment distribution: ${summary || 'empty'}`}
      className={['sp-segmented-bar', className].filter(Boolean).join(' ')}
      data-slot="segmented-bar"
      data-size={size}
    >
      {markers.map((marker, index) => (
        <div
          key={`${index}:${marker.position}`}
          aria-hidden="true"
          className={['sp-segmented-bar-marker', marker.className]
            .filter(Boolean)
            .join(' ')}
          style={{
            left: `${percentage(marker.position)}%`,
            borderColor: marker.color,
            ...marker.style,
          }}
        />
      ))}
      {segments.map((segment, index) => (
        <div
          key={`${index}:${segment.value}`}
          aria-hidden="true"
          className={['sp-segmented-bar-segment', segment.className]
            .filter(Boolean)
            .join(' ')}
          style={{
            width: `${(values[index] ?? 0) * scale}%`,
            backgroundColor: segment.color,
            ...segment.style,
          }}
        />
      ))}
    </div>
  );
}
