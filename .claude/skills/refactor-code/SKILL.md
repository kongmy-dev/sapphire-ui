---
name: refactor-code
description: Refactor Sapphire without losing public behaviour, evidence or ownership boundaries.
---

# Refactor code

Use the rules in `CLAUDE.md` and types guidance in
`.claude/skills/typescript/SKILL.md`. Pin observable behaviour before moving it.
Keep structural changes separate from behaviour changes when that makes review possible.

Subtract dead wrappers and exports before adding an abstraction. Invert guard
conditions, use typed lookup tables for value selection, and split only at a
coherent UI or data boundary. P-7 thresholds stay fixed; a helper that exists
only to move a branch out of the measurement is not a simplification.

For P-1 findings, preserve useful reasoning in a regression test, an ADR or the
smallest relevant skill. Names and types replace restated descriptions; open
work belongs in `docs/backlog.md`. Do not create another copy of a rule table.

Run the affected tests, scoped gates, typecheck and integrated gate; use browser
checks when the behaviour depends on layout or focus. Commit owned paths and
report any check that could not run. An independent session reviews the result.
