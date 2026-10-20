import type { ComponentProps, ReactElement, ReactNode } from 'react';

const variants = ['info', 'success', 'warning', 'error', 'brand'] as const;
type Variant = (typeof variants)[number];
const icons: Record<Variant, ReactNode> = {
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m16 9-5.5 5.5L8 12" />
    </>
  ),
  warning: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
  brand: (
    <>
      <path d="M9 18h6M10 22h4M15.09 14a6 6 0 1 0-6.18 0c.7.55 1.09 1.2 1.09 2h4c0-.8.39-1.45 1.09-2Z" />
    </>
  ),
};

export type AlertProps = ComponentProps<'div'> & {
  variant?: Variant | null | undefined;
  icon?: ReactElement | undefined;
};

export function Alert({
  variant = 'info',
  title,
  icon,
  children,
  className,
  role = 'alert',
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      role={role}
      className={['sp-alert', className].filter(Boolean).join(' ')}
      data-slot="alert"
      data-variant={variant ?? undefined}
    >
      <span className="sp-alert-icon" aria-hidden="true">
        {icon ?? (
          <svg
            aria-hidden="true"
            className="sp-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icons[variant ?? 'info']}
          </svg>
        )}
      </span>
      <div className="sp-alert-content">
        {title && <div className="sp-alert-title">{title}</div>}
        <div className="sp-alert-body">{children}</div>
      </div>
    </div>
  );
}
