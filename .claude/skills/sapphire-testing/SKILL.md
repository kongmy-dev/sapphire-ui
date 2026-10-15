---
name: sapphire-testing
description: How to write and run unit tests and accessibility tests in Sapphire UI. Covers testing patterns for React components, a11y specs, and running verification suites.
---

# Skill: Testing Sapphire UI Components

How to write and run tests in the Sapphire UI repository. Read this before adding or modifying tests.

## Stack

- **Unit Tests:** Vitest + React Testing Library + `@testing-library/jest-dom` in `jsdom`.
- **Accessibility Tests:** Playwright + `@axe-core/playwright` scanning against WCAG 2.1 AA rules.

## Canonical Component Test Structure

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders without crashing and displays text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="outline">Test</Button>);
    expect(container.firstChild).toHaveClass('border-[1.5px]');
  });

  it('forwards refs to the button element', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges custom className without dropping variant classes', () => {
    const { container } = render(<Button className="my-class">Test</Button>);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
```

## What to Test Per Component

1. **Smoke render:** Renders into DOM with correct semantic role.
2. **Variant classes:** Each CVA variant applies expected classes.
3. **Ref forwarding:** `ref.current` is attached to the DOM element.
4. **`asChild` / Slot:** Child element receives merged classes and props when `asChild` is enabled.
5. **Accessibility:** Proper `aria-*` attributes, tab stops, and focus states.
6. **Interactivity:** User events (click, focus, keyboard triggers) call registered handlers.

## Running Tests

```bash
bun run test           # Vitest suite
bun run test:a11y      # Playwright a11y specs
```
