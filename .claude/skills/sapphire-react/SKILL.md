---
name: sapphire-react
description: Build or edit a React component in src/components/ui or registry/blocks — CVA variants, Radix Slot, tokens via CSS custom properties, a11y. Load before writing any .tsx here.
---

# Skill: Sapphire UI React Components

How to build components in the Sapphire UI style. Every component in `src/components/ui/` and `registry/blocks/` must follow this pattern.

## The Canonical Pattern

Every primitive component uses **CVA + Radix Slot**.

In React 19, new components take `ref` as a standard prop rather than wrapping with `forwardRef`. (Existing `forwardRef` components in the codebase are retained and converted only when modified).

```tsx
import type { HTMLAttributes, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// 1. Define variants with cva()
const thingVariants = cva(
  'inline-flex items-center font-sans transition-all',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)] text-white',
        outline: 'bg-transparent border border-[var(--color-border)]',
      },
      size: {
        sm: 'text-sm px-3 py-1.5',
        default: 'text-base px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// 2. Interface: HTML attrs + VariantProps + asChild + ref
export interface ThingProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof thingVariants> {
  asChild?: boolean;
  ref?: Ref<HTMLDivElement>;
}

// 3. React 19 function component
export function Thing({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ThingProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref}
      className={cn(thingVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { thingVariants };
```

## CVA Rules

- **Base classes** are always applied — structural layout, font family, and transitions belong here.
- **Variant classes** are conditional — color, sizing, and shape belong here.
- **Compound variants** (`compoundVariants`) handle specific combinations.
- **Never put hardcoded hex values in variant strings.** Always use CSS custom property bracket notation (`bg-[var(--color-primary)]`) or Tailwind theme tokens.

## The `cn()` Utility

`cn()` in `src/lib/utils.ts` wraps `clsx` + `tailwind-merge`. Always use it to compose class strings so consumer `className` overrides work cleanly:

```tsx
className={cn(thingVariants({ variant, size, className }))}
```

## `asChild` Pattern

`asChild` enables polymorphism — delegating rendering to the child element while merging props and refs. Always default `asChild` to `false`.

## Exporting a New Component

Every new component requires:
1. Named export in `src/index.ts`:
   ```ts
   export { MyComponent, myComponentVariants } from './components/ui/MyComponent';
   ```
2. Matching subpath export in `package.json -> exports`:
   ```json
   "./my-component": {
     "types": "./dist/components/ui/MyComponent.d.ts",
     "import": "./dist/components/ui/MyComponent.js",
     "require": "./dist/components/ui/MyComponent.cjs"
   }
   ```
   Both must be updated in the same change.

## What Not to Do

- **No `React.FC` or `React.FunctionComponent`**.
- **No inline `style` objects** for design tokens.
- **No default exports** — all components use named exports.
- **No `React.memo` by default** — profile first.
- **No uncontrolled state for design variants** — variant logic belongs in CVA.
