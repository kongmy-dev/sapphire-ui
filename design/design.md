---
version: alpha
name: KONGMY Digital Solutions
description: Design system for KONGMY — an independent, founder-led IT consultancy. Anti-bloat, editorial, navy + gold.

colors:
  primary: "#0a192f"
  primary-hover: "#1a3358"
  accent: "#c5a065"
  accent-dark: "#b8904f"
  accent-text: "#8a5a1f"       # AA-safe gold for text on light surfaces (4.6:1)
  surface: "#f4f6f8"
  white: "#ffffff"
  text-main: "#1e293b"
  text-strong: "#0a192f"       # Headings — flips to #f1f5f9 in dark mode
  text-muted: "#475569"        # Darkened from #64748b for AA compliance (7.0:1)
  text-on-dark: "#f1f5f9"
  text-on-dark-muted: "rgba(241, 245, 249, 0.65)"
  border: "#e2e8f0"
  border-dark: "rgba(255, 255, 255, 0.12)"
  hover-overlay: "rgba(197, 160, 101, 0.08)"
  focus-ring: "#c5a065"

  # Status / semantic colors
  success: "#15803d"
  success-bg: "rgba(34, 197, 94, 0.1)"
  success-border: "rgba(34, 197, 94, 0.2)"
  error: "#b91c1c"
  error-hover: "#991b1b"
  error-ring: "#dc2626"
  error-bg: "rgba(239, 68, 68, 0.1)"
  error-border: "rgba(239, 68, 68, 0.2)"
  warning: "#b45309"
  warning-bg: "rgba(245, 158, 11, 0.1)"
  warning-border: "rgba(245, 158, 11, 0.2)"
  info: "#1d4ed8"
  info-bg: "rgba(59, 130, 246, 0.1)"
  info-border: "rgba(59, 130, 246, 0.2)"

typography:
  display-xl:
    fontFamily: Newsreader
    fontSize: 72px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  display:
    fontFamily: Newsreader
    fontSize: 52px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  heading:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.2
  subheading:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.375
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-base:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  body-xs:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: 0.04em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  icon:
    fontFamily: Material Symbols Outlined
    fontSize: 24px
    fontWeight: 300
    lineHeight: 1

rounded:
  sm: 4px
  btn: 6px
  md: 8px
  pill: 9999px

spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 20px
  "6": 24px
  "8": 32px
  "10": 40px
  "12": 48px
  "16": 64px
  "24": 96px
  "32": 128px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.body-base}"
    rounded: "{rounded.btn}"
    padding: 12px 24px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    rounded: "{rounded.btn}"
    padding: 12px 24px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    rounded: "{rounded.btn}"
    padding: 12px 24px
  button-on-dark-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.btn}"
    padding: 12px 24px
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: 32px
  card-dark:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.md}"
    padding: 32px
  tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  tag-accent:
    backgroundColor: "rgba(197, 160, 101, 0.12)"
    textColor: "{colors.accent-dark}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
---

# KONGMY Digital Solutions — Design System

The formal token specification for `kongmy.dev`. The system is editorial, restrained, and ruthlessly efficient — a visual match for the founder's voice.

## Overview

KONGMY is an independent, founder-led technology consultancy serving SMEs in Kuala Lumpur, Malaysia. The brand positions itself as the **anti-bloat IT partner** — bespoke, hands-on, and quietly authoritative. The design system reflects that posture: serif headlines for gravitas, generous whitespace, navy authority warmed by a single gold accent.

The voice is **first-person singular** ("I", not "we"), direct, concrete, and confident without boasting. No emoji, no exclamation marks, no corporate fluff.

## Colors

A two-color brand palette grounded in a clean off-white surface.

