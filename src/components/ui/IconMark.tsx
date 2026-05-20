import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

export interface IconMarkProps extends HTMLAttributes<HTMLDivElement> {
  /** The name of the Material Symbols icon */
  icon: string;
  /** Whether to use the dark-themed background/accent color style */
  variant?: 'default' | 'dark';
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Filled variant for the icon inside */
  filled?: boolean;
}

const IconMark = forwardRef<HTMLDivElement, IconMarkProps>(
  ({ className, icon, variant = 'default', size = 'default', filled = false, ...props }, ref) => {
    // Determine dimensions and icon size based on size prop
    const containerSizeClass = {
      sm: 'w-8 h-8',
      default: 'w-12 h-12',
      lg: 'w-16 h-16',
    }[size];

    const iconSize = {
      sm: 20,
      default: 28,
      lg: 36,
    }[size];

    return (
      <div
        ref={ref}
        className={cn(
          'icon-mark flex items-center justify-center rounded-[var(--radius-sm)]',
          variant === 'default' ? 'bg-[var(--color-surface)] text-[var(--color-primary)]' : 'icon-mark-dark bg-[rgba(255,255,255,0.05)] text-[var(--color-accent)]',
          containerSizeClass,
          className,
        )}
        {...props}
      >
        <Icon name={icon} size={iconSize} filled={filled} />
      </div>
    );
  },
);

IconMark.displayName = 'IconMark';

export { IconMark };
