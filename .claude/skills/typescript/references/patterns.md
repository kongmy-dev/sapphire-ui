# Type patterns

P-3 in `CLAUDE.md` is the authority. Derive shapes instead of repeating them:

```ts
type Size = (typeof sizes)[number];
type TriggerProps = React.ComponentProps<typeof Primitive.Trigger>;
type ButtonProps = React.ComponentProps<'button'> & { size?: Size | null };
```

At an external edge, narrow exactly what the caller uses:

```ts
function nameOf(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) return null;
  if (!('name' in value) || typeof value.name !== 'string') return null;
  return value.name;
}
```

Prefer a literal tuple and derived union to a second hand-written list. Use
`satisfies` when checking a value against a contract without broadening inference.
Do not introduce branded primitives that require assertions forbidden by P-3.
A discriminated union is useful when it makes an invalid state unrepresentable;
otherwise a native or dependency-derived shape is easier to maintain.
