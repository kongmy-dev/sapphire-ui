import { type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'rounded-md border-[1.5px] p-5 font-sans',
  {
    variants: {
      variant: {
        info: 'border-(--color-info-border) bg-(--color-info-bg) text-(--color-text-main)',
        success: 'border-(--color-success-border) bg-(--color-success-bg) text-(--color-text-main)',
        warning: 'border-(--color-warning-border) bg-(--color-warning-bg) text-(--color-text-main)',
        error: 'border-(--color-error-border) bg-(--color-error-bg) text-(--color-text-main)',
        accent: 'border-accent/38 bg-accent/7 text-(--color-text-main)',
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

// Icon and title share the same darker variant so 20px icons (which axe
// flags as text-adjacent even when aria-hidden) pass WCAG AA contrast on
// the tinted background. The hue identifies the variant; the darker shade
// is the accessibility fix.
const variantColorMap: Record<string, string> = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  accent: 'var(--color-accent-text)',
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
  const key = variant || 'info';
  const iconName = icon || iconMap[key];
  const color = variantColorMap[key];

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      <div className="flex items-start gap-3">
        <span
          className="material-symbols-outlined mt-0.5 shrink-0"
          style={{ color, fontSize: 20 }}
          aria-hidden="true"
        >
          {iconName}
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <div className="mb-1 text-sm font-semibold" style={{ color }}>
              {title}
            </div>
          )}
          <div className="text-sm/relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

export { Alert, alertVariants };
