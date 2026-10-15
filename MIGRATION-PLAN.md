# Sapphire UI: toolchain modernisation and coding-principles plan

> **Status:** Approved; decisions D1–D7 are settled. Start the next session at Phase 0.
> **Baseline:** `f6720d3` (master, v3.0.2), measured 2026-10-12.
> **Target toolchain:** Bun 1.4.3 · TypeScript 6.0.3 · Biome 2.5.15 · knip 6.41.0 · Vite 8 · Tailwind v4.
> **Rule for this plan and everything it produces:** docs, skills and commits in this repo name no
> other repository. Describe a pattern by what it does, not by where it came from.

---

## 0. Notes for whoever picks this up

- **`bun` is not on `PATH` in agent shells.** Use `export PATH=$HOME/.bun/bin:$PATH` first. Local Bun
  is now **1.4.3** (upgraded during review).
- `npm`/`node` are not on `PATH` either. Use `bun pm view <pkg> version` for registry lookups.
- One phase = one commit, using the Conventional Commits style already in `git log`. Run the gate for
  that phase before committing.
- Every number below came from a command; re-measure rather than trusting this file if the tree has moved.

---

## 1. Settled decisions

| # | Decision |
|---|---|
| D1 | **Test runner:** move from vitest + jsdom to **`bun test` + `@happy-dom/global-registrator`**. Pilot on two files first. |
| D2 | **Comments:** keep JSDoc (`/** */`) directly above exported declarations and members of exported types, because it ships in `.d.ts` as consumer IDE docs. Every other comment must be one of five fixed forms (§P5.3). Gate it on edited files only, not by retrofitting the tree. |
| D3 | **React peer** widens to `^19.0.0`; devDeps pin `19.3.0`. |
| D4 | **Bun 1.4.3**, pinned in `.bun-version`, `packageManager` and CI. |
| D5 | **`@tanstack/react-table` stays on 8.21.3.** v9 is its own PR later (Track T1). |
| D6 | **Keep the `./stylelint` export** through v3 and document that it needs `stylelint-config-standard`; remove it in v4. |
| D7 | **Formatter unchanged** (`lineWidth: 80`, `trailingCommas: all`, single quotes, double JSX quotes). No repo-wide reformat. |

---

## 2. Bug inventory (from the review)

| ID | Problem | Evidence | Fixed in |
|---|---|---|---|
| B1 | `react-resizable-panels` is bundled into `dist` despite being a peer | `dist/node_modules/react-resizable-panels/` exists; missing from `external` in `vite.config.ts` | P0 |
| B2 | Peer `react@^19.3.0` excludes the 19.2.7 that is installed and tested; same for panels (`^4.14.4` vs 4.12.2). Neither is in devDeps, so bun auto-installs whatever version | `bun outdated` | P0 |
| B3 | The pre-commit hook is dead: husky and lint-staged aren't installed and `core.hooksPath` is unset | `git config core.hooksPath` is empty | P0 + P4 |
| B4 | Dependabot ecosystem `npm` doesn't update `bun.lock` | commit `01f35af "sync bun.lock"` after Dependabot PR #9 | P0 |
| B5 | `scripts/`, `tooling/`, `worker/`, `tests/`, `vite.docs.config.ts`, `vitest.config.ts` aren't in any tsconfig | `tsconfig.node.json` includes only `vite.config.ts` | P2 |
| B6 | `strict` is off in `tsconfig.app.json` | A full strict probe gives 4 errors (§P2.3) | P2 |
| B7 | `AGENTS.md` and `CLAUDE.md` have drifted (AGENTS still says ESLint); README L48 says ESLint | `diff CLAUDE.md AGENTS.md` | P0 |
| B8 | CI uses `bun-version: latest`; smoke test uses `shadcn@latest` | `ci.yml`, `publish.yml`, `scripts/smoke-registry.ts:217` | P6 |
| B9 | Publish uses `npm publish`, `node -p` and an unfrozen install, and doesn't wait for CI | `publish.yml` L41, L58, L69+ | P6 |
| B10 | Registry JSON lists npm deps unversioned (e.g. `"react-day-picker"`) | `dist-docs/r/calendar.json` | P6 |
| B11 | `./stylelint` export extends a config that isn't a dependency | `package.json` exports | P0 (doc only, D6) |
| B12 | `CLAUDE.md` names other local repositories by path (`~/Projects/…`) in the two-lane section | `git grep -n "Projects/" CLAUDE.md` | P0 |
| B13 | AI skills are flat `.md` files without frontmatter, so tools don't discover them; `react.md` mandates `forwardRef`, `testing.md` teaches vitest | `.claude/skills/*.md` | P5 |

