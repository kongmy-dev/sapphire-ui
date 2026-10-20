import type { ComponentProps, ReactElement } from 'react';

const variants = ['default', 'on-dark'] as const;
const sizes = ['sm', 'default', 'lg'] as const;
export type IconMarkProps = ComponentProps<'div'> & {
  icon: ReactElement;
  variant?: (typeof variants)[number] | undefined;
  size?: (typeof sizes)[number] | undefined;
};

export function IconMark({
  icon,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: IconMarkProps) {
  return (
    <div
      {...props}
      className={['sp-icon-mark', className].filter(Boolean).join(' ')}
      data-slot="icon-mark"
      data-variant={variant}
      data-size={size}
    >
      {icon}
    </div>
  );
}
