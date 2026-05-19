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
        'bg-[var(--color-surface)] text-[var(--color-text-main)]',
        'border border-[var(--color-border)] border-b-2',
        'rounded-[var(--radius-sm)] shadow-[0_1px_0_0_var(--color-border)]',
        size === 'sm' && 'text-[10px] min-w-[18px] h-[18px] px-1',
        size === 'default' && 'text-[11px] min-w-[22px] h-[22px] px-1.5',
        size === 'lg' && 'text-xs min-w-[28px] h-[28px] px-2',
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = 'Kbd';

export { Kbd };
