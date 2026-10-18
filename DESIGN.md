# DESIGN.md

Sapphire UI is the design system for KONGMY Digital Solutions: editorial, restrained, navy and gold. `css/tokens.css` is the source of every token; the token gate (P-5) fails when a table below disagrees with it.

## Brand

- KONGMY is an independent, founder-led IT consultancy in Kuala Lumpur: the anti-bloat partner, bespoke, hands-on and quietly authoritative.
- Voice is first person singular ("I build", never "we"), direct and concrete. No emoji, no exclamation marks, no corporate filler.
- Two colours on an off-white surface: navy for authority, gold for warmth. Add an opacity or a tint before adding a hue.
- Solid fills. The one gradient is the `premium` button.

## Using the tokens

The page follows the system's colour scheme. Force one on a section, and it holds inside a page of the other:

```html
<section data-theme="dark">...</section>
```

`.dark` works like `data-theme="dark"`, and `data-theme="light"` forces light. Form controls and scrollbars follow the same switch.

An app changes a colour on the full scope list, written as `light-dark(<light>, <dark>)`:

```css
:root,
[data-theme="light"],
[data-theme="dark"],
.dark {
  --primary: light-dark(#1d4ed8, #93c5fd);
}
```

An override on `:root` alone does not reach a section that sets `data-theme` or `.dark`: that section keeps Sapphire's own value, because Sapphire declares the token on the section itself. It does apply when the scope sits on `<html>`, since the two selectors weigh the same and the later rule wins. `tests/tokens.spec.ts` measures both in Chromium, Firefox and WebKit, through the source, `bun build`, Vite and Tailwind forms.

A Tailwind app maps every token to utilities that read the same variables:

```css
@import "tailwindcss";
@import "@kongmy-dev/sapphire-ui/tailwind.css";
```

Colour tokens declare `light-dark()` on that list, so a build that lowers `light-dark()` keeps each scope's side. Every other token is declared once on `:root` and does not change with the scheme. A shadow reads its colour from `--primary`.

## Colour

Each row gives the resolved colour per scheme.

### Surfaces, text and controls

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--background` | `#f4f6f8` | `#0a192f` | Page background |
| `--foreground` | `#1e293b` | `#f1f5f9` | Body text |
| `--card` | `#fff` | `#112240` | Card and modal surface |
| `--card-foreground` | `#1e293b` | `#f1f5f9` | Text on a card |
| `--popover` | `#fff` | `#112240` | Menu, popover and tooltip surface; alias of `--card` |
| `--popover-foreground` | `#1e293b` | `#f1f5f9` | Text in a popover |
| `--muted` | `#f4f6f8` | `#0a192f` | Quiet surface; alias of `--background` |
| `--muted-foreground` | `#475569` | `rgb(241, 245, 249, 0.72)` | Captions, meta, secondary labels |
| `--secondary` | `#f4f6f8` | `#0a192f` | Secondary surface; alias of `--background` |
| `--secondary-foreground` | `#1e293b` | `#f1f5f9` | Text on a secondary surface |
| `--accent` | `rgb(197, 160, 101, 0.08)` | `rgb(197, 160, 101, 0.08)` | Quiet interactive surface: hover, selected row, active menu item. The gold tint |
| `--accent-foreground` | `#1e293b` | `#f1f5f9` | Text on the accent surface |
| `--border` | `#e2e8f0` | `rgb(255, 255, 255, 0.12)` | Hairline border |
| `--input` | `#cbd5e1` | `rgb(255, 255, 255, 0.28)` | Form-control border; alias of `--border-strong` |
| `--ring` | `#c5a065` | `#c5a065` | Focus ring |
| `--primary` | `#0a192f` | `#0a192f` | Navy fill for buttons, headers and dark surfaces; never flips |
| `--primary-foreground` | `#f1f5f9` | `#f1f5f9` | Text on navy |
| `--destructive` | `#b91c1c` | `#b91c1c` | Irreversible actions; alias of `--error` |
| `--destructive-foreground` | `#fff` | `#fff` | Text on a destructive fill |

