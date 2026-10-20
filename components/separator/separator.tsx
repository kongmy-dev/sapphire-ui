import type { ComponentProps } from 'react';
import { Slot } from '../../lib/slot.js';

const orientations = ['horizontal', 'vertical'] as const;

export type SeparatorProps = ComponentProps<'div'> & {
  orientation?: (typeof orientations)[number] | undefined;
  decorative?: boolean | undefined;
  asChild?: boolean | undefined;
};

export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  asChild = false,
  ...props
}: SeparatorProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      className={['sp-separator', className].filter(Boolean).join(' ')}
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
    />
  );
}
