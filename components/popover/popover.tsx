'use client';

import { Popover as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export const PopoverAnchor = Primitive.Anchor;
export const PopoverClose = Primitive.Close;

export type PopoverContentProps = ComponentProps<typeof Primitive.Content>;

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 6,
  ...props
}: PopoverContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        align={align}
        sideOffset={sideOffset}
        className={['sp-popover', className].filter(Boolean).join(' ')}
        data-slot="popover"
      />
    </Primitive.Portal>
  );
}
