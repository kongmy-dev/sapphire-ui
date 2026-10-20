import type { ComponentProps } from 'react';

const orientations = ['vertical', 'horizontal'] as const;
export type TimelineProps = ComponentProps<'div'> & {
  orientation?: (typeof orientations)[number] | undefined;
};
export type TimelineItemProps = ComponentProps<'div'>;
export type TimelineContentProps = ComponentProps<'div'>;
export type TimelineIndicatorProps = ComponentProps<'div'> & {
  isLast?: boolean | undefined;
};

export function Timeline({
  className,
  orientation = 'vertical',
  ...props
}: TimelineProps) {
  return (
    <div
      {...props}
      className={['sp-timeline', className].filter(Boolean).join(' ')}
      data-slot="timeline"
      data-orientation={orientation}
    />
  );
}

export function TimelineItem({ className, ...props }: TimelineItemProps) {
  return (
    <div
      {...props}
      className={['sp-timeline-item', className].filter(Boolean).join(' ')}
      data-slot="timeline-item"
    />
  );
}

export function TimelineContent({ className, ...props }: TimelineContentProps) {
  return (
    <div
      {...props}
      className={['sp-timeline-content', className].filter(Boolean).join(' ')}
      data-slot="timeline-content"
    />
  );
}

export function TimelineIndicator({
  className,
  isLast,
  children,
  ...props
}: TimelineIndicatorProps) {
  return (
    <div
      {...props}
      className={['sp-timeline-indicator', className].filter(Boolean).join(' ')}
      data-slot="timeline-indicator"
      data-last={isLast || undefined}
    >
      <div className="sp-timeline-marker">
        {children || <span className="sp-timeline-dot" />}
      </div>
    </div>
  );
}
