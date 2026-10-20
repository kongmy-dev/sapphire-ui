---
name: review-code
description: Independently review Sapphire changes for root causes, duplication, boundaries and simpler designs.
---

# Independent review

Read `CLAUDE.md` and the affected contract/tests. The reviewer did not author the
change. Stay read-only and report actionable findings with file, line, rule ID,
observable failure and the smallest correction. Do not substitute taste for evidence.

The gates already check mechanical rules. Look for what they cannot establish:

- Does the fix address the owner of the defect, or hide it in a specimen?
- Is there now a second way to perform the same task?
- Can another module import an internal that should remain private?
- Did a split merely move complexity behind a single-caller abstraction?
- Is a type guard claiming properties it did not verify?
- Is a test asserting the implementation instead of a public behaviour?
- Were interactions, state loops or difficult examples removed to obtain green?
- Does an API change have an honest migration path, including manual work?
- Can the same result be expressed with fewer public states or exports?

Check required command results; a scoped pass is not an integrated pass. Review
expected, actual and diff images for intentional visual changes. Distinguish
measured behaviour from inference. No findings means no actionable issue found,
not a guarantee that unchecked browser, release or deployment steps succeeded.
