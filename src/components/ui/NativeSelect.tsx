import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function NativeSelect({ className, children, ...props }: NativeSelectProps) {
  return (
    <select 
      className={cn("k-input-dark", className)}
      {...props}
    >
      {children}
    </select>
  );
}
