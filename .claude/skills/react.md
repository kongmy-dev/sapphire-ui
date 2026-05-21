# Skill: Sapphire UI React Components

How to build components in the Sapphire UI style. Every new component in `src/components/ui/` must follow this pattern exactly.

---

## The Canonical Pattern

Every primitive component uses **CVA + Radix Slot + `forwardRef`**. Study `src/components/ui/Button.tsx` as the reference implementation.

```tsx
import { forwardRef, type HTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// 1. Define variants with cva()
const thingVariants = cva(
  // base classes — always applied
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

// 2. Interface: HTML attrs + VariantProps + asChild
export interface ThingProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof thingVariants> {
  asChild?: boolean;
}

// 3. forwardRef with Slot support
const Thing = forwardRef<HTMLDivElement, ThingProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(thingVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Thing.displayName = 'Thing';

export { Thing, thingVariants };
```

---

## CVA Rules

**Base classes** are always applied — put structural layout, font-family, and transitions here.

**Variant classes** are conditional — put color, sizing, and shape here.

**Compound variants** (`compoundVariants`) are available for combinations that need special treatment, but use them sparingly.

```tsx
// compound variant example: small + outline gets a tighter border
compoundVariants: [
  { variant: 'outline', size: 'sm', className: 'border-[0.5px]' },
],
```

**Never put hardcoded hex values in variant strings.** Always use CSS custom property bracket notation:

```tsx
// correct
'bg-[var(--color-primary)] text-[var(--color-text-on-dark)]'

// wrong
'bg-[#0a192f] text-[#f1f5f9]'
```

---

## The `cn()` Utility

`cn()` lives in `src/lib/utils.ts` — it wraps `clsx` + `tailwind-merge`. Always use it to compose class strings so consumer-passed `className` overrides cleanly:

```tsx
className={cn(thingVariants({ variant, size, className }))}
```

**Do not** concatenate strings manually:

```tsx
// wrong
className={`${thingVariants({ variant })} ${className}`}
```

---

## `asChild` Pattern

`asChild` enables polymorphism — the component delegates its rendering to its child element, merging all props and ref. Import `Slot` from `@radix-ui/react-slot`:

```tsx
// Consumer renders a Button as a router Link:
<Button asChild variant="primary">
  <Link to="/contact">Get in touch</Link>
</Button>
```

Always default `asChild` to `false`. Only use `Slot` when `asChild` is true.

---

## TypeScript Patterns

Extend the native HTML element attributes for the rendered element, not `React.HTMLProps`:

```tsx
// for a <button>
interface Props extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {}

// for a <div>
interface Props extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof variants> {}

// for an <a>
interface Props extends AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof variants> {}
```

Add JSDoc only for non-obvious props:

```tsx
/** Render as child element — delegates rendering to the immediate child */
asChild?: boolean;
```

---

## Radix Primitives

Sapphire wraps Radix UI primitives. When building a component on top of a Radix primitive (Dialog, Popover, Tabs, etc.):

1. Re-export all sub-parts the consumer needs (`Root`, `Trigger`, `Content`, etc.).
2. Apply Sapphire tokens to each sub-part via `cn()`.
3. Pass through all native props with `{...props}`.
4. Keep Radix's accessibility attributes intact — never suppress `aria-*` or `data-state`.

```tsx
// example: wrapping Radix Dialog.Content
const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className={cn(
      'bg-[var(--color-card-bg)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] p-8',
      className,
    )}
    {...props}
  />
));
```

---

## Icons (Material Symbols)

Icons use the Material Symbols Outlined font loaded in `design/colors_and_type.css`:

```tsx
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
```

Default variation settings (applied in base CSS): `FILL 0 / wght 300 / GRAD 0 / opsz 24`. For icon-only interactive elements always provide `aria-label`.

---

## Exporting a New Component

After creating `src/components/ui/MyComponent.tsx`:

1. Add a named export to `src/index.ts`:

```ts
export { MyComponent, myComponentVariants } from './components/ui/MyComponent';
```

2. Add the export path to `package.json → exports`:

```json
"./my-component": {
  "types": "./dist/components/ui/MyComponent.d.ts",
  "import": "./dist/components/ui/MyComponent.js",
  "require": "./dist/components/ui/MyComponent.cjs"
}
```

---

## What Not to Do

- **No `React.FC` or `React.FunctionComponent`** — use plain function signatures or `forwardRef`.
- **No inline `style` objects** for design-system values — use Tailwind utilities or CSS vars.
- **No default exports** — all components use named exports.
- **No `React.memo` by default** — add it only after profiling confirms a real render bottleneck.
- **No uncontrolled state for design variants** — variant logic belongs in CVA, not in component state.
