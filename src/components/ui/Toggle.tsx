import { forwardRef } from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-sans font-medium cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-transparent text-[var(--color-text-main)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] data-[state=on]:bg-[var(--color-primary)] data-[state=on]:text-white data-[state=on]:border-[var(--color-primary)]',
        outline:
          'bg-transparent text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text-main)] data-[state=on]:bg-[var(--color-accent)] data-[state=on]:text-[var(--color-primary)] data-[state=on]:border-[var(--color-accent)]',
        ghost:
          'bg-transparent text-[var(--color-text-muted)] border-none hover:bg-[var(--color-surface)] data-[state=on]:bg-[var(--color-surface)] data-[state=on]:text-[var(--color-text-main)]',
      },
      size: {
        sm: 'h-8 px-2.5 text-xs rounded-[var(--radius-btn)]',
        default: 'h-9 px-3 text-sm rounded-[var(--radius-btn)]',
        lg: 'h-10 px-4 text-base rounded-[var(--radius-btn)]',
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
