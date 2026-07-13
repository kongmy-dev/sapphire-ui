import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const nativeSelectVariants = cva(
  'w-full cursor-pointer appearance-none pr-10 font-sans outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-btn border border-border bg-(--color-card-bg) text-text-main focus:border-accent focus:shadow-[0_0_0_3px] focus:shadow-accent/12',
        dark: 'k-input-dark',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        default: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface NativeSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof nativeSelectVariants> {
  children: ReactNode;
}

/**
 * Styled native <select>. Prefer this over the Radix Select for plain
 * forms and mobile — the OS picker is the best touch experience.
 *
 * Breaking change in 2.0: the default variant is now 'default' (light
 * surface) to match Input/Textarea. Pass variant="dark" explicitly for
 * navy surfaces.
 */
const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, variant, size, children, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(nativeSelectVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </select>
        <span
          aria-hidden="true"
          className={cn(
            'material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[20px]',
            variant === 'dark' ? 'text-text-on-dark-muted' : 'text-text-muted',
          )}
        >
          expand_more
        </span>
      </div>
    );
  },
);
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect, nativeSelectVariants };
