import * as RadixCheckbox from '@radix-ui/react-checkbox';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

type CheckedState = boolean | 'indeterminate';

export interface CheckboxProps
  extends Omit<
    ComponentPropsWithoutRef<typeof RadixCheckbox.Root>,
    'asChild' | 'checked' | 'defaultChecked' | 'onCheckedChange'
  > {
  /** Controlled checked state. Use 'indeterminate' for the mixed visual. */
  checked?: CheckedState;
  /** Uncontrolled initial checked state. */
  defaultChecked?: CheckedState;
  /** Fired when checked state changes. */
  onCheckedChange?: (checked: CheckedState) => void;
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
          className={cn(
            'mt-px inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm border-[1.5px] border-border-strong bg-card p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
            className,
          )}
          {...props}
        >
          <RadixCheckbox.Indicator className="group flex items-center justify-center text-white">
            <svg
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
              className="hidden size-2.5 group-data-[state=checked]:block"
            >
              <path
                d="M1.5 5.5 4 8l4.5-5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden h-0.5 w-2 rounded-[1px] bg-white group-data-[state=indeterminate]:block" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={id}
                className="cursor-pointer select-none font-medium font-sans text-sm text-foreground"
              >
                {label}
              </label>
            )}
            {description && (
              <span
                id={descriptionId}
                className="mt-0.5 font-sans text-muted-foreground text-xs"
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
