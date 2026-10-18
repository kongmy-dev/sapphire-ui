---
name: add-rule
description: Establish a new rule or gate in Sapphire UI. Use when recurring review findings or architectural constraints require automated enforcement. Guides defining principle IDs, creating AST gates, and testing failure scenarios.
---

# Add Rule — Sapphire UI

A rule in Sapphire UI is never established as unenforced prose. A rule lands together with its automated gate and an accompanying test proving that the gate fires when the rule is broken.

## Steps to Add a Rule

### 1. Define the Rule and Principle ID
- Choose the next available stable ID in `docs/coding/principles.md`.
- Formulate the rule in one unambiguous sentence: what is required, where it applies, and what is prohibited.

### 2. Implement the Gate
- Place automated checks under `tooling/gates/<rule-name>.ts`.
- Prefer TypeScript AST parsing (`tooling/source/parse.ts`) over regex where structural syntax is checked.
- Ensure the gate takes target files as arguments and defaults to every in-scope file from `tooling/gates/scope.ts`.
- Expose a pure function over file names and text, report through `tooling/gates/report.ts`, and let only `main()` touch git or the file system. A gate that checked nothing fails.
- Ensure the error message clearly states the remediation action.

### 3. Plant a Violation Test
- Create `tooling/gates/<rule-name>.test.ts`.
- Assert that a valid example passes and that an empty file list fails.
- Feed the pure function a real violation copied from this repository or its history, and assert the file, line and rule ID it reports.
- Revert the check and confirm the test fails.

### 4. Wire the Gate
- Add the gate to `package.json` scripts.
- Incorporate into `bun run gate` or the pre-push check.
- Update `docs/coding/principles.md` with the new rule, its gate, and status `built`.
