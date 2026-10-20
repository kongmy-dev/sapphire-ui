'use client';

import { Tooltip as Primitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';

export const TooltipProvider = Primitive.Provider;
export const TooltipRoot = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;
export type TooltipContentProps = ComponentProps<typeof Primitive.Content>;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: TooltipContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        sideOffset={sideOffset}
        className={['sp-tooltip', className].filter(Boolean).join(' ')}
        data-slot="tooltip"
      />
    </Primitive.Portal>
  );
}

export type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  delayDuration?: number | undefined;
  side?: ComponentProps<typeof Primitive.Content>['side'];
  noProvider?: boolean | undefined;
};

export function Tooltip({
  children,
  content,
  delayDuration = 300,
  side = 'top',
  noProvider,
}: TooltipProps) {
  const inner = (
    <TooltipRoot>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipRoot>
  );
  return noProvider ? (
    inner
  ) : (
    <TooltipProvider delayDuration={delayDuration}>{inner}</TooltipProvider>
  );
}
