import { forwardRef, useId } from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { cn } from '../../lib/utils';

type CheckedState = boolean | 'indeterminate';

export interface CheckboxProps {
  /** Controlled checked state. Use 'indeterminate' for the mixed visual. */
  checked?: CheckedState;
  /** Uncontrolled initial checked state. */
  defaultChecked?: CheckedState;
  /** Fired when checked state changes. */
  onCheckedChange?: (checked: CheckedState) => void;
  /** Disable interaction. */
  disabled?: boolean;
  /** Mark as required for form submission. */
  required?: boolean;
  /** Form field name. */
  name?: string;
  /** Form field value (submitted when checked). */
  value?: string;
  /** Explicit id; auto-generated if omitted. */
  id?: string;
  /** Class applied to the checkbox root (the visible square). */
  className?: string;
  /** Label rendered next to the checkbox. */
  label?: string;
  /** Helper text rendered below the label. */
  description?: string;
}

/**
 * Accessible checkbox built on @radix-ui/react-checkbox.
 *
 * Breaking change from 0.1.x: uses Radix-style `checked` + `onCheckedChange`
 * instead of native `onChange(event)`. Indeterminate is now a value of
 * `checked` ('indeterminate'), not a separate prop.
 */
const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, label, description, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp || autoId;
    const descriptionId = description ? `${id}-desc` : undefined;

    return (
      <div className="flex items-start gap-2.5">
        <RadixCheckbox.Root
          ref={ref}
          id={id}
          aria-describedby={descriptionId}
          className={cn('k-checkbox', className)}
          {...props}
        >
          <RadixCheckbox.Indicator className="k-checkbox-indicator" />
        </RadixCheckbox.Root>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={id}
                className="cursor-pointer font-sans text-sm font-medium text-(--color-text-main) select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <span
                id={descriptionId}
                className="mt-0.5 font-sans text-xs text-(--color-text-muted)"
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
