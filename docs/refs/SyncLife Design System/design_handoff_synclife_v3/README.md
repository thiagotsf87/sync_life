# Handoff: SyncLife Design System v3

## Overview
SyncLife is a life-operating-system product — a calm, premium-dark hub where a person sees and steers every domain of their life (Tempo, Futuro, Corpo, Saúde, Mente, Patrimônio, Carreira, Experiências, Finanças, Planejamento). The organizing idea of v3 is the **Coach**: an AI narrator that is the operating system of the product, not decoration. It appears at three levels — environmental (contextual hero per module), global (a `⌘J` drawer + a full `/coach` route), and inline (short "whispers" dropped into lists and charts). A second signature is **cross-module storytelling**: one-sentence causal insights that connect two domains ("months with more protected focus produced R$380 more in contributions").

This bundle is the **design system** that expresses that product: tokens, seven React components, one starting-point template, and full brand/voice documentation.

## About the Design Files
The files here are **design references authored in HTML/React**, not a drop-in production package. They show the intended look, structure, tokens, and component APIs. The task in your codebase is to **recreate these designs in your app's real environment** (React, Vue, SwiftUI, native, etc.) using its own patterns, state, and data layer — or, if no environment exists yet, to choose the most appropriate framework and implement the system there. The `.jsx` files run without a build step (in-browser Babel) purely so the specimens render; treat them as precise references for markup, styling, and props — not as the library to ship as-is.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, and interaction treatments are all specified as tokens with exact values (below). Recreate the UI pixel-accurately using your codebase's component and styling conventions, mapping the tokens to your theme system.

---

## Design Tokens
All tokens are CSS custom properties defined in `colors_and_type.css` (imported by `styles.css`). Map these into your theme system.

### Color — premium dark (base is deep slate-cyan, never pure black)
Surfaces step up in luminance instead of using hard borders.

| Token | Value | Use |
|---|---|---|
| `--sl-bg-void` | `#07090C` | body / furthest back |
| `--sl-bg-base` | `#0B0F14` | main app background |
| `--sl-bg-surface` | `#11161D` | cards, panels |
| `--sl-bg-elevated` | `#171E27` | menus, modals, hovered cards |
| `--sl-bg-input` | `#0E131A` | form inputs (recessed) |
| `--sl-bg-overlay` | `rgba(7,9,12,0.72)` | modal backdrop |

**Borders/dividers** (luminance-based, not gray lines): `--sl-line-faint` `rgba(255,255,255,.04)`, `--sl-line-subtle` `.07`, `--sl-line-strong` `.12`, `--sl-line-accent` `rgba(124,220,232,.32)`.

**Text:** `--sl-fg-primary` `#E7ECF1` · `--sl-fg-secondary` `#A7B0BC` · `--sl-fg-tertiary` `#6F7986` · `--sl-fg-muted` `#4A535F` · `--sl-fg-inverted` `#0B0F14`.

**Accent** (electric-but-calm cyan): `--sl-accent` `#7CDCE8` · `--sl-accent-strong` `#4FC8D8` · `--sl-accent-soft` `rgba(124,220,232,.12)` · `--sl-accent-glow` `rgba(124,220,232,.20)`.

**Domain colors** (subtle, never neon): health `#8BD5A8` · routine `#C9B6FF` · work `#F2C57C` · finance `#7CDCE8` (= accent) · mind `#F6A6B8`.

**Status** (muted): success `#6FCF97` · warning `#E8B86A` · danger `#E07A8B` · info `#7CDCE8` (each with a translucent `-bg` at ~10% alpha).

