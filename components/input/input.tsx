import type { ComponentProps } from 'react';

const variants = ['default', 'mono', 'on-dark'] as const;
const sizes = ['sm', 'default', 'lg'] as const;

export type InputProps = Omit<ComponentProps<'input'>, 'size'> & {
  variant?: (typeof variants)[number] | null | undefined;
  size?: (typeof sizes)[number] | null | undefined;
};

export function Input({
  className,
  variant = 'default',
  size = 'default',
  type = 'text',
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      type={type}
      className={['sp-input', className].filter(Boolean).join(' ')}
      data-slot="input"
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
    />
  );
}
