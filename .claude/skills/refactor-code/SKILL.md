---
name: refactor-code
description: Refactor Sapphire without losing public behaviour, evidence or ownership boundaries.
---

# Refactor code

Use the rules in `CLAUDE.md` and types guidance in
`.claude/skills/typescript/SKILL.md`. Pin observable behaviour before moving it.
Keep structural changes separate from behaviour changes when that makes review possible.

Choose the slice before moving code. For KEEP, name the existing behaviour test
or old-versus-new comparison that must remain green. For REDESIGN, first state
the new behaviour in a failing regression. Typecheck and lint alone pin neither.
If a structural change exposes a behaviour bug, give the fix its own regression
and commit so the contract change stays reviewable.

Subtract dead wrappers and exports before adding an abstraction. Invert guard
conditions, use typed lookup tables for value selection, and split only at a
coherent UI or data boundary. P-7 thresholds stay fixed; a helper that exists
only to move a branch out of the measurement is not a simplification.

For P-1 findings, preserve useful reasoning in a regression test, an ADR or the
smallest relevant skill. Names and types replace restated descriptions; open
work belongs in `docs/backlog.md`. Do not create another copy of a rule table.
Read a comment before removing it; move any invariant or decision into its owning
test or ADR. Migrate all callers of a reshaped internal API and remove its obsolete
path in the same change. Preserve published contracts and migration obligations.

Run the affected tests, scoped gates, typecheck and integrated gate; use browser
checks when the behaviour depends on layout or focus. Commit owned paths and
report any check that could not run. An independent session reviews the result.
Use `.claude/skills/gate/SKILL.md` to distinguish cached from fresh proof. Report
where reader load fell, the behaviour pin and the command that verified it.
