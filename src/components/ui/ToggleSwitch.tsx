import * as RadixSwitch from '@radix-ui/react-switch';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixSwitch.Root>, 'asChild'> {
  /** Label rendered next to the switch. */
  label?: string;
  /** Visual size. */
  size?: 'sm' | 'default';
}

/**
 * Accessible switch built on @radix-ui/react-switch.
 *
 * Breaking change from 0.1.x: uses Radix-style `checked` + `onCheckedChange`
 * instead of native `onChange(event)`. The `activeColor` prop is gone —
 * override `--switch-active` CSS variable instead.
 */
const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, label, size = 'default', id: idProp, ...props }, ref) => {
    const autoId = useId();
    const id = idProp || autoId;

    return (
      <div
        className={cn(
          'flex items-center gap-3',
          props.disabled && 'opacity-50',
        )}
      >
        <RadixSwitch.Root
          ref={ref}
          id={id}
          className={cn('k-switch', size === 'sm' && 'k-switch--sm', className)}
          {...props}
        >
          <RadixSwitch.Thumb className="k-switch-thumb" />
        </RadixSwitch.Root>
        {label && (
          <label
            htmlFor={id}
            className="cursor-pointer select-none font-medium font-sans text-sm text-text-main"
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

export type { SwitchProps as ToggleSwitchProps };
export { Switch, ToggleSwitch };
