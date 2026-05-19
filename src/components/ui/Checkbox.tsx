import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Helper text displayed below the label */
  description?: string;
  /** Indeterminate visual state */
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, indeterminate, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp || autoId;
    const descriptionId = description ? `${id}-desc` : undefined;

    return (
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          id={id}
          ref={(el) => {
            if (el) el.indeterminate = !!indeterminate;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          className={cn(
            'k-checkbox',
            className,
          )}
          aria-describedby={descriptionId}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={id}
                className="font-sans text-sm font-medium text-[var(--color-text-main)] cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <span
                id={descriptionId}
                className="font-sans text-xs text-[var(--color-text-muted)] mt-0.5"
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
