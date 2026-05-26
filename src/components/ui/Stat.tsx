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

const changeColor: Record<NonNullable<StatProps['changeDirection']>, string> = {
  up: 'text-(--color-success)',
  down: 'text-(--color-error)',
  neutral: 'text-(--color-text-muted)',
};

/**
 * Single metric display. Compose multiple Stats in a grid for a dashboard
 * card row. Renders semantic <dl>/<dt>/<dd> so screen readers announce
 * the label–value pairing correctly.
 */
const Stat = forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, description, change, changeDirection = 'neutral', size = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1 font-sans', className)}
      {...props}
    >
      <dl className="m-0 flex flex-col gap-1">
        <dt
          className={cn(
            'font-medium tracking-wider text-(--color-text-muted) uppercase',
            size === 'sm' && 'text-[10px]',
            size === 'default' && 'text-xs',
            size === 'lg' && 'text-sm',
          )}
        >
          {label}
        </dt>
        <dd className="m-0 flex items-baseline gap-2">
          <span
            className={cn(
              'font-serif font-semibold text-(--color-text-main) tabular-nums',
              size === 'sm' && 'text-2xl',
              size === 'default' && 'text-3xl',
              size === 'lg' && 'text-4xl',
            )}
          >
            {value}
          </span>
          {change != null && (
            <span className={cn('text-sm font-medium tabular-nums', changeColor[changeDirection])}>
              {change}
            </span>
          )}
        </dd>
      </dl>
      {description && (
        <p className="m-0 text-sm text-(--color-text-muted)">{description}</p>
      )}
    </div>
  ),
);
Stat.displayName = 'Stat';

export { Stat };
