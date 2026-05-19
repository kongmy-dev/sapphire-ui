import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider uppercase font-sans transition-colors',
  {
    variants: {
      variant: {
        // Foreground colors are darkened from the underlying brand/state
        // hue so 12px badge text passes WCAG AA contrast on the tinted bg.
        default:
          'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
        accent:
          'bg-[rgba(197,160,101,0.12)] text-[var(--color-accent-text)] border border-[rgba(197,160,101,0.3)]',
        dark:
          'bg-[rgba(255,255,255,0.1)] text-[var(--color-text-on-dark)] border border-[var(--color-border-dark)]',
        success:
          'bg-[rgba(34,197,94,0.1)] text-[#15803d] border border-[rgba(34,197,94,0.2)]',
        error:
          'bg-[rgba(239,68,68,0.1)] text-[#b91c1c] border border-[rgba(239,68,68,0.2)]',
        warning:
          'bg-[rgba(245,158,11,0.1)] text-[#b45309] border border-[rgba(245,158,11,0.2)]',
        info:
          'bg-[rgba(59,130,246,0.1)] text-[#1d4ed8] border border-[rgba(59,130,246,0.2)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
