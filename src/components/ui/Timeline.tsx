import { forwardRef, createContext, useContext, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Orientation = 'vertical' | 'horizontal';

const TimelineContext = createContext<Orientation>('vertical');

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
}

const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <TimelineContext.Provider value={orientation}>
      <div
        ref={ref}
        data-orientation={orientation}
        className={cn(
          'flex font-sans',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          className
        )}
        {...props}
      />
    </TimelineContext.Provider>
  )
);
Timeline.displayName = 'Timeline';

export type TimelineItemProps = HTMLAttributes<HTMLDivElement>;

const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, ...props }, ref) => {
    const orientation = useContext(TimelineContext);
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex',
          orientation === 'vertical' ? 'flex-row gap-4' : 'flex-1 flex-col gap-3',
          className
        )}
        {...props}
      />
    );
  }
);
TimelineItem.displayName = 'TimelineItem';

export interface TimelineIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  isLast?: boolean;
}

const TimelineIndicator = forwardRef<HTMLDivElement, TimelineIndicatorProps>(
  ({ className, isLast, children, ...props }, ref) => {
    const orientation = useContext(TimelineContext);
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 items-center',
          orientation === 'vertical' ? 'w-6 flex-col justify-start' : 'h-6 flex-row justify-center',
          className
        )}
        {...props}
      >
        <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-border bg-surface text-(--color-text-muted)">
          {children || <span className="size-2 rounded-full bg-primary/40" />}
        </div>
        {!isLast && (
          <div
            className={cn(
              'absolute bg-border',
              orientation === 'vertical'
                ? 'top-6 bottom-[-16px] left-1/2 w-[2px] -translate-x-1/2'
                : 'top-1/2 right-[-12px] left-6 h-[2px] -translate-y-1/2'
            )}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);
TimelineIndicator.displayName = 'TimelineIndicator';

export type TimelineContentProps = HTMLAttributes<HTMLDivElement>;

const TimelineContent = forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, ...props }, ref) => {
    const orientation = useContext(TimelineContext);
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-1',
          orientation === 'vertical' ? 'pt-0.5 pb-8' : 'pr-8',
          className
        )}
        {...props}
      />
    );
  }
);
TimelineContent.displayName = 'TimelineContent';

export { Timeline, TimelineItem, TimelineIndicator, TimelineContent };
