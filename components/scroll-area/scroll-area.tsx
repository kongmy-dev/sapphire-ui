'use client';

import { ScrollArea as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

export type ScrollAreaProps = ComponentProps<typeof Primitive.Root>;

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <Primitive.Root
      {...props}
      className={['sp-scroll-area', className].filter(Boolean).join(' ')}
      data-slot="scroll-area"
    >
      <Primitive.Viewport
        tabIndex={0}
        role="region"
        aria-label={props['aria-label'] ?? 'Scrollable content'}
        aria-labelledby={props['aria-labelledby']}
        className="sp-scroll-area-viewport"
        data-slot="scroll-area-viewport"
      >
        {children}
      </Primitive.Viewport>
      <ScrollBar />
      <Primitive.Corner className="sp-scroll-area-corner" />
    </Primitive.Root>
  );
}

export function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ComponentProps<typeof Primitive.Scrollbar>) {
  return (
    <Primitive.Scrollbar
      {...props}
      orientation={orientation}
      className={['sp-scroll-area-scrollbar', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="scrollbar"
    >
      <Primitive.Thumb className="sp-scroll-area-thumb" />
    </Primitive.Scrollbar>
  );
}
