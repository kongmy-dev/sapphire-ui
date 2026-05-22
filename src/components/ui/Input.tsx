import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'w-full font-sans text-base transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-btn border border-border bg-(--color-card-bg) px-4 py-3 text-(--color-text-main) focus:border-accent focus:shadow-[0_0_0_3px_rgba(197,160,101,0.12)]',
        dark:
          'rounded-sm border border-border-dark bg-[rgba(0,0,0,0.2)] px-3 py-2.5 text-(--color-text-on-dark) focus:border-accent',
        mono:
          'rounded-btn border border-border bg-surface px-4 py-3 font-mono text-sm text-(--color-text-main) focus:border-accent focus:shadow-[0_0_0_3px_rgba(197,160,101,0.12)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input, inputVariants };
