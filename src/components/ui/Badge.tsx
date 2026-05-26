import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-0.5 font-sans text-xs font-semibold tracking-wider uppercase transition-colors',
  {
    variants: {
      variant: {
        // Foreground colors are darkened from the underlying brand/state
        // hue so 12px badge text passes WCAG AA contrast on the tinted bg.
        default:
          'border border-border bg-surface text-(--color-text-muted)',
        accent:
          'border border-accent/30 bg-accent/12 text-(--color-accent-text)',
        dark:
          'border border-border-dark bg-white/10 text-(--color-text-on-dark)',
        success:
          'border border-(--color-success-border) bg-(--color-success-bg) text-(--color-success)',
        error:
          'border border-(--color-error-border) bg-(--color-error-bg) text-(--color-error)',
        warning:
          'border border-(--color-warning-border) bg-(--color-warning-bg) text-(--color-warning)',
        info:
          'border border-(--color-info-border) bg-(--color-info-bg) text-(--color-info)',
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
