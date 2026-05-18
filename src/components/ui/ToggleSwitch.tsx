import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  activeColor?: string;
}

export function ToggleSwitch({ className, activeColor, ...props }: ToggleSwitchProps) {
  return (
    <label className={cn("k-toggle-switch", className)}>
      <input type="checkbox" {...props} />
      <span className="k-toggle-slider" style={props.checked ? { backgroundColor: activeColor, borderColor: activeColor } : {}}></span>
    </label>
  );
}
