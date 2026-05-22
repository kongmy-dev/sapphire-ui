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
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          className="material-symbols-outlined mb-4 text-(--color-text-muted)"
          style={{ fontSize: 56 }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {title && (
        <h3 className="mb-2 font-serif text-lg font-medium text-(--color-text-strong)">
          {title}
        </h3>
      )}
      {description && (
        <p className="mb-6 max-w-sm font-sans text-sm text-(--color-text-muted)">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export { Empty };
