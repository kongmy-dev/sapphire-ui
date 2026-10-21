# ADR-0007: Documentation shell and component pages

**Status:** accepted

## Decision

The documentation keeps a persistent navy sidebar, an editorial page canvas and
small uppercase section labels. The sidebar stays navy in either page scheme;
the theme control changes the content and search palette. Mobile uses the same
navigation in a dismissible drawer. Its compact navy header places the menu before
the brand and version. The drawer covers that header, starts the brand at the top,
and includes its own close control. A dimmed, blurred backdrop separates it from
the page. Navigation rows have at least 44px touch targets at mobile widths;
the navigation scrolls independently while search, theme and close stay reachable.
Opening the drawer makes the page and mobile header inert and contains keyboard
focus. Dismissal restores the menu trigger; desktop resize restores normal navigation.

The overview introduces CSS, native elements and React, then groups links to the
component catalogue. Each component retains its own URL and renders every named
example directly in the page, following the reader's selected theme. Setup follows
examples and the API reference, and includes installation, required behaviour peers,
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
One inline instance per example keeps the page self-contained and avoids nested
scrolling. The page theme control exposes both schemes without duplicated controls.
React and native examples reuse the browser harness catalogue, with multiple mount
targets and unique React ID prefixes. The isolated harness remains for behavioural
and visual verification. Migration material stays outside the documentation catalogue.
The nonvisual SEO metadata example is rendered at build time from its original
component and shown as escaped output, so it cannot overwrite the catalogue's
document title or metadata. Example modals take keyboard priority over shell search.
Fixed cookie banners use normal flow within documentation specimens so every
variant stays reachable. React Toast instances share one document-level viewport;
their queues and lifetimes stay independent, preventing simultaneous notifications
from covering one another when multiple examples or app roots are mounted.

## Verification

Browser checks cover the navy sidebar in both schemes, overview links, setup
instructions, inline examples, mobile navigation, search and accessible headings.
Every discovered example must mount, and multiple examples must retain independent
state, labels and overlay focus behaviour within the documentation shell.
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