---

## 3. Dependency targets

**Policy:** devDeps are pinned exactly (enforced by `bunfig.toml [install] exact = true`). Runtime deps and peers keep caret ranges, because a library must not pin its consumers.

### Runtime `dependencies`
| Package | Now | Target |
|---|---|---|
| tailwind-merge | ^3.6.0 | **^3.7.0** |
| class-variance-authority | ^0.7.1 | unchanged |
| clsx | ^2.1.1 | unchanged |
| js-cookie | ^3.0.8 | unchanged |

### `peerDependencies`
| Package | Now | Target |
|---|---|---|
| react, react-dom | ^19.3.0 | **^19.0.0** |
| react-resizable-panels | ^4.14.4 | **^4.0.0**, plus `peerDependenciesMeta: { optional: true }` |
| @radix-ui/* (19 packages) | ^1.0.0 / ^2.0.0 | unchanged |

### `devDependencies`, exact pins
| Package | Now | Pin | Note |
|---|---|---|---|
| react / react-dom | (auto peer 19.2.7) | **19.3.0** | new devDep |
| react-resizable-panels | (auto peer 4.12.2) | **4.14.4** | new devDep |
| @biomejs/biome | ^2.5.3 | **2.5.15** | needed for `nursery/noUnsafeTypeAssertion` |
| typescript | `6` | **6.0.3** | **Don't go to 7.x**: it has no classic compiler API, which `tooling/quality-metrics`, `vite-plugin-dts` and knip all need |
| knip | — | **6.41.0** | new |
| @types/bun | — | **1.4.2** | new (latest published) |
| happy-dom, @happy-dom/global-registrator | — | **21.0.1** | new (P5) |
| vitest, @vitest/coverage-v8, jsdom | 4.1.11 / 4.1.11 / 29.1.1 | **remove** | P5 |
| react-day-picker | `10` | **10.0.2** | already latest; also fix B10 |
| date-fns | ^4.4.0 | 4.4.0 | |
| vite / @vitejs/plugin-react / vite-plugin-dts / vite-plugin-sitemap | ^ | 8.3.4 / 6.1.2 / 5.1.2 / 0.8.2 | |
| tailwindcss / @tailwindcss/vite | ^4.3.3 | 4.3.3 | |
| @playwright/test | ^1.61.1 | **1.64.0** | re-install browsers |
| @axe-core/playwright | ^4.12.1 | **4.13.0** | new rules may add findings |
| @testing-library/react / dom / jest-dom / user-event | ^ | 16.3.3 / 10.4.2 / 7.0.0 / 14.6.7 | |
| @tanstack/react-table | ^8.21.3 | **8.21.3** | v9.2.8 later (T1) |
| cmdk / sonner / lucide-react | ^ | 1.1.1 / 2.0.8 / 1.55.0 | registry blocks |
| @radix-ui/react-icons | ^1.3.2 | 1.3.2 | remove if knip reports it unused |
| react-router-dom | ^7.18.4 | 7.18.4 | docs app |
| @radix-ui/* dev copies | ^ | pin to the installed versions | all already latest |
| @types/react / react-dom / node / js-cookie | ^ | 19.3.0 / 19.3.0 / 26.6.5 / 3.0.6 | |
| wrangler | ^4.149.0 | 4.149.0 | |
| shadcn (smoke script only) | `@latest` | **4.21.4** | pinned in the script string, not a devDep |

---

## Phase 0: Bug fixes and repo hygiene

**Commit:** `fix: externalise resizable-panels, widen peers, drop dead hooks, unify agent docs`

1. **B1, `vite.config.ts`**: add `'react-resizable-panels'` to `rollupOptions.external`.
2. **B2, `package.json`**: apply the peer and devDep changes from §3, add `peerDependenciesMeta`, then run `bun install`.
3. **B3**: `git rm -r .husky .lintstagedrc.json`.
4. **B7 + B12, agent docs**:
   - Make `CLAUDE.md` the single file. Bring over the "Size and shape" section from `AGENTS.md`, and change the Commands block to Biome wording.
   - Rewrite the two-lane section without repo names or paths: "product/client apps scaffolded from the internal stack template", "admin blocks adapted from an upstream shadcn admin reference", and "sapphire never imports from consuming apps; contract-aware blocks live in the consuming template".
   - Then `git rm AGENTS.md && ln -s CLAUDE.md AGENTS.md && git add AGENTS.md`.
   - Fix README line 48 ("ESLint" → "Biome").
   - Check: `git grep -nIi -E "Projects/|eslint" -- ':!bun.lock' ':!CHANGELOG.md'` returns nothing.
5. **B4, `.github/dependabot.yml`**: ecosystem `bun`; groups `@radix-ui/*`, `@testing-library/*` + `@playwright/*` + `@axe-core/*`, and `vite` + `@vitejs/*` + `vite-plugin-*`. Add a second entry for `github-actions`.
6. **B11, README**: add a note that `@kongmy-dev/sapphire-ui/stylelint` needs `stylelint` and `stylelint-config-standard` installed by the consumer.

**Verify:**
```bash
bun run build && test ! -d dist/node_modules/react-resizable-panels
bun run lint && bun run test && bun run test:registry
```

---

## Phase 1: Pin the toolchain

**Commit:** `build: pin bun 1.4.3, exact devDeps, biome 2.5.15`

1. Add `.bun-version` containing `1.4.3`.
2. In `package.json`, add `"packageManager": "bun@1.4.3"` and `"engines": { "bun": ">=1.4.3" }`.
3. Create `bunfig.toml`:
   ```toml
   [install]
   exact = true
   ```
   (The `[test]` section is added in P5.)
4. Pin every devDep to §3: edit `package.json` by hand, then `bun install`. Check that `grep -c '"\^' package.json` only matches entries in `dependencies` and `peerDependencies`.
5. Biome:
   ```bash
   bun add -d --exact @biomejs/biome@2.5.15
   bun x --bun biome migrate --write
   git mv biome.json biome.jsonc
   ```
   Set `"$schema": "./node_modules/@biomejs/biome/configuration_schema.json"` and add `"lineEnding": "lf"` to `formatter`. Leave all formatting settings unchanged (D7).
6. Replace bare `bunx` in `scripts/verify-consumer.ts` (L106, L108) with `bun x --bun` so the local pinned `tsc`/`vite` are used.

**Verify:** `rm -rf node_modules && bun install --frozen-lockfile && bun run lint && bun run build && bun run test`

---

## Phase 2: TypeScript strictness everywhere

**Commit:** `build(ts): shared strict base config; typecheck scripts, tooling and worker`

1. **Create `tsconfig.base.json`:**
   ```json
   {
     "compilerOptions": {
       "target": "ES2023",
       "lib": ["ES2023", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "moduleResolution": "bundler",
       "moduleDetection": "force",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "verbatimModuleSyntax": true,
       "erasableSyntaxOnly": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "skipLibCheck": true,
       "strict": true,
       "exactOptionalPropertyTypes": true,
       "noUncheckedIndexedAccess": true,
       "noImplicitReturns": true,
       "noImplicitOverride": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noFallthroughCasesInSwitch": true,
       "noUncheckedSideEffectImports": true,
       "forceConsistentCasingInFileNames": true
     }
   }
   ```
2. **`tsconfig.app.json`** extends the base, keeps `tsBuildInfoFile`, sets `types: ["vite/client"]` (plus `"bun"` after P5 for test files) and `include: ["src"]`.
   **`tsconfig.node.json`** extends the base, keeps `tsBuildInfoFile`, sets `types: ["bun"]`, and includes:
   `["*.config.ts", "scripts/**/*.ts", "tooling/**/*.ts", "worker/**/*.ts", "tests/*.ts", "registry/**/*.ts"]`.
   Leave `tests/registry-consumer/` out; it has its own tsconfig. Add `@types/bun@1.4.2`.
   Note: `vite-plugin-dts` uses `tsconfig.app.json`, so the emitted `.d.ts` follow the new flags.