### Typography
- **Display:** Space Grotesk (weight 500 for headings). `--sl-font-display`
- **Body:** Manrope (400/500). `--sl-font-body`
- **Mono:** JetBrains Mono — numerics, codes, timestamps. `--sl-font-mono`
- All three are registered via `@font-face` in `colors_and_type.css` and loaded from Google Fonts; substitute your licensed equivalents (brief's ideals were *Aeonik* / *Sharp Grotesk*) by swapping the family values.
- **Type scale (rem, 16px root):** xs 12 · sm 13 · base 15 · md 17 · lg 20 · xl 24 · 2xl 32 · 3xl 44 · 4xl 60 · 5xl 80.
- **Line height:** display 1.02 · heading 1.15 · body 1.55 · tight 1.3.
- **Tracking:** display −0.025em · heading −0.015em · body −0.005em · eyebrow +0.14em (ALL CAPS eyebrows).
- Numerics use **tabular-nums**; currency attaches with a hair-space (`R$ 1.240`).

### Spacing — 4px base, fibonacci-ish
`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128` (`--sl-s-1` … `--sl-s-10`). Whitespace is a primary tool; layouts are intentionally asymmetric.

### Radii
inputs/small buttons 8–12px · cards/panels 16–24px · pills 999px. Never mix >2 radius sizes in one composition. `--sl-r-xs` 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · pill 999.

### Depth, motion, iconography
- **Shadows:** none in flat areas — depth is luminance steps (void → base → surface → elevated). Floating elements get long, very soft shadows.
- **Hover** lifts surface one luminance step (no glow, no scale); **press** returns to rest + 1px inset shadow; **focus** is a 2px accent ring at 32% alpha.
- **Easing:** expo-out `cubic-bezier(0.22,1,0.36,1)` (narrative), standard `cubic-bezier(0.4,0,0.2,1)` (UI), gentle spring `cubic-bezier(0.34,1.56,0.64,1)` (micro-affirmations). **Durations:** UI 160–240ms; narrative 420–720ms.
- **Icons:** Lucide, 1.75px stroke, rounded caps; stroke-only, sizes 16/20/24 in UI, 32/40 for empty states.

Full brand voice, casing rules, and rationale: see `DESIGN-SYSTEM.md` in this bundle.

---

## Components
Seven React components. Each folder has `<Name>.jsx.txt` (implementation) and `<Name>.d.ts.txt` (typed props — the source of truth for the API). They carry a `.txt` suffix only so they aren't recompiled inside this bundle; rename to `.jsx` / `.d.ts` when you drop them into a codebase. Props summarized below; read the `.d.ts.txt` for exact types.

1. **Coach** (`components/Coach/`) — the AI narrator; the core conversational surface. Modes: `proativo` / `neutro` / `alerta`.
2. **CoachWhisper** (`components/CoachWhisper/`) — inline Coach nudge (level 3). Props: `bold` (lead fact, accent), `text` (context + recommendation), `action?` + `onAction?` (button), `variant?` `'soft'|'solid'`.
3. **CrossBand** (`components/CrossBand/`) — cross-module storytelling band. Props: `segments: {text, color?, bold?}[]` (colored/bold runs read left→right), `action?` + `onAction?`.
4. **KpiStrip** (`components/KpiStrip/`) — hairline-divided row of headline metrics atop every module screen. Props: `items: {label, value, delta?, up?, tone?}[]`. Convention: render the first item's value larger (≥30px) as the screen's anchor number.
5. **ProgressList** (`components/ProgressList/`) — card of labelled goal bars. Props: `title`, `sub?`, `rows: {label, current, target, color, unit?, sub?, currentLabel?, targetLabel?, invert?, check?, badge?, badgeColor?}[]`. `invert` = "less is better" (over target reads danger).
6. **Timeline** (`components/Timeline/`) — vertical milestone/roadmap list. Props: `title?`, `items: {when, title, meta?, done?, current?, color?}[]`. `done` fills the node; `current` rings it and shows an "AGORA" tag.
7. **Donut** (`components/Donut/`) — conic-gradient share chart. Props: `title?`, `center`, `centerSub?`, `slices: {label, share, color}[]` (shares are percentages summing to ~100).

All components read tokens via `var(--sl-*)` with literal fallbacks, so they render even outside the theme, but you should wire them to your token layer.

---

## Templates (starting points)
**Module Screen** (`templates/module-screen/ModuleScreen.dc.html`) — a complete Coach-led module page composed from the components above: breadcrumbed header + Coach button, a left sub-nav, then title → `KpiStrip` → `CoachWhisper` → `CrossBand` → `ProgressList` → a two-column `Timeline` + `Donut`. This is the canonical layout to recreate for any of the nine domain modules; swap the data and the domain accent color. The `.dc.html` file's logic class holds the sample data object (kpis, whisper, cross-band segments, progress rows, timeline items, donut slices) — a clear shape to model your API responses on.

---

## Screens / Views (reference layout)
A module screen (recreate per domain):
- **App header** — 16×32px padding, 1px `--sl-line-subtle` bottom border. Left: "SyncLife" wordmark (display font; "Life" in accent) + breadcrumb "› {Module} › {Subscreen}". Right: a Coach pill (`--sl-accent-soft` bg, `--sl-line-strong` border, accent text, "⌘J" mono hint) and a 34px round avatar.
- **Left sub-nav** — 210px, 1px right border. An uppercase module eyebrow, then nav buttons (9×11px padding, 10px radius); active item uses `--sl-accent-soft` bg + primary text.
- **Main** — scrollable, content max-width 1080px centered, 16px vertical gaps. Order: eyebrow (11px, +0.14em tracking, tertiary) → h1 (display 30px, −0.02em) → KpiStrip → CoachWhisper → CrossBand → data blocks → thin footer.
- **Responsive** (<960px): sub-nav collapses to a horizontal scroll bar (labels/links hidden), KpiStrip drops to 2 columns (1 column <560px), two-column block grids stack. Touch targets ≥44px.

---

## Interactions & Behavior
- **Global keys:** `⌘K` command palette, `⌘J` toggles the Coach drawer, `?` opens a shortcut cheat sheet, `Esc` closes overlays.
- **Coach:** environmental (hero per module), global (`⌘J` drawer + `/coach` route), inline (whispers inside lists/charts). Whispers keep to ≤18 words: bold lead fact + short recommendation + one action.
- **Cross-module route:** a whisper/band may carry a secondary "Ver em {module} →" link that navigates to the referenced module.
- **Loading:** silent — a soft skeleton shimmer (~420ms) on subscreen change, no spinner copy.
- **Empty states:** name the feeling, not the action ("Nothing planned. That's allowed.").
- **Press/hover/focus:** per the token section (luminance step, inset-shadow press, accent focus ring).

## State Management (per module screen)
- Active subscreen (drives which data set renders).
- Overlay flags: palette open, drawer open, cheat-sheet open.
- Transient loading flag on subscreen change.
- Tweakables in the prototypes (density, show-whisper) are demo controls — in production these map to user settings / layout density.
- Data fetching: each subscreen is data-driven; model responses on the logic-class data shapes in the template and component `.d.ts` files.

## Assets
- Logos in the design-system project's `assets/` (`logo-mark.svg`, `logo-wordmark-*`, `logo-lockup.svg`) — the mark is a stub (two interlocked sync arcs); confirm/replace with the real brand mark.
- `assets/noise.svg` — fine grain texture (~3.5% opacity) for hero surfaces only.
- Icons: Lucide (not bundled here) — install the package in your codebase.
- Fonts: Google Fonts (Space Grotesk, Manrope, JetBrains Mono) — swap for licensed equivalents if required.

## Files in this bundle
- `DESIGN-SYSTEM.md` — full brand context, voice, and visual foundations (the design system's own README).
- `colors_and_type.css` — all tokens + `@font-face` (source of truth for values above).
- `styles.css` — global entry (imports the tokens).
- `components/<Name>/` — the seven components (`<Name>.jsx.txt` + `<Name>.d.ts.txt`; drop the `.txt`).
- `templates/module-screen/` — the Coach-led module template (`ModuleScreen.dc.html` + `ds-base.js` loader).

Live specimens for each component live in the source design system (`components/<Name>/<name>.html`); the API and sample data in the `.d.ts.txt` and the template's logic class are enough to recreate them faithfully.
