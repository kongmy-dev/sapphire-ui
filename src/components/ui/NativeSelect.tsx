import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function NativeSelect({ className, children, ...props }: NativeSelectProps) {
  return (
    <select 
      className={cn("w-full bg-[rgba(0,0,0,0.2)] border border-[var(--color-border-dark)] text-white rounded-[var(--radius-sm)] px-3 py-2 outline-none font-sans transition-colors duration-300", className)}
      {...props}
    >
      {children}
    </select>
  );
}
