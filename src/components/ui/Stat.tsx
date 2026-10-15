import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  /** Short descriptor — "Active users", "Monthly cost". */
  label: ReactNode;
  /** Primary value — typically a number or short string. */
  value: ReactNode;
  /** Optional secondary text rendered under the value. */
  description?: ReactNode;
  /** Optional change indicator (e.g. "+12%" or "-3%"). */
  change?: ReactNode;
  /** Direction of the change for color coding. */
  changeDirection?: 'up' | 'down' | 'neutral';
  /** Layout density. */
  size?: 'sm' | 'default' | 'lg';
}

const LABEL_SIZES = {
  sm: 'text-[10px]',
  default: 'text-[12px]',
  lg: 'text-sm',
} as const;

const VALUE_SIZES = {
  sm: 'text-2xl',
  default: 'text-[28px]',
  lg: 'text-4xl',
} as const;

const CHANGE_DIRECTIONS = {
  up: 'text-success',
  down: 'text-error',
  neutral: 'text-muted-foreground',
} as const;

/**
 * Single metric display. Compose multiple Stats in a grid for a dashboard
 * card row. Renders semantic <dl>/<dt>/<dd> so screen readers announce
 * the label–value pairing correctly.
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(
  (
    {
      className,
      label,
      value,
      description,
      change,
      changeDirection = 'neutral',
      size = 'default',
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-1 rounded-md border border-border bg-card px-5 py-[18px] font-sans',
        className,
      )}
      {...props}
    >
      <dl className="m-0 flex flex-col gap-1">
        <dt
          className={cn(
            'mb-1 flex items-center gap-1.5 font-semibold text-muted-foreground uppercase tracking-[0.06em]',
            LABEL_SIZES[size],
          )}
        >
          {label}
        </dt>
        <dd className="m-0 flex flex-col items-start gap-1">
          <span
            className={cn(
              'font-medium font-serif text-foreground tabular-nums leading-none tracking-[-0.01em]',
              VALUE_SIZES[size],
            )}
          >
            {value}
          </span>
          {change != null && (
            <span
              className={cn(
                'mt-1 font-normal text-[12px] tabular-nums',
                CHANGE_DIRECTIONS[changeDirection],
              )}
            >
              {change}
            </span>
          )}
        </dd>
      </dl>
      {description && (
        <p className="m-0 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  ),
);
Stat.displayName = 'Stat';