3. **Fix the four known strict errors** (exact output from the probe):
   | File:line | Error | Fix |
   |---|---|---|
   | `src/components/AnalyticsElement.ts:141:11` | TS18048 `'n' is possibly 'undefined'` | `n` comes from `getElementsByTagName('script')[0]`. Guard it: `const first = document.getElementsByTagName('script')[0]; if (first?.parentNode) first.parentNode.insertBefore(s, first); else document.head.append(s);` |
   | `src/components/AnalyticsElement.ts:141:41` | TS2345 `HTMLScriptElement \| undefined` → `Node \| null` | same guard as above |
   | `src/components/ui/FormField.tsx:77:12` | TS2375 (exactOptionalPropertyTypes): `required: boolean \| undefined` passed to `Label` | spread conditionally: `{...(required !== undefined && { required })}`, or type the prop `required?: boolean \| undefined` on `Label` |
   | `src/lib/consent.test.ts:91:11` | TS2488 destructuring a possibly-undefined `mock.calls[n]` | `const call = cookieMock.set.mock.calls.at(-1); expect(call).toBeDefined(); const [, , options] = call ?? [];` (this file is rewritten in P5 anyway) |
   Then fix whatever the newly included node files report (`tsc -b` lists them). This number hasn't been measured; record it in the commit message.
