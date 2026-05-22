import { forwardRef, useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from '../../lib/utils';

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<typeof RadixSwitch.Root>, 'asChild'> {
  /** Label rendered next to the switch. */
  label?: string;
}

/**
 * Accessible switch built on @radix-ui/react-switch.
 *
 * Breaking change from 0.1.x: uses Radix-style `checked` + `onCheckedChange`
 * instead of native `onChange(event)`. The `activeColor` prop is gone —
 * override `--switch-active` CSS variable instead.
 */
const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, label, id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp || autoId;

    return (
      <div className={cn('flex items-center gap-3', props.disabled && 'opacity-50')}>
        <RadixSwitch.Root
          ref={ref}
          id={id}
          className={cn('k-switch', className)}
          {...props}
        >
          <RadixSwitch.Thumb className="k-switch-thumb" />
        </RadixSwitch.Root>
        {label && (
          <label
            htmlFor={id}
            className="cursor-pointer font-sans text-sm font-medium text-(--color-text-main) select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
Switch.displayName = 'Switch';

/** Backwards-friendly alias from the previous shipping name. */
const ToggleSwitch = Switch;

export { Switch, ToggleSwitch };
export type { SwitchProps as ToggleSwitchProps };
