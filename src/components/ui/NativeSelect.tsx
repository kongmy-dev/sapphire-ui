import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const nativeSelectVariants = cva(
  'w-full cursor-pointer appearance-none pr-10 font-sans outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-btn border border-border bg-card text-foreground focus:border-accent focus:shadow-[0_0_0_3px] focus:shadow-accent/12',
        dark: 'rounded-sm border border-border-dark bg-black/20 text-text-on-dark focus:border-accent [&>option]:bg-primary [&>option]:text-text-on-dark',
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
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className={cn(
            'pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2',
            variant === 'dark'
              ? 'text-text-on-dark-muted'
              : 'text-muted-foreground',
          )}
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  },
);
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect, nativeSelectVariants };
