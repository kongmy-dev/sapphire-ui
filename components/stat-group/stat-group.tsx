import type { ComponentProps } from 'react';

const columns = [1, 2, 3, 4] as const;

export type StatGroupProps = ComponentProps<'div'> & {
  cols?: (typeof columns)[number] | undefined;
};

export function StatGroup({ className, cols = 3, ...props }: StatGroupProps) {
  return (
    <div
      {...props}
      className={['sp-stat-group', className].filter(Boolean).join(' ')}
      data-slot="stat-group"
      data-cols={cols}
    />
  );
}
