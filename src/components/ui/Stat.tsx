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

/**
 * Single metric display. Compose multiple Stats in a grid for a dashboard
 * card row. Renders semantic <dl>/<dt>/<dd> so screen readers announce
 * the label–value pairing correctly.
 */
const Stat = forwardRef<HTMLDivElement, StatProps>(
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
            'mb-1 flex items-center gap-1.5 font-semibold text-text-muted uppercase tracking-[0.06em]',
            size === 'sm' && 'text-[10px]',
            size === 'default' && 'text-[12px]',
            size === 'lg' && 'text-sm',
          )}
        >
          {label}
        </dt>
        <dd className="m-0 flex flex-col items-start gap-1">
          <span
            className={cn(
              'font-medium font-serif text-text-main tabular-nums leading-none tracking-[-0.01em]',
              size === 'sm' && 'text-2xl',
              size === 'default' && 'text-[28px]',
              size === 'lg' && 'text-4xl',
            )}
          >
            {value}
          </span>
          {change != null && (
            <span
              className={cn(
                'mt-1 font-normal text-[12px] tabular-nums',
                changeDirection === 'up'
                  ? 'text-[#1f7a4d]'
                  : changeDirection === 'down'
                    ? 'text-[#b03a3a]'
                    : 'text-text-muted',
              )}
            >
              {change}
            </span>
          )}
        </dd>
      </dl>
      {description && (
        <p className="m-0 text-sm text-text-muted">{description}</p>
      )}
    </div>
  ),
);
Stat.displayName = 'Stat';

export { Stat };
