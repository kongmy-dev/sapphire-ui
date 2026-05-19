import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '../../lib/utils';

export interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Active/checked color (CSS value) */
  activeColor?: string;
  /** Label text displayed next to the switch */
  label?: string;
}

const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ className, activeColor, label, id: idProp, checked, disabled, ...props }, ref) => {
    const autoId = useId();
    const id = idProp || autoId;

    return (
      <div className={cn('flex items-center gap-3', disabled && 'opacity-50')}>
        <label
          className={cn('k-toggle-switch', className)}
          htmlFor={id}
        >
          <input
            type="checkbox"
            id={id}
            ref={ref}
            checked={checked}
            disabled={disabled}
            role="switch"
            aria-checked={!!checked}
            {...props}
          />
          <span
            className="k-toggle-slider"
            style={checked ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
          />
        </label>
        {label && (
          <label
            htmlFor={id}
            className="font-sans text-sm font-medium text-[var(--color-text-main)] cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
ToggleSwitch.displayName = 'ToggleSwitch';

/** Alias for shadcn naming convention */
const Switch = ToggleSwitch;

export { ToggleSwitch, Switch };
