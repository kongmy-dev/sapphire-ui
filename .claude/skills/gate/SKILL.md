---
name: gate
description: Run and interpret all quality gates in Sapphire UI before committing or pushing. Explains gate execution sequence, interpreting size gate and comment gate outputs, and verification standards.
---

# Gate — Sapphire UI

Quality gates verify correctness, token adherence, accessibility, and structural discipline across the repository.

Always run gates before committing or pushing changes.

## The Gate Sequence

Run the gate command:
```bash
bun run gate
```

The standard gate pipeline executes:
1. **Linter & Formatter:** `bun run lint` (Biome check on types, formatting, syntax, and class ordering).
2. **Comment Gate:** `bun run comment-check` (verifies no stray comments outside JSDoc and allowed fixed forms).
3. **Size Gate:** `bun run size-check` (verifies cognitive complexity, function length, file length, and nesting limits on changed files).
4. **Unit Tests:** `bun run test` (Vitest suites for components, hooks, and helpers).
5. **Accessibility Suite:** `bun run test:a11y` (Playwright + axe-core accessibility checks).
6. **Registry Boundaries:** `bun run check:registry` (verifies independence of registry blocks).

## Interpreting Gate Outputs

- **Never ignore counts:** Read the number of checked files and passing tests. A gate that checked 0 files when changes exist has failed its purpose.
- **Size gate reports:** Look at the specific function and line reported. Refactor using early returns or extract discrete subcomponents as documented in `refactor-code`.
- **Comment gate reports:** Check the reported file and line. Convert into JSDoc above exports, a fixed form (`// vendor:`, `// a11y:`), or remove the comment.
- **Never weaken a gate to pass:** Thresholds and gates exist to prevent degradation; adjust code to satisfy gates, never modify gate limits to accommodate unverified code.
