# ADR-0011: Product layouts and composition

**Status:** accepted, 2026-10-23

## Decision

Product applications are the default: sans-serif operational headings, semantic
action colours and navigation that follows the selected scheme. Editorial
headings remain available through `data-typography="editorial"`. Navy, gold and
the existing font families remain the identity. Fixed navy uses `--brand-navy`;
`--primary` and its foreground become scheme-aware action colours.

The admin shell owns desktop navigation (`expanded` or `compact`) and a separate
mobile-open value. A supplied value controls state; a callback alone observes
uncontrolled changes. The default is expanded desktop navigation and a closed
mobile drawer. Entering desktop closes the drawer without changing the desktop
preference. Persistence, routing and application shortcuts belong to callers.

A full-width 56px header keeps the navigation trigger in one position. Desktop
navigation is 256px expanded and 64px compact. Below 48rem it is a labeled modal
drawer, outside document flow. Navigation uses 40px rows, increasing to 44px on
coarse pointers. Compact links retain accessible names and expose labels on
hover and focus; iconless links retain short visible text. Brand and account
recipes retain a mark or avatar. One-level navigation groups use inline
disclosure when expanded and a labeled flyout when compact.

Admin and registry clients share the small navigation-state owner while keeping
their presentation contracts. Sections and links no longer receive repeated
collapse props. The registry adapter retains its supported visual variants.

Reusable PageHeader and FormSection compositions own common layout. FormField
supports a render child so compound controls receive identifiers and accessible
descriptions on their actual trigger. Combobox searches labels, forwards trigger
attributes and supports native form values. Repeated focus-return behavior stays
private; collections accept readonly input. Explicit typed wrappers remain.

Complete overview, records and settings examples demonstrate these contracts.
The documentation loads production example code for the current page while
retaining every named example and foundation/API reference.

## Compatibility

The owner selected version 4.1.0 because early 4.x has one controlled consumer.
This is an explicit exception to a major-version increase for these breaking
contracts; migration entries remain required. The registry stays at `/r/v4/`.
Legacy registry assets remain frozen. CSS-first delivery, native elements, optional
peers and zero runtime dependencies remain supported. No generic application
schema, router, icon registry or persistence service is introduced.

## Verification

State tests cover controlled, uncontrolled and observer callbacks, independent
shells and breakpoint round trips. Browser tests cover mobile dismissal and
focus restoration, compact labels, iconless links, groups, long content and both
schemes. Review real desktop/mobile rendering before visual pins are updated.
Run fresh integrated gates and package, native and registry consumer checks.
Preserve coverage, reached-state assertions and the approved CSS budget.

### Avatar capture exception

The owner accepts the low visual risk of circular-edge colour rounding in the
avatar examples. `bun run test:visual` at c849019
passed 761 of 762 cases in [CI](https://github.com/kongmy-dev/sapphire-ui/actions/runs/39937036460).
The failed image has 12 changed raw pixels, each at most one channel level out of
255, confined to the smallest avatar's left edge; Playwright reports 8 mismatches.
Repeated captures also showed edge rounding of up to two channel levels without
text or geometry changes. The browser rendering cause remains unproven.

Only `react/avatar/sizes`, `react/avatar/lifecycle`, `react/avatar-group/members`
and `react/avatar-group/overflow`, in both schemes, may use a perceptual colour
threshold of 0.01, with zero pixels allowed beyond that threshold. All other
captures retain zero tolerance. Keep the reviewed baselines, every example and all behaviour and
accessibility checks. This accepts rendering noise without hiding the avatar,
skipping its test or changing component styling.

## Alternatives

Always-expanded desktop navigation is simpler but prevents reclaiming content
space. Fully hidden desktop navigation adds an interaction to routine movement.
An explicit compact rail preserves access while allowing users to choose space.
Sharing the entire registry sidebar would pull presentation and application
policy into the CSS-first client; only its small state contract is shared.
