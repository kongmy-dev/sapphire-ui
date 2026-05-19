import { forwardRef, type HTMLAttributes, type ReactNode, type MouseEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-sans font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)]',
        accent:
          'bg-[rgba(197,160,101,0.12)] text-[var(--color-accent-text)] border border-[rgba(197,160,101,0.3)]',
        outline:
          'bg-transparent text-[var(--color-text-main)] border border-[var(--color-border)]',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        default: 'text-sm px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof chipVariants> {
  children: ReactNode;
  /** Optional leading element (icon, avatar, dot). */
  leading?: ReactNode;
  /**
   * When provided, renders a close (×) button. The chip becomes
   * dismissible and screen-reader–accessible via aria-label "Remove".
   */
  onDismiss?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Compact interactive badge for filter pills, tags, recipients, etc.
 * Use Badge for static labels; use Chip when the item is a user-mutable
 * entity (selectable, removable).
 */
const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant, size, leading, children, onDismiss, ...props }, ref) => (
    <span ref={ref} className={cn(chipVariants({ variant, size }), className)} {...props}>
      {leading && <span className="inline-flex items-center shrink-0">{leading}</span>}
      <span className="truncate">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Remove"
          className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 cursor-pointer border-none bg-transparent text-inherit p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      )}
    </span>
  ),
);
Chip.displayName = 'Chip';

export { Chip, chipVariants };