- **Primary (#0a192f — Dark Navy):** Headers, featured cards, deep backgrounds. The voice of authority.
- **Accent (#c5a065 — Gold):** CTAs, highlights, links, dividers. Warmth against the navy.
- **Accent Dark (#b8904f):** Gold hover state.
- **Accent Text (#8a5a1f):** AA-safe gold for text on light surfaces (4.6:1 contrast). Always use this instead of `--color-accent` for readable text.
- **Surface (#f4f6f8 — Off-white):** Page background, light card fills. Keeps the system airy.
- **Text Main (#1e293b):** Primary body copy.
- **Text Strong (#0a192f):** Headings and emphasis. Flips to `#f1f5f9` in dark mode.
- **Text Muted (#475569):** Captions, meta, secondary labels. Darkened from the original `#64748b` for WCAG AA compliance (7.0:1 on surface).
- **Text On Dark (#f1f5f9):** Body copy on navy surfaces.
- **Border (#e2e8f0):** Hairline 1px borders on light cards.

### Status Colors

- **Success (#15803d):** Confirmations, passed states. Background tint at 10% opacity.
- **Error (#b91c1c):** Validation errors, destructive actions.
- **Warning (#b45309):** Caution notices, pending states.
- **Info (#1d4ed8):** Informational callouts, tips.

Each status color has `-bg` and `-border` variants at low opacity for subtle tinted backgrounds.

Navy + gold = professional authority without corporate coldness. **No gradients in primary UI** — solids only.

## Typography

Three families. The contrast between Newsreader serif headlines and Source Sans 3 body is the key typographic move.

- **Newsreader (Headings):** All h1–h6. 400–700. Editorial gravitas at scale.
- **Source Sans 3 (Body & UI):** All body copy, UI labels, navigation. 400–600. Clean and scannable.
- **JetBrains Mono (Code):** Code snippets and technical metadata only.
- **Material Symbols Outlined (Icons):** Outlined weight, used throughout.

Type scale uses fluid `clamp()` for display sizes so headlines remain confident on mobile and authoritative on desktop.

## Layout

- Generous vertical rhythm — sections padded **96px (`--space-24`)** on desktop.
- Max content width **~1200px**, centered.
- Single-column on mobile, multi-column grid on desktop.
- Spacing scale is a **4px base** through 128px.

## Elevation & Depth

- **Light cards:** white background, 1px `--color-border` hairline, no default shadow.
- **Dark (featured) cards:** navy background, accent gold highlights, no shadow.
- **Hover lift:** `translateY(-2px)` with `--shadow-card-hover` — crisp, not floaty.
- Elevation is expressed primarily through **background-color contrast**, not heavy drop shadows.

## Shapes

- **Cards:** 8px radius (`--radius-md`)
- **Buttons:** 6px radius (`--radius-btn`) — slightly tighter than cards
- **Tags & badges:** 9999px (`--radius-pill`)
- **Borders:** 1px solid `#e2e8f0` on light surfaces; `rgba(255,255,255,0.12)` on dark

## Components

- **Buttons:** Primary fills with navy and white text; Outline uses 1.5px navy border; Ghost uses gold border. On-dark variant fills with gold and uses navy text.
- **Cards:** 8px radius, 1px border, 32px padding. Light variant on white, featured variant on navy.
- **Tags:** Pill shape with all-caps Source Sans 3 at 12px / weight 600 / 0.04em tracking.
- **Icons:** Material Symbols Outlined, weight 300, opsz 24.

## Do's and Don'ts

- **Do** use first-person singular voice in copy ("I build", not "we build").
- **Don't** use emoji or exclamation marks. Professionalism is expressed through substance.
- **Do** use solid colors — navy and gold as flat fills.
- **Don't** introduce gradients into primary UI elements.
- **Do** reserve gold for CTAs, links, and accents — never for body copy.
- **Don't** combine illustrative or hand-drawn elements with the system.
- **Do** respect `prefers-reduced-motion` — animations are minimal by default.
- **Don’t** use heavy drop shadows; let background contrast carry hierarchy.

## CSS Utility Classes

The compiled stylesheet ships framework-agnostic utility classes for non-React consumers. These are usable from HTML, Astro, Vue, or any template that imports `style.css`.

### Typography
`.t-display`, `.t-heading`, `.t-subheading`, `.t-body-lg`, `.t-body`, `.t-body-sm`, `.t-eyebrow`, `.t-mono`

### Content Flow
- **`.prose`** — long-form content wrapper (headings, paragraphs, lists, code, blockquotes, links pick up Sapphire tokens). Variants: `.prose-sm`, `.prose-lg`.
- **`.stack`** — vertical rhythm via owl selector (`* + *` gets `--stack-gap` margin). Variants: `.stack-sm`, `.stack-lg`, `.stack-xl`.
- **`.cluster`** — horizontal flex row that wraps. Customise with `--cluster-gap` / `--cluster-justify`.

### Container Queries
Add `.cq` on an ancestor, then use `.cq-sm\:flex`, `.cq-md\:cols-2`, `.cq-lg\:cols-3`, etc. on descendants.

### Forms
`.form-group`, `.label`, `.input`, `.input--mono`, `.input--dark`, `.help-text`, `.help-text--error`

### Layout
`.layout-root`, `.sidebar`, `.main-content`, `.page`, `.masthead`

### Feedback
`.alert` (with `.alert--info`, `.alert--success`, `.alert--warning`, `.alert--error`, `.alert--accent`), `.empty-state`

### Loading States
`.skeleton` (with `.skeleton-line--sm/md/lg`, `.skeleton-card`), `.spinner` (`.spinner--sm`, `.spinner--lg`)

### Data Display
`.sapphire-table`

### Accessibility
`.visually-hidden` / `.sr-only`, `.visually-hidden-focusable`

### Site Shell (Web Component CSS)
`.site-header`, `.site-header--light`, `.site-header--sticky`, `.site-footer`, `.site-footer--light`
`.sapphire-toast`, `.sapphire-banner`
