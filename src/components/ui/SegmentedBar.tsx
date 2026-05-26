import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface SegmentedBarSegment {
  /** The percentage width of this segment (0-100) */
  value: number;
  /** Optional background color or CSS variable (e.g. "var(--color-accent)") */
  color?: string;
  /** Optional extra class names */
  className?: string;
  /** Optional style overrides */
  style?: React.CSSProperties;
}

export interface SegmentedBarMarker {
  /** Position percentage of the marker line (0-100) */
  position: number;
  /** Optional border color or CSS variable */
  color?: string;
  /** Optional extra class names */
  className?: string;
  /** Optional style overrides */
  style?: React.CSSProperties;
}

export interface SegmentedBarProps extends HTMLAttributes<HTMLDivElement> {
  /** The list of segments to render sequentially */
  segments: SegmentedBarSegment[];
  /** Optional vertical marker lines to overlay on the bar */
  markers?: SegmentedBarMarker[];
  /** Height size variant */
  size?: 'sm' | 'default' | 'lg';
}

const SegmentedBar = forwardRef<HTMLDivElement, SegmentedBarProps>(
  ({ className, segments, markers = [], size = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          'relative flex w-full overflow-hidden rounded-sm border border-border bg-white/5',
          size === 'sm' && 'h-1.5',
          size === 'default' && 'h-2.5',
          size === 'lg' && 'h-4',
          className,
        )}
        {...props}
      >
        {/* Overlay Markers */}
        {markers.map((marker, idx) => (
          <div
            key={idx}
            className={cn(
              'absolute inset-y-0 z-10 h-full border-r-2 opacity-65 transition-all duration-300',
              marker.className
            )}
            style={{
              left: `${marker.position}%`,
              borderColor: marker.color || 'var(--color-accent)',
              ...marker.style,
            }}
          />
        ))}

        {/* Segments */}
        {segments.map((segment, idx) => (
          <div
            key={idx}
            className={cn('h-full transition-all duration-300 ease-in-out', segment.className)}
            style={{
              width: `${segment.value}%`,
              backgroundColor: segment.color,
              ...segment.style,
            }}
          />
        ))}
      </div>
    );
  },
);

SegmentedBar.displayName = 'SegmentedBar';

export { SegmentedBar };
