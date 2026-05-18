import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input 
      type="checkbox" 
      className={cn("w-4 h-4 accent-[var(--color-accent)]", className)} 
      {...props} 
    />
  );
}
