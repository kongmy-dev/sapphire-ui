import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Show red asterisk for required fields */
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'font-sans text-sm font-semibold text-[var(--color-primary)] block mb-1',
          className,
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-[var(--color-accent)] ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  },
);
Label.displayName = 'Label';

export { Label };
