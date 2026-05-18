import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface RangeSliderProps extends InputHTMLAttributes<HTMLInputElement> {}

export function RangeSlider({ className, ...props }: RangeSliderProps) {
  return (
    <input 
      type="range" 
      className={cn("k-slider", className)} 
      {...props} 
    />
  );
}