4. **Check the public surface:** before and after, run `bun run build && find dist -name '*.d.ts' -exec cat {} + | sha1sum`. If the hash changes, diff and confirm that no public prop type got narrower. Accept `?: T` turning into `?: T | undefined`; reject anything that removes options.
5. Add the script `"typecheck": "tsc -b"`.

**Verify:** `bun run typecheck && bun run build && bun run test`

---

## Phase 3: Strict Biome rules

**Commit:** `style(lint): strict rule set, zero warnings`

1. Add to `linter.rules` in `biome.jsonc` (keep the existing a11y/security/suspicious/complexity/style exceptions):
   ```jsonc
   "style": {
     "noDescendingSpecificity": "off",
     "noUnusedTemplateLiteral": "error",
     "useConst": "error",
     "useImportType": "error",
     "noNonNullAssertion": "error",
     "noEnum": "error",
     "noNestedTernary": "error",
     "noUselessElse": "error",
     "noParameterAssign": "error"
   },
   "complexity": { "noImportantStyles": "off", "noImplicitCoercions": "error" },
   "suspicious": {
     "noArrayIndexKey": "off",
     "noExplicitAny": "error",
     "noDoubleEquals": "error",
     "noImplicitAnyLet": "error"
   },
   "correctness": { "noUnusedVariables": "error", "noUnusedImports": "error" },
   "nursery": {
     "noUnsafeTypeAssertion": "error",
     "useSortedClasses": { "level": "warn", "options": { "functions": ["clsx", "cva", "cn"], "attributes": ["className", "class"] } }
   }
   ```
2. Add a test override: for `**/*.test.ts`, `**/*.test.tsx`, `tests/**`, turn off `noExplicitAny`, `noNonNullAssertion` and `noUnsafeTypeAssertion`.
3. Keep the `src/components/*Element.ts` override (vanilla custom-element code) as it is.
4. **Shrink the per-file override** for Toast, Dialog, PageSection, SEOHead, SiteFooter, SiteHeader, `src/pages/**` and consent: fix each file and remove it from the list. The goal is to delete the override block entirely. Only `src/pages/**` (the docs app) may remain.
5. `bun x --bun biome check --write --unsafe` fixes the 32 `useSortedClasses` warnings. Review the diff, which should only reorder classes.
6. Fix the rest by hand. The probe found about 58 errors: `noExplicitAny` 14, `noNestedTernary` 11, `noParameterAssign` 3, `noNonNullAssertion` 3, and others. Re-run, because the override scoping in the probe was approximate.
7. Scripts: `"lint": "biome check --error-on-warnings"`; `lint:fix` and `format` → `biome check --write`.

