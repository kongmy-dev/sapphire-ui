import type { ComponentProps } from 'react';

const variants = ['line', 'card', 'circle'] as const;
const sizes = ['sm', 'md', 'lg'] as const;
export type SkeletonProps = ComponentProps<'div'> & {
  variant?: (typeof variants)[number] | null | undefined;
  size?: (typeof sizes)[number] | null | undefined;
};

export function Skeleton({
  className,
  variant = 'line',
  size = 'md',
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={['sp-skeleton', className].filter(Boolean).join(' ')}
      data-slot="skeleton"
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
    />
  );
}
