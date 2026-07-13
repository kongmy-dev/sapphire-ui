import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none',
  {
    variants: {
      size: {
        sm: 'size-3.5',
        default: 'size-[18px]',
        lg: 'size-6',
      },
      tone: {
        current: '',
        muted: 'text-muted-foreground',
        accent: 'text-accent-text',
      },
    },
    defaultVariants: {
      size: 'default',
      tone: 'current',
    },
  },
);

export interface SpinnerProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  /** Accessible status text announced to screen readers */
  label?: string;
}

function Spinner({
  className,
  size,
  tone,
  label = 'Loading',
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size, tone }), className)}
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
