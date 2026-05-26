import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const calloutVariants = cva(
  'relative flex gap-4 rounded-md border p-5 font-sans',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-(--color-text-main)',
        subtle: 'border-transparent bg-surface/30 text-(--color-text-main)',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CalloutProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof calloutVariants> {
  title?: ReactNode;
  icon?: ReactNode;
}

const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, variant, title, icon, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(calloutVariants({ variant }), className)} {...props}>
        {icon && (
          <div className="mt-0.5 flex shrink-0 items-start text-accent">
            {typeof icon === 'string' ? (
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                {icon}
              </span>
            ) : (
              icon
            )}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          {title && (
            <div className="font-serif text-lg font-semibold tracking-tight text-text-strong">
              {title}
            </div>
          )}
          <div className="text-sm/relaxed text-(--color-text-muted) [&>ul]:ml-4 [&>ul]:list-disc [&>ul]:space-y-1">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Callout.displayName = 'Callout';

export { Callout, calloutVariants };
