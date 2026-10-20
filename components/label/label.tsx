import type { ComponentProps } from 'react';

const sizes = ['sm', 'default', 'lg'] as const;

export type LabelProps = ComponentProps<'label'> & {
  size?: (typeof sizes)[number] | null | undefined;
  required?: boolean | undefined;
};

export function Label({
  className,
  size = 'default',
  required,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      {...props}
      className={['sp-label', className].filter(Boolean).join(' ')}
      data-slot="label"
      data-size={size ?? undefined}
    >
      {children}
      {required && (
        <span
          className="sp-label-required"
          data-slot="label-required"
          aria-hidden="true"
        >
          *
        </span>
      )}
    </label>
  );
}
