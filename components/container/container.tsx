import type { ComponentProps } from 'react';

const widths = ['sm', 'md', 'lg', 'xl', '7xl', 'full'] as const;
const paddings = ['none', 'default', 'lg'] as const;
export type ContainerProps = ComponentProps<'div'> & {
  maxWidth?: (typeof widths)[number] | undefined;
  padding?: (typeof paddings)[number] | undefined;
};

export function Container({
  maxWidth = '7xl',
  padding = 'default',
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      {...props}
      className={['sp-container', className].filter(Boolean).join(' ')}
      data-slot="container"
      data-size={maxWidth === '7xl' ? undefined : maxWidth}
      data-padding={padding}
    />
  );
}
