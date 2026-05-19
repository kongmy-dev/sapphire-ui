import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider uppercase font-sans transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
        accent:
          'bg-[rgba(197,160,101,0.12)] text-[var(--color-accent-dark)] border border-[rgba(197,160,101,0.3)]',
        dark:
          'bg-[rgba(255,255,255,0.1)] text-[var(--color-text-on-dark)] border border-[var(--color-border-dark)]',
        success:
          'bg-[rgba(34,197,94,0.1)] text-[#16a34a] border border-[rgba(34,197,94,0.2)]',
        error:
          'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]',
        warning:
          'bg-[rgba(245,158,11,0.1)] text-[#d97706] border border-[rgba(245,158,11,0.2)]',
        info:
          'bg-[rgba(59,130,246,0.1)] text-[#3b82f6] border border-[rgba(59,130,246,0.2)]',
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