**Verify:** `bun run lint` (0 errors, 0 warnings) `&& bun run test && bun run test:a11y`. Nested-ternary rewrites in components can change rendering, so a11y must pass.

---

## Phase 4: One gate, knip and a native pre-push hook

**Commit:** `build: single bun run gate, knip unused-check, pre-push hook`

1. `bun add -d --exact knip@6.41.0`, then create `knip.json`:
   ```json
   {
     "$schema": "https://unpkg.com/knip@6/schema.json",
     "entry": [
       "src/index.ts",
       "src/elements.ts",
       "src/main.tsx",
       "src/components/*Element.ts",
       "registry/items.ts",
       "registry/blocks/*.tsx",
       "scripts/*.ts",
       "tooling/**/*.ts",
       "worker/*.ts",
       "tests/*.spec.ts"
     ],
     "project": ["src/**/*.{ts,tsx}", "registry/**/*.{ts,tsx}", "scripts/**/*.ts", "tooling/**/*.ts", "worker/**/*.ts"],
     "ignoreDependencies": ["stylelint-config-standard"]
   }
   ```
   knip also reads `package.json → exports` as entries, so every subpath export is checked. Iterate until `bun run unused-check` is clean. Fix real findings by deleting code; add an `ignore` entry only for code with a consumer that knip can't see, and say why in the commit.
2. **Size gate on changed files.** Add `tooling/gates/changed.ts`. It runs `git diff --name-only --diff-filter=ACMR origin/master...HEAD` plus unstaged changes, keeps `*.ts`/`*.tsx`, and passes them to `tooling/quality-metrics/check.ts`. It prints `size gate: N file(s) checked` and **exits 1 if asked to check nothing while there are TS changes**. The whole tree stays exempt, per the documented decision in `AI-CODE-QUALITY.md`.
3. `package.json` scripts:
   ```json
   "prepare": "git config core.hooksPath .githooks || true",
   "typecheck": "tsc -b",
   "unused-check": "knip",
   "size-check": "bun tooling/gates/changed.ts",
   "gate": "bun run lint && bun run typecheck && bun run unused-check && bun run size-check && bun run test && bun run check:registry"
   ```
   **About `prepare`:** today it runs `bun run build`, which runs for every git-dependency consumer and doubles as a build step. Move the build into `prepublishOnly` instead (publish.yml already builds explicitly).
4. Create `.githooks/pre-push` (mode 755):
   ```sh
   #!/bin/sh
   exec bun run gate
   ```
   Then run `bun run prepare` once locally. Never use `--no-verify`.

**Verify:** `bun run gate` passes; after `git push --dry-run`, the hook has run.

---

## Phase 5: AI skills and principles (B13), plus the test-runner migration (D1)

Skills come before the test-runner rewrite so that the rewrite already follows the updated `testing` skill.

### P5.1 Current state: are AI skills already in this repo?
**Partly. Reference docs exist; process skills and the principles file don't.**

| Exists today | Format | Problem |
|---|---|---|
| `.claude/skills/{react,css,testing,consumer}.md` | flat Markdown, no frontmatter | Not auto-discovered; loaded only because CLAUDE.md's table says so. `react.md` mandates `forwardRef`; `testing.md` teaches vitest |
| `.claude/instructions/design-system.md` | flat Markdown | Fine; referenced from CLAUDE.md |
| `.claude/hooks/size-gate.sh` + `settings.json` | PostToolUse hook | Size gate only, no comment gate |
| `.agents/skills/{aeo-seo-optimizer,low-carbon-web-generator}/SKILL.md` | proper skill folders | Fine, and discovered. Leave them |
| — | — | **Missing:** `coding-principles`, `review-code`, `refactor-code`, `gate`, `add-rule` skills; `docs/coding/principles.md` |

