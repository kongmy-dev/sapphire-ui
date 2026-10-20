import type { ComponentProps, ReactNode } from 'react';

const sizes = ['sm', 'default', 'lg'] as const;
const directions = ['up', 'down', 'neutral'] as const;

export type StatProps = ComponentProps<'div'> & {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  change?: ReactNode;
  changeDirection?: (typeof directions)[number] | undefined;
  size?: (typeof sizes)[number] | undefined;
};

export function Stat({
  className,
  label,
  value,
  description,
  change,
  changeDirection = 'neutral',
  size = 'default',
  ...props
}: StatProps) {
  return (
    <div
      {...props}
      className={['sp-stat', className].filter(Boolean).join(' ')}
      data-slot="stat"
      data-size={size}
    >
      <dl className="sp-stat-body">
        <dt className="sp-stat-label">{label}</dt>
        <dd className="sp-stat-figure">
          <span className="sp-stat-value">{value}</span>
          {change != null && (
            <span className="sp-stat-change" data-direction={changeDirection}>
              {change}
            </span>
          )}
        </dd>
      </dl>
      {description && <p className="sp-stat-description">{description}</p>}
    </div>
  );
}
