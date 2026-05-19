import { type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'rounded-[var(--radius-md)] p-5 border-[1.5px] font-sans',
  {
    variants: {
      variant: {
        info: 'bg-[rgba(59,130,246,0.06)] border-[rgba(59,130,246,0.3)] text-[var(--color-text-main)]',
        success: 'bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.3)] text-[var(--color-text-main)]',
        warning: 'bg-[rgba(245,158,11,0.06)] border-[rgba(245,158,11,0.3)] text-[var(--color-text-main)]',
        error: 'bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.3)] text-[var(--color-text-main)]',
        accent: 'bg-[rgba(197,160,101,0.07)] border-[rgba(197,160,101,0.38)] text-[var(--color-text-main)]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

const iconMap: Record<string, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
  accent: 'lightbulb',
};

const iconColorMap: Record<string, string> = {
  info: '#3b82f6',
  success: '#16a34a',
  warning: '#d97706',
  error: '#ef4444',
  accent: 'var(--color-accent-dark)',
};

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Alert title */
  title?: string;
  /** Custom icon name (Material Symbols) */
  icon?: string;
  children?: ReactNode;
}

function Alert({ className, variant = 'info', title, icon, children, ...props }: AlertProps) {
  const iconName = icon || iconMap[variant || 'info'];
  const iconColor = iconColorMap[variant || 'info'];

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      <div className="flex items-start gap-3">
        <span
          className="material-symbols-outlined shrink-0 mt-0.5"
          style={{ color: iconColor, fontSize: 20 }}
          aria-hidden="true"
        >
          {iconName}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold text-sm mb-1" style={{ color: iconColor }}>
              {title}
            </div>
          )}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

export { Alert, alertVariants };
