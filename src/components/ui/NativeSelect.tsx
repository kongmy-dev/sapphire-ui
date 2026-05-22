import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  /** Visual variant */
  variant?: 'default' | 'dark';
}

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, variant = 'dark', children, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            variant === 'dark' && 'k-input-dark',
            variant === 'default' &&
              'w-full cursor-pointer appearance-none rounded-btn border border-border bg-(--color-card-bg) px-4 py-3 font-sans text-base text-(--color-text-main) transition-all duration-200 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(197,160,101,0.12)]',
            disabled && 'cursor-not-allowed opacity-50',
            'pr-10',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span
          className={cn(
            'material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[20px]',
            variant === 'dark' ? 'text-(--color-text-on-dark-muted)' : 'text-(--color-text-muted)',
          )}
        >
          expand_more
        </span>
      </div>
    );
  },
);
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