### P5.2 Convert the existing skills (commit `docs(skills): convert to discoverable SKILL.md folders`)
Move each file into `.claude/skills/<name>/SKILL.md` with frontmatter:
```md
---
name: sapphire-react
description: Build or edit a React component in src/components/ui or registry/blocks — CVA variants, Radix Slot, tokens via CSS custom properties, a11y. Load before writing any .tsx here.
---
```
| Old file | New folder | Content changes |
|---|---|---|
| `react.md` | `sapphire-react/` | New components take `ref` as a prop (React 19), no `forwardRef`. Existing `forwardRef` files are converted only when touched (Track T2). Add "every new export → `src/index.ts` + `package.json` exports in the same change; knip enforces it" |
| `css.md` | `sapphire-css/` | No content change beyond Biome wording |
| `testing.md` | `sapphire-testing/` | Rewritten in P5.6 to `bun:test` |
| `consumer.md` | `sapphire-consumer/` | Add the `./stylelint` peer note (D6) |

Update CLAUDE.md's "AI Skills" table to the new names. Make each skill discoverable by both tools: `.agents/skills/<name>` as a relative symlink to `../../.claude/skills/<name>`, or the other way round, whichever the CLAUDE.md table says is canonical. Use one location of truth.

### P5.3 New process skills (commit `docs(skills): coding-principles, review, refactor, gate, add-rule`)
Write them for a **published React component library**. No backend, tenancy, money or API-contract content.

| Skill | Purpose | Key content |
|---|---|---|
| `coding-principles` | Load before writing any `.ts`/`.tsx` | The rules in P5.4 with examples, each naming its gate |
| `review-code` | Before a push, or after another agent writes code | Review a diff against `coding-principles`. Every finding cites a rule ID; "I'd write it differently" is not a finding. A separate comments pass. Reports only, doesn't edit |
| `refactor-code` | Cleaning up, acting on review or size-gate findings | Pin behaviour with a test, subtract first, move in small steps, keep structure and behaviour in separate commits. How to remove a comment without losing its knowledge (move it into a name, type, test, JSDoc or `docs/`) |
| `gate` | "Run the checks", before commit or push | `bun run gate` order; read the counts, not only the exit code; a gate that checked 0 files has failed; never weaken a gate to pass |
| `add-rule` | When the same review finding repeats | A rule lands together with its gate, plus a test that plants a violation and watches the gate fire. Add a row to `docs/coding/principles.md` |

### P5.4 `docs/coding/principles.md` (same commit)
A table with columns `ID | Principle | Gate | State (built / partly / to build)`. IDs are stable and never reused.

| ID | Principle | Gate |
|---|---|---|
| P-1 | Comments: JSDoc only above exported declarations and members of exported types. Other comments only as `// vendor: <link> <fact>`, `// biome-ignore <rule>: <reason>`, `// @ts-expect-error <issue link>`, `// a11y: <WCAG ref>`, or an SPDX header | Comment gate on edited files (P5.5) |
| P-2 | `src/` never imports `registry/`, `scripts/`, `tests/`; `registry/blocks/` never imports `src/` | `check:registry` (built); extend it to the `src/` direction |
| P-3 | No `any`, no `!`, no type assertion except `as const` outside tests | Biome (P3) |
| P-4 | Illegal states are unrepresentable: variant unions via CVA, discriminated unions over boolean + optional | tsc strict (P2) |
| P-5 | Minimise reader load | Size gate + Biome `noNestedTernary`/`noUselessElse`/`noParameterAssign` |
| P-6 | A new export needs a consumer in the same change; exports are explicit (`src/index.ts` + `package.json`) | knip (P4) |
| P-7 | A value with meaning is declared once as an `as const` object plus its union, never an `enum` | Biome `noEnum` + tsc `erasableSyntaxOnly` |
| P-8 | Tokens only: no hex in components; `--color-accent-text` for text on light surfaces | to build (a grep gate for `#[0-9a-f]{3,8}` in `src/components`) |
| P-9 | a11y first: every interactive component has a Playwright + axe case | `test:a11y` (built); a coverage check of components vs specs (to build) |
| P-10 | Peer deps stay peers; devDeps are pinned exactly | to build (a small script over `package.json`) |

