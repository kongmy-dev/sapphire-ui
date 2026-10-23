# Sapphire UI

Sapphire UI is KONGMY Digital Solutions' design system: navy, gold, editorial type,
shared CSS, typed React clients and native custom elements. Read `DESIGN.md` for UI work.
`AGENTS.md` links to this file. `V4-PLAN.md` remains the release checklist until release.

## Working rules

- State unresolved input/output choices before building; choose the narrowest useful scope.
- Answer an experimentally testable question with an experiment. Verify unfamiliar APIs with ctx7;
  if it is unavailable, use the dependency's official documentation and report that fallback.
- Use Bun for installs, scripts and local tools. Only the approved CI publishing step uses npm.
- A measurement names its command and commit. Mark other claims inferred or unverified.
- Record an architectural decision in an ADR before implementation; keep open work in `docs/backlog.md`.
- Fix a rule wherever it applies. A repeated correction becomes a gate; judgment belongs in a skill.
- Preserve concurrent work. Stage explicit owned paths; commit a short `type: subject` line.
- Never push, publish, tag, change pins or perform destructive operations without authorization.
- Never clear shared caches or Docker state to make a check pass. Use `.yaml` for new YAML.
- Reuse cached evidence only for unchanged inputs; use `bun run gate --force` for fresh proof.

## Rules and enforcement

| ID | Rule | Enforcement |
|---|---|---|
| P-1 | No source comments except justified style/complexity suppressions or an untestable vendor-bug URL. | `comment-check` |
| P-2 | Imports follow css → lib/hooks → components/elements → blocks → site; runtime never imports tooling; every tracked source is reached. | `boundary-check`, Knip |
| P-3 | No `any`, assertions except `as const`, non-null assertions, interfaces or enums; derive props and variant unions. | TypeScript, Biome |
| P-4 | Rendered classes and attribute values match CSS; native elements preserve the shared contract. | `contract-check`, equivalence tests |
| P-5 | Tokens own colours and absolute lengths; mappings and DESIGN tables agree; every variable resolves. | `token-check` |
| P-6 | Each new file, export and dependency has a consumer in the same change. | Knip |
| P-7 | Limits stay 7 cognitive complexity, 89 function lines, 474 file lines and 5 nesting levels; improve measured p95 without raising limits. | `size-check` |
| P-8 | Examples are accessible in both schemes; interactions support keyboard input. | `test:a11y`, coverage checks |
| P-9 | Examples and reached states match zero-tolerance pins except ADR-0011's named captures; only reviewed `bun run pin` updates them. | `test:visual` |
| P-10 | Tests use public props and DOM roles, assert behaviour without snapshots, and cover at least 95% of lines/functions per runtime/example file. | `test`, `coverage-check`, boundary gate |
| P-11 | Docs describe the current contract; CLAUDE ≤120 lines, consumer skill ≤60; ADRs <1,000 words; skill paths exist. | `docs-check`, `skill-refs-check` |
| P-12 | Exact devDeps, pinned Bun/TypeScript, no runtime dependencies, optional peers, versioned registry dependencies. | `dep-check` |
| P-13 | Full CSS stays within its approved gzip budget. | `budget-check` |
| P-14 | Public API changes follow semver and have migration entries. | `api-check`, migration tests |
| P-15 | A gate rejects a planted violation and an empty scope; failures give file, line, rule and fix. | Gate tests |
| P-16 | Every committed generated file matches its generator. | `generated-check` |

## Layout

| Path | Owns |
|---|---|
| `css/` | Layer order, fonts, tokens, base, layout and Tailwind mapping |
| `components/<name>/` | Shared CSS, React implementation, named examples and public behaviour tests |
| `elements/` | Browser registrations and lifecycle clients; imports only `lib/` |
| `lib/`, `hooks/` | Shared behaviour and React hooks |
| `blocks/` | Vendored registry compositions and their declared dependencies |
| `site/`, `tooling/site/` | Static catalogue and its builder |
| `tooling/` | Gates, package/registry builders, migration and measurement |
| `tests/` | Browser accessibility, keyboard, lifecycle and pinned-state tests |
| `registry/legacy-r/` | Frozen registry assets; copied without regeneration |
| `skills/sapphire/` | Consumer instructions shipped with package and registry |
| `docs/adr/` | Decisions and their critical reasoning |

## Commands

```sh
bun install --ignore-scripts --frozen-lockfile
bun run generate
bun run lint:fix
bun run typecheck
bun run gate
bun run test:a11y
bun run test:visual
bun run build
bun run build:docs
bun run test:package
bun run migrate <app> --check
```

Use the package manifest for the complete command list. Tests preload happy-dom before
Testing Library. Layout, portals, focus trapping and pointer resizing need browser checks.
New files must be staged or explicitly named in scoped gates so they are counted.
The gate uses Turbo with four concurrent tasks and a local cache (ADR-0006).
Tests restore coverage before its check; Git-dependent checks always run fresh.
Report incomplete checks rather than implying a clean integrated result.

## Skills

Read `.claude/skills/coding-principles/SKILL.md` and
`.claude/skills/typescript/SKILL.md` before TypeScript work. Component work also reads
`.claude/skills/sapphire-component/SKILL.md`. Refactoring, new gates and independent review use
`refactor-code`, `add-rule` and `review-code` in `.claude/skills/` respectively.
Use `.claude/skills/gate/SKILL.md` to choose verification and interpret cached evidence.
Consumer setup is in `skills/sapphire/SKILL.md`, `docs/package-v4.md` and `docs/registry-v4.md`.
