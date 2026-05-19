import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  /** Material Symbols icon name */
  icon?: string;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action slot (e.g. a Button) */
  action?: ReactNode;
}

function Empty({ className, icon, title, description, action, ...props }: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          className="material-symbols-outlined text-[var(--color-border)] mb-4"
          style={{ fontSize: 56 }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {title && (
        <h3 className="font-serif text-lg font-medium text-[var(--color-primary)] mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="font-sans text-sm text-[var(--color-text-muted)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export { Empty };
