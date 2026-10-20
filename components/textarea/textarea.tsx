import type { ComponentProps } from 'react';

const variants = ['default', 'mono', 'on-dark'] as const;
const sizes = ['sm', 'default', 'lg'] as const;

export type TextareaProps = ComponentProps<'textarea'> & {
  variant?: (typeof variants)[number] | null | undefined;
  size?: (typeof sizes)[number] | null | undefined;
};

export function Textarea({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      className={['sp-textarea', className].filter(Boolean).join(' ')}
      data-slot="textarea"
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
    />
  );
}
