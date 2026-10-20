import type { ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';

const variants = [
  'default',
  'brand',
  'on-dark',
  'success',
  'error',
  'warning',
  'info',
] as const;
const sizes = ['sm', 'default', 'lg'] as const;

export type BadgeProps = ComponentProps<'span'> & {
  variant?: (typeof variants)[number] | null | undefined;
  size?: (typeof sizes)[number] | null | undefined;
  asChild?: boolean | undefined;
};

export function Badge({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      {...props}
      className={['sp-badge', className].filter(Boolean).join(' ')}
      data-slot="badge"
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
    />
  );
}
