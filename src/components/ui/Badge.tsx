import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] font-sans text-[11px] font-semibold tracking-[0.04em] uppercase transition-colors',
  {
    variants: {
      variant: {
        // Foreground colors are darkened from the underlying brand/state
        // hue so 12px badge text passes WCAG AA contrast on the tinted bg.
        default:
          'border border-border bg-surface text-text-muted',
        accent:
          'border border-accent/30 bg-accent/12 text-accent-text',
        dark:
          'border border-border-dark bg-white/10 text-text-on-dark',
        success:
          'border border-success-border bg-success-bg text-success',
        error:
          'border border-error-border bg-error-bg text-error',
        warning:
          'border border-warning-border bg-warning-bg text-warning',
        info:
          'border border-info-border bg-info-bg text-info',
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