### P5.5 Comment gate and edit hook (same commit as P5.3)
- `tooling/source/parse.ts`: TS AST helper (`ts.createSourceFile` + `ts.getLeadingCommentRanges`/`getTrailingCommentRanges`).
- `tooling/gates/comments.ts`: flags any comment that is neither one of the fixed forms nor a `/** */` block whose next token starts an `export` declaration or a member of an exported interface/type. It takes files as arguments; with none, it checks the changed files (reuse `changed.ts`). It prints `comment gate: N file(s), M stray`.
- `tooling/gates/comments.test.ts`: plants each allowed form and one stray comment, and asserts the gate fires.
- Rename `.claude/hooks/size-gate.sh` to `check-edit.sh`, which runs the comment gate **and** the size gate on the edited file (exit 2 with stderr goes back to the agent). Update `.claude/settings.json`.
- Add `comment-check` to the `gate` script.
- `AI-CODE-QUALITY.md`: document the comment gate and keep "do not retrofit". Existing comments go only when a file is touched. `src` currently has 892 comment-ish lines, so a blanket run would be waived on day one.

### P5.6 Test runner migration (commit `test: move unit tests to bun test + happy-dom`)
1. Install and remove:
   ```bash
   bun add -d --exact happy-dom@21.0.1 @happy-dom/global-registrator@21.0.1
   bun remove vitest @vitest/coverage-v8 jsdom
   git rm vitest.config.ts
   ```
2. **Scope `bun test` to `src`.** `tests/*.spec.ts` are Playwright specs and `bun test` would pick them up. In `bunfig.toml`:
   ```toml
   [test]
   root = "./src"
   preload = ["./src/test/setup.ts"]
   ```
3. `git mv vitest.setup.ts src/test/setup.ts` and rewrite it:
   ```ts
   import { GlobalRegistrator } from '@happy-dom/global-registrator';
   GlobalRegistrator.register();

   const { afterEach, expect } = await import('bun:test');
   const matchers = await import('@testing-library/jest-dom/matchers');
   const { cleanup } = await import('@testing-library/react');

   expect.extend(matchers);
   afterEach(cleanup);
   ```
   Register happy-dom **before** importing testing-library, which is why the dynamic imports are used. Keep the `ResizeObserver` and `matchMedia` stubs. Drop the `localStorage` polyfill if happy-dom's `Storage` passes `useLocalStorage.test.ts`.
   Add `src/test/matchers.d.ts` to augment `bun:test`'s `Matchers` with `TestingLibraryMatchers`.
4. Per-file conversion:
   | vitest | bun:test |
   |---|---|
   | `import { describe, it, expect, vi } from 'vitest'` | `import { describe, it, expect, mock, jest, spyOn } from 'bun:test'` |
   | `vi.fn(impl)` (26) | `mock(impl)` |
   | `vi.useFakeTimers()` / `useRealTimers()` / `advanceTimersByTime(n)` | `jest.useFakeTimers()` / `jest.useRealTimers()` / `jest.advanceTimersByTime(n)` |
   | `vi.restoreAllMocks()` (4) | `mock.restore()` |
   | `vi.hoisted` + `vi.mock('js-cookie', …)` (consent.test.ts) | a plain `const cookieMock = {...}` + `mock.module('js-cookie', () => ({ default: cookieMock }))` before importing `../consent` (use a dynamic `await import`) |
5. **Pilot:** convert `src/lib/utils.test.ts` (pure) and `src/lib/consent.test.ts` (module mock), then `src/hooks/useDebounce.test.ts` (fake timers) and `src/components/ui/__tests__/Dialog.test.tsx` (Radix portal + pointer). If Dialog fails on happy-dom pointer or portal behaviour, **stop and report**. The fallback is to keep D1 but run that one suite in Playwright component mode; don't bring back jsdom silently.
6. Convert the remaining files. `Coverage.test.tsx` is a meta test; rewrite or delete it depending on what it asserts.
7. Scripts: `"test": "bun test"`, `"test:coverage": "bun test --coverage --coverage-reporter=lcov"`.
8. `tsconfig.app.json` `types`: add `"bun"`; remove `"@testing-library/jest-dom"`.
9. Rewrite the `sapphire-testing` skill to match: file layout, setup, the mock table above, and "test names state behaviour; each test can fail".

