# ADR-0007: Documentation shell and component pages

**Status:** accepted

## Decision

The documentation keeps a persistent navy sidebar, an editorial page canvas and
small uppercase section labels. The sidebar stays navy in either page scheme;
the theme control changes the content and search palette. Mobile uses the same
navigation in a dismissible drawer.

The overview introduces CSS, native elements and React, then groups links to the
component catalogue. Each component retains its own URL and named live examples
in both schemes. Setup follows examples and the API reference, and includes installation, required behaviour peers,
the full package stylesheet and the component's actual entry points. Apps mixing
package and vendored styles follow the linked selective setup guide. Native registrations use side-effect
imports; CSS-only components never advertise React imports. Supported API tables
replace full implementation and example-source listings.

The shell uses current semantic tokens and shared component CSS. It does not
restore retired selectors, package entry points or grouped demo implementations.
Named examples remain the source for previews and browser verification. The
static builder remains responsible for routes; no router dependency is added.

## Why

A stable shell makes the catalogue familiar without coupling documentation to
an old implementation. Individual pages keep setup close to the component and
avoid long category pages. Grouped overview links preserve browsing by purpose.
Two scheme previews make the current styling contract visible regardless of the
reader's selected page theme.

## Verification

Browser checks cover the navy sidebar in both schemes, overview links, setup
instructions, live frames, mobile navigation, search and accessible headings.
Builder checks distinguish React, CSS-only and native imports. Deployment and
Cloudflare build settings remain under the owner's control.

## Content and API reference

Foundations retain visual colour swatches, type-family and scale specimens,
spacing, shape and elevation references. Their values come from the current
CSS tokens. Prose remains a separate guide. Familiar foundation URLs remain
available alongside current token/theme setup.

Component pages put live examples and a supported API reference ahead of setup.
React prop tables are derived at build time with the TypeScript checker from
all exported component signatures, including aliases and discriminated unions.
Sapphire/behaviour props stay visible; inherited platform props are grouped.
Only defaults declared in the local implementation are labelled as defaults.
Referenced Sapphire-owned data types and ref methods get supporting tables,
including imported types; external React and DOM internals remain grouped.
CSS-only entries describe their HTML parts and data attributes. Native entries
list attributes, public methods and emitted events from their source. Full
implementation and example source listings are removed from the reader flow.

This keeps the reference aligned with the shipped contract without maintaining
another handwritten API inventory. It adds build-time tooling, with no browser
compiler or runtime dependency. Browser and builder checks cover foundation
content, API extraction edge cases, all discovered entries and mobile overflow.
