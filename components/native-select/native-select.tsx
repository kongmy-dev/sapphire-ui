import type { ComponentProps, ReactNode } from 'react';

const variants = ['default', 'on-dark'] as const;
const sizes = ['sm', 'default', 'lg'] as const;

export type NativeSelectProps = Omit<ComponentProps<'select'>, 'size'> & {
  variant?: (typeof variants)[number] | null | undefined;
  size?: (typeof sizes)[number] | null | undefined;
  children: ReactNode;
};

export function NativeSelect({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div className="sp-native-select-field" data-slot="native-select-field">
      <select
        {...props}
        className={['sp-native-select', className].filter(Boolean).join(' ')}
        data-slot="native-select"
        data-variant={variant ?? undefined}
        data-size={size ?? undefined}
      >
        {children}
      </select>
      <svg
        className="sp-native-select-icon"
        data-slot="native-select-icon"
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 6 4 4 4-4" />
      </svg>
    </div>
  );
}
