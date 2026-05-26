import { forwardRef } from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const toggleVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-1.5 font-sans font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--color-focus-ring) focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-border bg-transparent text-(--color-text-main) hover:bg-surface data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-(--color-text-on-dark)',
        outline:
          'border border-border bg-transparent text-(--color-text-muted) hover:text-(--color-text-main) data-[state=on]:border-accent data-[state=on]:bg-accent data-[state=on]:text-primary',
        ghost:
          'border-none bg-transparent text-(--color-text-muted) hover:bg-surface data-[state=on]:bg-surface data-[state=on]:text-(--color-text-main)',
      },
      size: {
        sm: 'h-8 rounded-btn px-2.5 text-xs',
        default: 'h-9 rounded-btn px-3 text-sm',
        lg: 'h-10 rounded-btn px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

/**
 * Two-state toggle button built on @radix-ui/react-toggle. Renders a
 * <button> with `aria-pressed` reflecting the toggled state. Use
 * ToggleGroup to coordinate multiple toggles (single or multi-select).
 */
const Toggle = forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size }), className)}
    {...props}
  />
));
Toggle.displayName = 'Toggle';

export type ToggleGroupProps =
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>;

/**
 * Group of related toggles with coordinated state. Set `type="single"`
 * for radio-style (one active) or `type="multiple"` for checkbox-style
 * (any subset active). Variant + size are forwarded to ToggleGroupItem
 * children via Radix's context.
 */
const ToggleGroup = forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn('inline-flex items-center gap-1', className)}
    {...(props as React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>)}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = 'ToggleGroup';

import { createContext, useContext } from 'react';
const ToggleGroupContext = createContext<VariantProps<typeof toggleVariants>>({
  variant: 'default',
  size: 'default',
});

export interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof toggleVariants> {}

/**
 * Individual item within a ToggleGroup. Inherits variant/size from the
 * parent ToggleGroup unless overridden on the item itself.
 */
const ToggleGroupItem = forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, variant, size, ...props }, ref) => {
  const ctx = useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({ variant: variant ?? ctx.variant, size: size ?? ctx.size }),
        className,
      )}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = 'ToggleGroupItem';

export { Toggle, ToggleGroup, ToggleGroupItem, toggleVariants };
