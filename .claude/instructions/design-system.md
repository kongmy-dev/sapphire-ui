# Instruction: Adopt the Sapphire Design System

When writing any UI — components, pages, specimens, or documentation — these rules are always in effect.

---

## Brand Identity

KONGMY Digital Solutions is an **independent, founder-led IT consultancy**. The aesthetic is:
- Editorial, restrained, quietly authoritative
- Anti-bloat: no decorative excess
- First-person singular voice ("I build", not "we build")
- No emoji, no exclamation marks

---

## Color Rules

| Use case | Token |
|---|---|
| Primary fills (buttons, headers, dark surfaces) | `--color-primary` (#0a192f navy) |
| CTAs, accents, active states, links | `--color-accent` (#c5a065 gold) as fill; `--color-accent-text` (#8a5a1f) as text |
| Page background | `--color-surface` (#f4f6f8) |
| Card/modal background | `--color-white` / `--color-card-bg` |
| Body text | `--color-text-main` (#1e293b) |
| Meta, captions | `--color-text-muted` (#475569) |
| Text on navy | `--color-text-on-dark` (#f1f5f9) |

**Gold text rule:** `--color-accent` (#c5a065) fails WCAG AA on light backgrounds. For any readable gold text on `--color-surface`, always use `--color-accent-text` (#8a5a1f) instead.

**No gradients** in primary UI elements. Solids only. The `premium` button variant is the deliberate exception.

**Two-color discipline:** resist adding new brand colors. Extend with opacity/tint variants of navy and gold before introducing a new hue.

---

## Typography Rules

| Element | Family | Weight |
|---|---|---|
| h1–h6 | Newsreader (serif) | 500–600 |
| Body, UI labels, navigation | Source Sans 3 (sans) | 400–600 |
| Code, technical meta | JetBrains Mono | 400–500 |
| Icons | Material Symbols Outlined | 300 |

- Display sizes (`h1`, `h2`) must use `clamp()` fluid sizing — see `--text-display-xl`, `--text-display`.
- Never use Newsreader for body copy or UI labels.
- Never use Source Sans 3 for headings.
- Tags/badges: Source Sans 3, 12px (`--text-xs`), weight 600, `0.04em` letter-spacing, all-caps.

---

## Component Quick Reference

**Buttons**

| Variant | When to use |
|---|---|
| `primary` | Main CTA on light surface |
| `outline` | Secondary action on light surface |
| `ghost` | Tertiary action, accent-coloured border |
| `accent` | Gold fill — for emphasis on light |
| `on-dark-primary` | Main CTA on navy surface |
| `on-dark-outline` | Secondary on navy surface |
| `link` | Inline text action |
| `premium` | Single flagship CTA (use sparingly) |
| `destructive` | Irreversible delete/remove |

**Cards**

| Pattern | When |
|---|---|
| White card, `--radius-md`, 1px border | Default content card |
| Navy `card-dark` | Featured / hero card |
| Hover lift: `translateY(-2px)` + `--shadow-card-hover` | Interactive cards |

**Tags / Badges**

Always pill shape (`--radius-pill`). Three visual states:
- Default: surface background, muted text
- `tag-accent`: gold tint
- `tag-dark`: for use on navy surfaces

---

## Spacing & Layout

- **4px base grid** — all spacing via `--space-N` tokens.
- Section vertical padding: `--space-24` (96px) on desktop.
- Max content width: ~1200px, centered.
- Never use arbitrary spacing values — map to the nearest token.

---

## Elevation

Express depth primarily through **background-color contrast**, not shadows.
- Light cards: no shadow by default; shadow only on `:hover`.
- Dark cards: navy background, no shadow needed.
- Avoid heavy multi-layer drop shadows — they conflict with the editorial restraint.

---

## Do's

- Use solid fills — navy and gold as flat colors.
- Reserve gold for CTAs, links, active states, and thin accent dividers.
- Respect `prefers-reduced-motion` — all animations are opt-in.
- Provide `aria-label` on icon-only interactive elements.
- Use first-person voice in any copy you write.

## Don'ts

- Don't use `--color-accent` as text color on light surfaces.
- Don't add gradients to primary UI elements.
- Don't combine illustrative, hand-drawn, or cartoon elements with the system.
- Don't introduce new typefaces.
- Don't write "we" — Kong My is a sole operator.
- Don't use emoji or exclamation marks in copy.
