# Coding Principles

Every rule has an ID, a gate and a test that feeds the gate a real violation (P-15). A failing gate prints `file:line`, the rule ID and what to write instead. `V4-PLAN.md` §7 lists every rule; this table lists the ones with a gate today.

The gates check every tracked file outside the frozen lane: `src/`, `registry/blocks/`, `tests/registry-consumer/app/` and `design/`. When a principle and a gate disagree, the gate is what runs, so raise the mismatch rather than picking one.

| ID | Rule | Gate | State |
|---|---|---|---|
| **P-1** | No comments in TS, TSX or CSS. Two forms are allowed, both defined in `docs/adr/0001-rules-ship-with-gates.md`. | Comment gate (`tooling/gates/comments.ts`): `bun run comment-check`, and on each edit through `.claude/hooks/check-edit.sh` | built |
| **P-2** | `src/` never imports `registry/`, `scripts/` or `tests/`; `registry/blocks/` never imports `src/`. | `bun run check:registry` | built |
| **P-3** | Types carry the rules: no `any`, no `!`, no `as` but `as const`, `type` over `interface`, variants as `as const` tuples with derived unions, no `enum`. | `tsc` strict and Biome (the `as` ban is the `tooling/biome/no-cast.grit` plugin) | built |
| **P-5** | Tokens only: no colour or length literal outside `css/tokens.css` (font-relative `em` and `ch` excepted), every `var()` resolves. `--color-accent` is decorative; text on light surfaces uses `--color-accent-text`. | Token gate (`tooling/gates/tokens.ts`): `bun run token-check`; it joins `bun run gate` in P2 | built |
| **P-6** | Subtract before adding: a new export, file or dependency has its consumer in the same change. | knip | built |
| **P-7** | Minimise reader load, at this tree's own p95: cognitive complexity 7, function lines 89, file lines 474, nesting 5. | Size gate (`tooling/gates/size.ts`): `bun run size-check`; Biome `noNestedTernary`, `noUselessElse`, `noParameterAssign` | built |
| **P-8** | Accessible: interactive components pass axe and work from the keyboard. | Playwright a11y suite: `bun run test:a11y` | built |
| **P-12** | The toolchain is pinned (exact devDeps, `.bun-version`, TypeScript 6.0.x) and React and Radix stay peers. | Dependency gate (`tooling/gates/deps.ts`): `bun run dep-check` | built |
| **P-15** | A gate can fail: its test feeds it a real past violation. | `bun test` over `tooling/gates/` | built |
| **P-17** | `src/` is frozen until P9: a v3 fix goes to the `v3` branch, v4 work to the new folders. | Freeze gate (`tooling/gates/freeze.ts`): `bun run freeze-check` | built |

## Decisions and Enforcements

- **Scope:** `tooling/gates/scope.ts` lists the tracked files outside the frozen lane. Every gate that walks files uses it, and a gate that checked nothing fails.
- **Size limits:** the limits are this repository's measured 95th percentile, in `tooling/quality-metrics/check.ts`. They are lowered, never raised.
- **Adding or modifying a rule:** use the `add-rule` skill. Every rule arrives with its gate and a test that feeds the gate a real violation.
