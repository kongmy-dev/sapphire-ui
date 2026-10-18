# TypeScript patterns

Examples for the rules in `SKILL.md`, in this repository's own shapes.

## Variants are a tuple and its union (T1, T5)

```ts
export const buttonVariants = ['primary', 'secondary', 'ghost', 'premium'] as const;
export type ButtonVariant = (typeof buttonVariants)[number];

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
};
```

The tuple feeds the contract gate, the examples and the docs; the union types
the prop. One declaration, three readers.

## States are a union, not flags (T1)

```ts
// Don't: loading and error can both be set, and nothing says which wins.
type ToastProps = { loading?: boolean; error?: string; message?: string };

// Do: only the legal states exist.
type ToastState =
  | { readonly kind: 'pending' }
  | { readonly kind: 'done'; readonly message: string }
  | { readonly kind: 'failed'; readonly error: string };
```

If you could write a sentence saying when two fields combine, the type is too
loose. Pick one tag name (`kind`) and keep it.

## Exhaustive, so a new variant breaks every place it must reach (T1)

```ts
function toastRole(state: ToastState): 'status' | 'alert' {
  switch (state.kind) {
    case 'pending':
    case 'done':
      return 'status';
    case 'failed':
      return 'alert';
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}
```

When every arm is a value, the table is the same proof with less code:

```ts
const toastRole: Record<ToastState['kind'], 'status' | 'alert'> = {
  pending: 'status',
  done: 'status',
  failed: 'alert',
};
```

## Build the shape so the bad value can't exist (T2)

```ts
type NonEmpty<T> = readonly [T, ...T[]];

// Don't: every caller repeats the check, or forgets.
function firstTab(tabs: readonly Tab[]): Tab {
  return tabs[0]!;
}

// Do: an empty list can't be passed, and the `!` is gone.
function firstTab(tabs: NonEmpty<Tab>): Tab {
  return tabs[0];
}
```

Strengthen only where the loose type forces a lie (`!`, `as`, a "never happens"
throw). `readonly Tab[]` stays when every operation on it is total, and
`Tab | undefined` is the other honest signature.

## `satisfies`, not `as` (T3)

```ts
// Don't: widens 'md' to string and accepts a missing key.
const sizes = { sm: '2rem', md: '2.5rem' } as Record<Size, string>;

// Do: checks every key and keeps the literal types.
const sizes = { sm: '2rem', md: '2.5rem', lg: '3rem' } satisfies Record<Size, string>;
```

## Narrowing, best first (T3)

1. A discriminant `switch` or `if`.
2. `'key' in value`.
3. `typeof` or `instanceof`.
4. A guard function that checks everything it claims.
5. `as`, only inside a parse function after the check.

## Derive the shape (T4)

```ts
type CardProps = ComponentProps<'div'>;
type DialogContentProps = ComponentProps<typeof Dialog.Content>;
type Tone = AlertProps['tone'];
```

Reach for `ComponentProps`, `Pick`, `Omit`, `Parameters`, `ReturnType` and
`typeof` before writing a new type.

## Parse once at the edge (E1, E2)

The package has no runtime dependency, so a guard is written by hand, and it must
check every property its return type claims.

```ts
export const consentCategories = ['analytics', 'marketing'] as const;
type ConsentCategory = (typeof consentCategories)[number];
type Consent = Readonly<Record<ConsentCategory, boolean>>;

function isConsent(value: unknown): value is Consent {
  if (typeof value !== 'object' || value === null) return false;
  return consentCategories.every(
    (category) => typeof Reflect.get(value, category) === 'boolean',
  );
}

export function parseConsent(raw: string): Consent | null {
  try {
    const value: unknown = JSON.parse(raw);
    return isConsent(value) ? value : null;
  } catch {
    return null;
  }
}
```

The `catch` here is the edge turning a thrown parse into a returned `null`, which
the caller must handle. A guard that checks one key and claims three is worse
than `as`: the bug hides behind a name that says it is safe.

## Brand what must not be mixed

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
export type CssLength = Brand<string, 'CssLength'>;

export function parseCssLength(raw: string): CssLength | null {
  return /^\d+(\.\d+)?(px|rem|em|%)$/.test(raw) ? (raw as CssLength) : null;
}
```

The cast inside the parse function is the one sanctioned cast. Brand only what
crosses modules and could be confused with a plain value of the same type.

## Object arguments (S4)

```ts
// Don't: swap two numbers and it still compiles.
clampMenu(x, y, width, height);

// Do
clampMenu({ origin: { x, y }, size: { width, height } });
```

Skip on hot paths, such as a pointer-move handler, where the allocation shows.
