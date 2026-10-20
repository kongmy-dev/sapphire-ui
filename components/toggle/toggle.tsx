'use client';

import { ToggleGroup as Group, Toggle as Primitive } from 'radix-ui';
import { type ComponentProps, createContext, useContext } from 'react';

const variants = ['default', 'outline', 'ghost'] as const;
const sizes = ['sm', 'default', 'lg'] as const;
type Appearance = {
  variant?: (typeof variants)[number] | null | undefined;
  size?: (typeof sizes)[number] | null | undefined;
};
const AppearanceContext = createContext<Appearance>({
  variant: 'default',
  size: 'default',
});
export type ToggleProps = ComponentProps<typeof Primitive.Root> & Appearance;
export type ToggleGroupProps = ComponentProps<typeof Group.Root> & Appearance;
export type ToggleGroupItemProps = ComponentProps<typeof Group.Item> &
  Appearance;

export function Toggle({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ToggleProps) {
  return (
    <Primitive.Root
      {...props}
      className={['sp-toggle', className].filter(Boolean).join(' ')}
      data-variant={variant ?? undefined}
      data-size={size ?? undefined}
      data-slot="toggle"
    />
  );
}

export function ToggleGroup({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <Group.Root
      {...props}
      className={['sp-toggle-group', className].filter(Boolean).join(' ')}
      data-slot="toggle-group"
    >
      <AppearanceContext.Provider value={{ variant, size }}>
        {children}
      </AppearanceContext.Provider>
    </Group.Root>
  );
}

export function ToggleGroupItem({
  variant,
  size,
  className,
  ...props
}: ToggleGroupItemProps) {
  const appearance = useContext(AppearanceContext);
  const resolvedVariant = variant ?? appearance.variant;
  const resolvedSize = size ?? appearance.size;
  return (
    <Group.Item
      {...props}
      className={['sp-toggle', className].filter(Boolean).join(' ')}
      data-variant={
        resolvedVariant === 'default'
          ? undefined
          : (resolvedVariant ?? undefined)
      }
      data-size={
        resolvedSize === 'default' ? undefined : (resolvedSize ?? undefined)
      }
      data-slot="toggle-group-item"
    />
  );
}