**Verify:** `bun test` (record the pass count in the commit; it must equal today's vitest count) `&& bun run gate`.

---

## Phase 6: CI, publish and registry

**Commit:** `ci: pinned bun, single gate, gated bun publish, versioned registry deps`

1. **`ci.yml`**, `quality` job: `oven-sh/setup-bun@v2` with `bun-version-file: .bun-version`; `bun install --frozen-lockfile`; `bun run gate`; `bun run build` (for `dist`); `bun run test:registry`; `bun run smoke:registry`. The `a11y` job uses the same setup, then `bun x playwright install --with-deps chromium` and `bun run test:a11y`. Keep the cache step, keyed on `bun.lock` + `scripts/smoke-registry.ts`.
2. **`publish.yml`**:
   - Trigger: `workflow_run: { workflows: [CI], types: [completed], branches: [master] }`, with job `if: github.event.workflow_run.conclusion == 'success'`. Keep `workflow_dispatch`.
   - `bun-version-file`; `bun install --frozen-lockfile --ignore-scripts`.
   - Version: `VERSION="$(bun -p "require('./package.json').version")"`.
   - Publish to GitHub Packages with `bun publish --registry https://npm.pkg.github.com` (token via `NPM_CONFIG_TOKEN`/`.npmrc`). Publish to npm with `bun publish --access public --registry https://registry.npmjs.org/`. **Dry-run first:** `bun publish --dry-run`, and compare its file list with the current `npm pack --dry-run` output to make sure `files` is honoured the same way.
3. **`scripts/smoke-registry.ts:217`**: change `'shadcn@latest'` to `'shadcn@4.21.4'`, and move the version into a named constant at the top of the file.
4. **B10, `scripts/build-registry.ts`**: where `packageBase(spec)` produces each item's npm `dependencies`, look up the base name in `package.json` (`devDependencies` ∪ `dependencies` ∪ `peerDependencies`) and emit `${name}@^${major}` from the pinned version, e.g. `react-day-picker@^10`. Fail the build if an imported package isn't declared anywhere. Rebuild with `bun run build:docs` and check `dist-docs/r/calendar.json`.
5. **Check:** `bun run smoke:registry` still passes, with real `shadcn add` installing the versioned deps.

---

## Phase 7: Release 3.1.0

**Commit:** `release: v3.1.0`

1. Set `"version": "3.1.0"`.
2. `CHANGELOG.md` entry:
   - **Fixed:** `react-resizable-panels` is no longer bundled (it's an optional peer now). React peer widened to `^19.0.0`.
   - **Changed:** registry items declare versioned npm dependencies (e.g. `react-day-picker@^10`).
   - **Internal:** Bun 1.4.3, Biome 2.5.15 with strict rules, TypeScript strict, knip, `bun test` + happy-dom, single `bun run gate`, pre-push hook.
3. Full verification:
   ```bash
   bun run gate && bun run build && bun run test:a11y && bun run test:registry && bun run smoke:registry && bun run build:docs
   ```
4. Push. CI goes green, then publish runs.

---

## Separate tracks (not part of 3.1.0)

| Track | Work | Trigger |
|---|---|---|
| T1 | `@tanstack/react-table` 9.2.8: update `registry/blocks/data-table*`, run `test:registry` + `smoke:registry`, publish a registry note | Own PR after 3.1.0 |
| T2 | Replace `forwardRef` with ref-as-prop (54 files) | Only when a file is already being touched |
| T3 | Registry lane on the `radix-ui` monorepo package; the npm lane keeps its peers | Own PR; not breaking for the registry |
| T4 | Gates marked "to build" in `docs/coding/principles.md` (P-8 hex, P-9 a11y coverage, P-10 dep policy) | One gate per PR via the `add-rule` skill |
| T5 | v4.0.0: drop the `./stylelint` export (D6) | Next major |

---

## Next session: start here

1. `export PATH=$HOME/.bun/bin:$PATH && bun --version` should print `1.4.3`.
2. `git status` should be clean except for this file. Commit it first: `docs: add migration plan`.
3. Run Phase 0, then go phase by phase. Each phase ends with its **Verify** block, then a commit.
4. Stop and ask if: a strict flag narrows a public `.d.ts` type (P2.4), the happy-dom pilot fails on Radix (P5.6.5), or `bun publish --dry-run` packs different files than npm (P6.2).
