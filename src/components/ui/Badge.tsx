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
          'border border-[rgba(197,160,101,0.3)] bg-[rgba(197,160,101,0.12)] text-(--color-accent-text)',
        dark:
          'border border-border-dark bg-[rgba(255,255,255,0.1)] text-(--color-text-on-dark)',
        success:
          'border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.1)] text-[#15803d]',
        error:
          'border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.1)] text-[#b91c1c]',
        warning:
          'border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.1)] text-[#b45309]',
        info:
          'border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.1)] text-[#1d4ed8]',
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
