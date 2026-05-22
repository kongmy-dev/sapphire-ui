import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** Size variant. */
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Styled <kbd> element for keyboard shortcuts. Renders semantic HTML —
 * screen readers announce the contents as keys.
 *
 * Example:
 *   <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette
 */
const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ className, size = 'default', ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-mono font-medium',
        'bg-surface text-(--color-text-main)',
        'border border-b-2 border-border',
        'rounded-sm shadow-[0_1px_0_0_var(--color-border)]',
        size === 'sm' && 'h-[18px] min-w-[18px] px-1 text-[10px]',
        size === 'default' && 'h-[22px] min-w-[22px] px-1.5 text-[11px]',
        size === 'lg' && 'h-[28px] min-w-[28px] px-2 text-xs',
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = 'Kbd';

export { Kbd };
