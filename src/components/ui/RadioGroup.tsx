import { forwardRef, useId, type ReactNode } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../lib/utils';

/**
 * Single-select option group with proper roving-tabindex keyboard nav
 * (only the selected item is in the tab order; arrow keys move within).
 *
 *   <RadioGroup value={plan} onValueChange={setPlan}>
 *     <RadioGroupItem value="free" label="Free" description="$0/mo" />
 *     <RadioGroupItem value="pro" label="Pro" description="$12/mo" />
 *   </RadioGroup>
 */
const RadioGroup = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn('grid gap-2.5', className)}
    {...props}
  />
));
RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /** Inline label rendered next to the radio. */
  label?: ReactNode;
  /** Secondary description under the label. */
  description?: ReactNode;
}

const RadioGroupItem = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, description, id: idProp, ...props }, ref) => {
  const autoId = useId();
  const id = idProp || autoId;
  const descriptionId = description ? `${id}-desc` : undefined;

  return (
    <div className="flex items-start gap-2.5">
      <RadioGroupPrimitive.Item
        ref={ref}
        id={id}
        aria-describedby={descriptionId}
        className={cn(
          'mt-0.5 size-[18px] shrink-0 cursor-pointer rounded-full border-[1.5px] border-(--color-border-strong,#cbd5e1) bg-(--color-card-bg)',
          'focus-visible:ring-2 focus-visible:ring-(--color-focus-ring) focus-visible:ring-offset-1 focus-visible:outline-none',
          'data-[state=checked]:border-accent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="relative flex size-full items-center justify-center">
          <span className="block size-2 rounded-full bg-accent" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
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
            <span id={descriptionId} className="mt-0.5 font-sans text-xs text-(--color-text-muted)">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
