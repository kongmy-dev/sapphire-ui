import type { ComponentProps } from 'react';

const sizes = ['sm', 'default', 'lg'] as const;
const tones = ['current', 'muted', 'brand'] as const;
export type SpinnerProps = ComponentProps<'span'> & {
  size?: (typeof sizes)[number] | null | undefined;
  tone?: (typeof tones)[number] | null | undefined;
  label?: string | undefined;
};

export function Spinner({
  className,
  size = 'default',
  tone = 'current',
  label = 'Loading',
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      {...props}
      className={['sp-spinner', className].filter(Boolean).join(' ')}
      data-slot="spinner"
      data-size={size ?? undefined}
      data-tone={tone ?? undefined}
    />
  );
}
