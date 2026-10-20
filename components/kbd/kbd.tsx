import type { ComponentProps } from 'react';

const sizes = ['sm', 'default', 'lg'] as const;
export type KbdProps = ComponentProps<'kbd'> & {
  size?: (typeof sizes)[number] | undefined;
};

export function Kbd({ size = 'default', className, ...props }: KbdProps) {
  return (
    <kbd
      {...props}
      className={['sp-kbd', className].filter(Boolean).join(' ')}
      data-size={size}
      data-slot="kbd"
    />
  );
}