### Brand

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--brand` | `#c5a065` | `#c5a065` | Gold fill for CTAs, active states and thin dividers; decorative, never text on a light surface |
| `--brand-hover` | `#b8904f` | `#b8904f` | Gold hover fill |
| `--brand-text` | `#8a5a1f` | `#c5a065` | Gold text; 4.6:1 on the light background, and the brand gold itself on dark |
| `--brand-on-fill` | `#b8904f` | `#c5a065` | Gold on a tinted or coloured fill, never on the plain page |
| `--brand-foreground` | `#0a192f` | `#0a192f` | Text on a gold fill; alias of `--primary` |
| `--primary-hover` | `#1a3358` | `#1a3358` | Navy hover fill |
| `--foreground-strong` | `#0a192f` | `#f1f5f9` | Headings and emphasis |
| `--on-dark` | `#f1f5f9` | `#f1f5f9` | Text on navy |
| `--on-dark-muted` | `rgb(241, 245, 249, 0.65)` | `rgb(241, 245, 249, 0.65)` | Secondary text on navy |
| `--border-strong` | `#cbd5e1` | `rgb(255, 255, 255, 0.28)` | Heavier border for form controls |
| `--border-dark` | `rgb(255, 255, 255, 0.12)` | `rgb(255, 255, 255, 0.12)` | Hairline on navy surfaces |
| `--field-dark` | `rgb(0, 0, 0, 0.2)` | `rgb(0, 0, 0, 0.2)` | Recessed fill of an input, textarea or select on navy surfaces |
| `--switch-off` | `#94a3b8` | `rgb(255, 255, 255, 0.28)` | Track of a switch that is off |
| `--white` | `#fff` | `#fff` | White in both schemes |
| `--card-dark` | `#0a192f` | `#0a192f` | Featured dark card; alias of `--primary` |

### Status

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--success` | `#15803d` | `#15803d` | Confirmations, passed states |
| `--success-text` | `#15803d` | `#4ade80` | Green text and outlines on any surface; AA on light and dark |
| `--success-bg` | `rgb(34, 197, 94, 0.1)` | `rgb(34, 197, 94, 0.1)` | Tinted success background |
| `--success-border` | `rgb(34, 197, 94, 0.2)` | `rgb(34, 197, 94, 0.2)` | Tinted success border |
| `--success-foreground` | `#fff` | `#fff` | Text on a solid success fill |
| `--error` | `#b91c1c` | `#b91c1c` | Validation errors |
| `--error-text` | `#b91c1c` | `#f87171` | Red text and outlines on any surface; AA on light and dark |
| `--error-hover` | `#991b1b` | `#991b1b` | Error hover fill |
| `--error-ring` | `#dc2626` | `#dc2626` | Error focus ring |
| `--error-bg` | `rgb(239, 68, 68, 0.1)` | `rgb(239, 68, 68, 0.1)` | Tinted error background |
| `--error-border` | `rgb(239, 68, 68, 0.2)` | `rgb(239, 68, 68, 0.2)` | Tinted error border |
| `--warning` | `#b45309` | `#b45309` | Caution, pending states |
| `--warning-text` | `#b45309` | `#fbbf24` | Amber text and outlines on any surface; AA on light and dark |
| `--warning-bg` | `rgb(245, 158, 11, 0.1)` | `rgb(245, 158, 11, 0.1)` | Tinted warning background |
| `--warning-border` | `rgb(245, 158, 11, 0.2)` | `rgb(245, 158, 11, 0.2)` | Tinted warning border |
| `--warning-foreground` | `#fff` | `#fff` | Text on a solid warning fill |
| `--info` | `#1d4ed8` | `#1d4ed8` | Tips, informational callouts |
| `--info-text` | `#1d4ed8` | `#60a5fa` | Blue text and outlines on any surface; AA on light and dark |
| `--info-bg` | `rgb(59, 130, 246, 0.1)` | `rgb(59, 130, 246, 0.1)` | Tinted info background |
| `--info-border` | `rgb(59, 130, 246, 0.2)` | `rgb(59, 130, 246, 0.2)` | Tinted info border |
| `--info-foreground` | `#fff` | `#fff` | Text on a solid info fill |

### Chart and sidebar

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--chart-1` | `#c5a065` | `#c5a065` | Gold |
| `--chart-2` | `#0a192f` | `#0a192f` | Navy |
| `--chart-3` | `#1d4ed8` | `#1d4ed8` | Blue |
| `--chart-4` | `#15803d` | `#15803d` | Green |
| `--chart-5` | `#b45309` | `#b45309` | Amber |

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--sidebar` | `#0a192f` | `#0a192f` | Admin shell surface |
| `--sidebar-foreground` | `#f1f5f9` | `#f1f5f9` | Sidebar text |
| `--sidebar-primary` | `#c5a065` | `#c5a065` | Active indicator |
| `--sidebar-primary-foreground` | `#0a192f` | `#0a192f` | Text on the active indicator |
| `--sidebar-accent` | `#1a3358` | `#1a3358` | Hovered item |
| `--sidebar-accent-foreground` | `#f1f5f9` | `#f1f5f9` | Text on a hovered item |
| `--sidebar-border` | `rgb(255, 255, 255, 0.12)` | `rgb(255, 255, 255, 0.12)` | Sidebar hairline |
| `--sidebar-ring` | `#c5a065` | `#c5a065` | Sidebar focus ring |

## Typography, shape and elevation

