# ADR-0003: The CSS contract comes first

**Status:** accepted

## Decision

Plain HTML, React and native elements share `sp-*` classes and the same stylesheets. Components express typed variants through data attributes; CSS owns appearance. React wrappers do not recreate styles through CVA, utility strings or runtime class merging.

Cascade order is `theme, base, components, utilities`, established before other imports. Foundations exclude component CSS; the full entry includes every component. Consumers customize through tokens, component properties, documented variants, utilities, their own CSS or owned registry source. Component styles remain self-contained.

The visual target is a tidy navy-and-gold system across product and editorial surfaces. Default controls are 36px high. Button widths retain their horizontal padding, icon widths and gaps, including large and icon-only sizes; reducing height does not authorize squeezing width. Coarse-pointer controls provide actual 44px targets without overlapping adjacent controls.

Approved targeted polish includes compact card heading rhythm, sans operational card titles, grouped trailing actions and quiet disclosure hover. Page and editorial serif typography, navy/gold tokens and readable body text remain. Density changes must preserve behaviour, alignment and accessible interaction geometry.

The full stylesheet has a **24 KiB (24,576-byte) gzip ceiling**. Delivered UI value takes priority over marginal byte savings while this guardrail passes. Do not trade accessibility, public customization or component independence for cosmetic micro-optimization. A ceiling change requires an explicit owner decision.

## Verification

Contract gates compare real CSS selectors with declared typed variant domains and valid defaults. Source and built-CSS checks protect layers and tokens. Browser tests cover both colour schemes, keyboard behaviour, fine/coarse geometry and committed visual states. Approved visual changes require reviewing expected, actual and diff evidence before updating pins; passing a budget does not establish visual correctness.
