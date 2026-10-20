'use client';

import { Switch as Primitive } from 'radix-ui';
import { type ComponentProps, useId } from 'react';
import { Label } from '../label/label.js';

const sizes = ['sm', 'default'] as const;

export type SwitchProps = Omit<
  ComponentProps<typeof Primitive.Root>,
  'asChild'
> & {
  label?: string | undefined;
  size?: (typeof sizes)[number] | undefined;
};

export function Switch({
  className,
  label,
  size = 'default',
  id: idProp,
  ...props
}: SwitchProps) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div
      className="sp-switch-field"
      data-slot="switch-field"
      data-disabled={props.disabled || undefined}
    >
      <Primitive.Root
        {...props}
        id={id}
        className={['sp-switch', className].filter(Boolean).join(' ')}
        data-slot="switch"
        data-size={size}
      >
        <Primitive.Thumb className="sp-switch-thumb" data-slot="switch-thumb" />
      </Primitive.Root>
      {label && <Label htmlFor={id}>{label}</Label>}
    </div>
  );
}

export type { SwitchProps as ToggleSwitchProps };
export { Switch as ToggleSwitch };
