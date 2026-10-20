---
name: gate
description: Run and interpret all quality gates in Sapphire UI before committing or pushing. Explains gate execution sequence, interpreting size gate and comment gate outputs, and verification standards.
---

# Gate — Sapphire UI

Quality gates verify correctness, token adherence, structural discipline and the frozen `src/` across the repository.

Always run gates before committing or pushing changes.

## The Gate Sequence

Run the gate command:
```bash
bun run gate
```

The standard gate pipeline executes:
1. **Linter & Formatter:** `bun run lint` (Biome check on types, formatting, syntax, and class ordering).
2. **Type check and unused code:** `bun run typecheck`, `bun run knip`.
3. **Comment Gate (P-1):** `bun run comment-check` (every comment outside the forms in ADR-0001, in every in-scope TS, TSX, JS and CSS file).
4. **Size Gate (P-7):** `bun run size-check` (cognitive complexity, function length, file length and nesting limits, on every in-scope TS and TSX file).
5. **Dependency Gate (P-12):** `bun run dep-check` (exact devDependencies, `.bun-version`, TypeScript 6.0.x, peers).
6. **Freeze Gate (P-17):** `bun run freeze-check` (`src/` is unchanged).
7. **Unit Tests:** `bun run test` (`bun test` over the gates and scripts).
8. **Registry Boundaries:** `bun run check:registry` (verifies independence of registry blocks).

Token (P-5), full CSS budget (P-13) and generated-file checks (P-16) are part of `bun run gate`. `bun run test:a11y` (Playwright + axe) runs in CI beside the gate.

In scope is every tracked file outside the frozen lane: `src/`, `registry/blocks/`, `tests/registry-consumer/app/`, `design/`.

## Interpreting Gate Outputs

- **Never ignore counts:** Every gate prints `<n> files checked`. A gate that checked 0 files prints `FAIL — nothing was measured` and exits 1.
- **Failure lines** read `file:line  rule-ID  what is wrong`, then an indented line saying what to write instead.
- **Size gate reports:** Look at the specific function and line reported. Refactor using early returns or extract discrete subcomponents as documented in `refactor-code`.
- **Comment gate reports:** Check the reported file and line. Move what the comment knows into a name, a type, a test name or an ADR, then delete it (P-1, ADR-0001).
- **Freeze gate reports:** Revert the change under `src/`. A v3 fix goes to the `v3` branch; v4 work goes in the new folders (P-17).
- **Never weaken a gate to pass:** Thresholds and gates exist to prevent degradation; adjust code to satisfy gates, never modify gate limits to accommodate unverified code.
