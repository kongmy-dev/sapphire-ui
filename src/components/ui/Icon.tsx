import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols icon name (e.g. "cloud", "smart_toy") */
  name: string;
  /** Icon size in pixels */
  size?: number;
  /** Use filled variant */
  filled?: boolean;
  /** Font weight (100–700) */
  weight?: number;
}

function Icon({
  name,
  size = 24,
  filled = false,
  weight = 300,
  className,
  style,
  ...props
}: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', className)}
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" ${weight}, "GRAD" 0, "opsz" ${size}`,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}

export { Icon };
