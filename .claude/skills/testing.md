# Skill: Testing Sapphire UI Components

How to write and run tests in the Sapphire UI repository. Read this before adding or modifying tests.

---

## Stack

| Tool | Purpose |
|---|---|
| vitest | Unit test runner (fast, native ESM) |
| @testing-library/react | DOM testing utilities |
| @testing-library/jest-dom | Custom matchers (`.toBeInTheDocument()`, etc.) |
| jsdom | DOM environment for vitest |
| Playwright + @axe-core/playwright | End-to-end a11y testing |

---

## Unit Tests

### File Location

```
src/components/ui/__tests__/Button.test.tsx    ← mirrors component path
src/components/ui/__tests__/Card.test.tsx
```

Every component in `src/components/ui/` should have a corresponding test file in `__tests__/`.

### Canonical Test Structure

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="outline">Test</Button>);
    expect(container.firstChild).toHaveClass('border-[1.5px]');
  });

  it('forwards refs', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges custom className', () => {
    const { container } = render(<Button className="my-class">Test</Button>);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
```

### What to Test Per Component

1. **Smoke render** — renders without crashing, appears in DOM
2. **Variant classes** — each CVA variant produces the expected className
3. **Ref forwarding** — if the component uses `forwardRef`, verify `ref.current` is the right element type
4. **`asChild` / Slot** — if supported, verify the child element receives component styles
5. **Accessibility** — correct `role`, `aria-*` attributes, focusable where expected
6. **Custom className** — `cn()` merging works (extra className appears on the element)
7. **Interactive behaviour** — clicks, state toggles, callbacks fire

### Running Tests

```bash
bun run test           # vitest run (single pass)
bunx vitest            # vitest watch mode
bunx vitest run --coverage  # with coverage report
```

---

## Accessibility Tests (Playwright + axe-core)

### Location

```
tests/a11y.spec.ts              ← static page scans
tests/a11y-interactions.spec.ts ← open-state scans (popovers, dialogs, etc.)
```

### How It Works

1. `playwright.config.ts` builds the docs site and serves it on `localhost:4173`
2. Tests navigate to each docs route and run axe-core
3. Default mode logs violations as warnings but passes the test
4. Set `STRICT_A11Y=1` to fail on any violation

### Adding a New Route

In `tests/a11y.spec.ts`, add to the routes array:

```ts
const routes = [
  '/',
  '/buttons',
  '/cards',
  // ... add your new route here
  '/my-new-page',
];
```

### Running A11y Tests

```bash
bun run test:a11y                # all browsers (chromium, firefox, webkit)
STRICT_A11Y=1 bun run test:a11y  # strict mode — fails on violations
```

---

## Hard Rules

1. **Every new component MUST have a test file.** No exceptions.
2. **Test file mirrors component path.** `Button.tsx` → `__tests__/Button.test.tsx`
3. **Do not test implementation details.** No testing of internal state, private methods, or CSS class names that are CVA internals.
4. **DO test the public API.** Props in → rendered output. Callbacks fire. Refs work.
5. **Keep tests fast.** No network requests, no timers unless testing debounce.
6. **Use `screen` queries over container queries.** Prefer `getByRole`, `getByText`, `getByLabelText`.
7. **Run tests before submitting.** `bun run test` must pass.
