'use client';

import { HoverCard as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

export const HoverCard = Primitive.Root;
export const HoverCardTrigger = Primitive.Trigger;

export type HoverCardContentProps = ComponentProps<typeof Primitive.Content>;

export function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 6,
  ...props
}: HoverCardContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        align={align}
        sideOffset={sideOffset}
        className={['sp-hover-card', className].filter(Boolean).join(' ')}
        data-slot="hover-card"
      />
    </Primitive.Portal>
  );
}
