import { forwardRef } from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '../../lib/utils';

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export type HoverCardContentProps = React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>;

/**
 * Rich preview popover that opens on hover/focus. Renders a portaled
 * <div role="dialog"> with positioning relative to the trigger. Use for
 * link previews, mention cards, anything substantive enough that a
 * Tooltip would be wrong.
 *
 *   <HoverCard>
 *     <HoverCardTrigger asChild><a href="...">@username</a></HoverCardTrigger>
 *     <HoverCardContent>
 *       <Avatar fallback="UN" />
 *       <div>Full bio + stats here</div>
 *     </HoverCardContent>
 *   </HoverCard>
 */
const HoverCardContent = forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = 'center', sideOffset = 6, ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-64 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm text-[var(--color-text-main)] shadow-lg outline-none',
        // Origin-aware entrance/exit animations, driven by data-side & data-state
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </HoverCardPrimitive.Portal>
));
HoverCardContent.displayName = 'HoverCardContent';

export { HoverCardContent };