Three families. The contrast between the Newsreader headlines and the Source Sans 3 body is the key move. Never set body copy in the serif or a heading in the sans.

| Token | Value | Use |
| --- | --- | --- |
| `--font-serif` | `"Newsreader", georgia, serif` | Headings h1 to h6, weight 500 to 600 |
| `--font-sans` | `"Source Sans 3", system-ui, sans-serif` | Body, UI labels, navigation, weight 400 to 600 |
| `--font-mono` | `"JetBrains Mono", "Fira Code", monospace` | Code and technical meta |
| `--text-display-xl` | `clamp(2.5rem, 6vw, 4.5rem)` | Hero h1, fluid |
| `--text-display` | `clamp(2rem, 4vw, 3.25rem)` | Section h2, fluid |
| `--text-heading` | `clamp(1.5rem, 3vw, 2rem)` | h3, fluid |
| `--text-subheading` | `1.25rem` | h4 |
| `--text-lg` | `1.125rem` | Large body |
| `--text-base` | `1rem` | Body |
| `--text-sm` | `0.875rem` | Secondary UI text |
| `--text-xs` | `0.75rem` | Tags and badges: weight 600, `0.04em` tracking, capitals |

Line heights are `--leading-tight` 1.2, `--leading-snug` 1.375, `--leading-normal` 1.6 and `--leading-relaxed` 1.75.

| Token | Value | Use |
| --- | --- | --- |
| `--radius` | `12px` | Large surfaces; shadcn's base radius |
| `--radius-sm` | `4px` | Small controls |
| `--radius-md` | `8px` | Cards |
| `--radius-xl` | `16px` | Feature surfaces |
| `--radius-btn` | `6px` | Buttons, a little tighter than cards |
| `--radius-pill` | `9999px` | Tags and badges |
| `--border-width` | `1px` | Hairline border |
| `--border-width-strong` | `1.5px` | Outline buttons and other emphasised edges |
| `--ring-width` | `2px` | Focus ring thickness |
| `--ring-offset` | `2px` | Gap between a control and its focus ring |
| `--shadow-sm` | `0 1px 3px rgb(10, 25, 47, 0.06), 0 1px 2px rgb(10, 25, 47, 0.04)` | Small lift |
| `--shadow-md` | `0 4px 16px rgb(10, 25, 47, 0.08), 0 2px 6px rgb(10, 25, 47, 0.05)` | Raised panels |
| `--shadow-lg` | `0 8px 32px rgb(10, 25, 47, 0.12), 0 4px 12px rgb(10, 25, 47, 0.07)` | Overlays |
| `--shadow-card-hover` | `0 8px 24px rgb(10, 25, 47, 0.12)` | Interactive card on hover |

Spacing is a 4px grid: `--space-1` (0.25rem) to `--space-32` (8rem), in twelve steps, and Tailwind's spacing utilities read them. Transitions are `--transition-fast` 150ms, `--transition-base` 200ms and `--transition-slow` 350ms, all `ease`.

Depth comes from background contrast, not shadow. A light card has a 1px `--border` and no shadow until hover; a dark card is navy with gold highlights. Hover lift is `translateY(-2px)` with `--shadow-card-hover`. Avoid layered drop shadows.

## Layout

- Sections pad `--space-24` (96px) vertically on desktop; content is at most about 1200px wide and centred.
- One column on mobile, a multi-column grid on desktop.
- All spacing comes from `--space-N`; map an arbitrary value to the nearest token.

## Components

| Component | Guidance |
| --- | --- |
| Button, main action | Navy fill on a light surface; gold fill with navy text on a navy one |
| Button, secondary | Outline on light, outline on navy; a ghost for the tertiary action |
| Button, flagship | One `premium` per page, used sparingly |
| Button, destructive | Only for an irreversible delete or remove |
| Card | `--card`, `--radius-md`, 1px `--border`; a navy card features a hero item |
| Tag and badge | Always a pill. Default is the muted surface with muted text; a gold tint for emphasis; a navy-surface variant |
| Input | Standard and textarea with a distinct focus ring; `--error-text` border for invalid |
| Overlays | Dialog centred, sheet edge-anchored; menus, popovers, hover cards and tooltips share `--popover` |
| Feedback | Alert and callout in the four status colours; toasts do not block |
| Navigation | Breadcrumb, pagination, tabs and steps; the admin shell uses the `--sidebar-*` tokens |

Icons are Lucide, outlined. An icon-only control carries an `aria-label`.

## UX rules

- Gold text on a light surface is `--brand-text`. `--brand` fails WCAG AA there.
- Use solid fills; keep gold for CTAs, links, active states and thin dividers, never body copy.
- Respect `prefers-reduced-motion`; motion is opt-in.
- Do not combine illustrative, hand-drawn or cartoon elements with the system.
- Do not introduce a typeface.
