import { forwardRef, type HTMLAttributes, type ReactNode, type MouseEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-sans font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border border-border bg-surface text-(--color-text-main)',
        accent:
          'border border-[rgba(197,160,101,0.3)] bg-[rgba(197,160,101,0.12)] text-(--color-accent-text)',
        outline:
          'border border-border bg-transparent text-(--color-text-main)',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-sm',
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
      {leading && <span className="inline-flex shrink-0 items-center">{leading}</span>}
      <span className="truncate">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Remove"
          className="ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-inherit outline-none hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-(--color-focus-ring)"
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
