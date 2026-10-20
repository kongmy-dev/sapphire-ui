# ADR-0007: Documentation shell and component pages

**Status:** accepted

## Decision

The documentation keeps a persistent navy sidebar, an editorial page canvas and
small uppercase section labels. The sidebar stays navy in either page scheme;
the theme control changes the content and search palette. Mobile uses the same
navigation in a dismissible drawer.

The overview introduces CSS, native elements and React, then groups links to the
component catalogue. Each component retains its own URL and named live examples
in both schemes. Setup precedes examples and includes installation, required behaviour peers,
the full package stylesheet and the component's actual entry points. Apps mixing
package and vendored styles follow the linked selective setup guide. Native registrations use side-effect
imports; CSS-only components never advertise React imports. Source remains
available after the previews.

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
