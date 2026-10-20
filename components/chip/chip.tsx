'use client';

import type { ComponentProps, MouseEvent, ReactNode } from 'react';

const variants = ['default', 'brand', 'outline'] as const;
const sizes = ['sm', 'default', 'lg'] as const;

export type ChipProps = Omit<ComponentProps<'span'>, 'children'> & {
  children: ReactNode;
  variant?: (typeof variants)[number] | null | undefined;
  size?: (typeof sizes)[number] | null | undefined;
  leading?: ReactNode;
  onDismiss?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
  dismissLabel?: string | undefined;
};

export function Chip({
  className,
  variant = 'default',
  size = 'default',
  leading,
  children,
  onDismiss,
  dismissLabel = 'Remove',
  ...props
}: ChipProps) {
  return (
    <span
      {...props}
      className={['sp-chip', className].filter(Boolean).join(' ')}
      data-slot="chip"
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
    >
      {leading && <span className="sp-chip-leading">{leading}</span>}
      <span className="sp-chip-label">{children}</span>
      {onDismiss && (
        <button
          type="button"
          className="sp-chip-dismiss"
          data-slot="chip-dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path
              d="M1 1l8 8M9 1l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
