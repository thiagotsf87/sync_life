# SyncLife Design System

> A premium, dark-mode-first interface system for **SyncLife** — a cross-platform (web + mobile) app that unifies the parts of a person's life: **health, routine, work, finances, and mind.**

This system is built from a written brief — no codebase or Figma was provided. Everything here is an original interpretation of the visual direction in the brief; substitutions (fonts, icons) are flagged in their respective sections.

---

## 1 · Brand context

SyncLife sits in the same lineage as Things, Linear, Notion Calendar, and Oura — interfaces that earn trust through restraint. The product surface is a hub: a person sees their day, their body, their balance, and their tasks in one calm view, then drills into a single domain when needed.

The visual personality is **quiet confidence**:
- The interface never raises its voice.
- Information density is high but never busy.
- The accent color appears sparingly — it earns attention.
- The dark mode is the *primary* canvas, not an afterthought.

### Product surfaces
- **SyncLife Web** — desktop dashboard at app.synclife.com. Multi-domain overview, deep panels, keyboard-driven.
- **SyncLife Mobile** — iOS/Android companion. Glanceable cards, bottom-sheet navigation, quick capture.

### Source materials referenced
- Written design brief (Portuguese) — see *Visual Foundations* below for the verbatim direction interpreted.
- No codebase, repo, or Figma file was provided. Real product UI does not exist yet; UI kits in this system are *aspirational specimens*, not recreations.

---

## 2 · Content fundamentals

### Voice
SyncLife addresses the user **directly and warmly**, in the second person. It is a calm presence — never a coach, never a cheerleader. Think *attentive friend who keeps your day together*.

- **"You"**, not "the user".
- **"We"** appears only when SyncLife is doing something on the user's behalf ("We've moved this to tomorrow").
- Never **"I"** — the product is not a chatbot persona.

### Tone examples

| Don't | Do |
|---|---|
| "Great job! You crushed your goals today! 🎉" | "Six of seven habits done. Tomorrow is open." |
| "ERROR: Sync failed." | "Couldn't reach your calendar. Retrying in a moment." |
| "Add Your First Task To Get Started!" | "Anything on your mind?" |
| "Welcome back, user!" | "Tuesday, 9:14." |

### Casing
- **Sentence case** everywhere. "Add habit", not "Add Habit".
- Headlines: sentence case, no period unless multi-sentence.
- Button labels: verb-first, ≤3 words. "Save", "Start session", "Move to tomorrow".
- Section eyebrows: ALL CAPS with wide tracking, used sparingly.

### Emoji
- **Not used** in product chrome, buttons, or system copy.
- Permitted in **user-generated** content (notes, journal entries, habit names the user sets).
- Brand-side: never. The accent color and domain colors carry that weight.

### Numbers & units
- Always tabular-nums in the body of the app — alignment matters.
- Currency: locale-aware; symbol attaches with a hair-space (`R$ 1.240`).
- Times: 24-hour by default ("14:30"), 12-hour as a user setting.
- Dates in copy: relative when ≤7 days ("yesterday", "Friday"), absolute beyond ("Mar 12").

### Microcopy patterns
- **Empty states** name the feeling, not the action. "Nothing planned. That's allowed."
- **Loading** states are silent — a soft pulse, no spinner copy.
- **Errors** explain what happened in one sentence, offer one verb to fix it.
- **Confirmations** are quiet — a checkmark drawing itself, not a green toast.

---

## 3 · Visual foundations

### Color
**Premium dark, not pure black.** The base canvas is a deep slate-cyan (`#0B0F14`). Surfaces step up in luminance — never with hard borders, always with a 1px highlight on the top edge to feel like real material. White is *never* pure (`#E7ECF1`).

- **Accent** is a single calm electric cyan (`#7CDCE8`). It appears on focus rings, primary actions, key data points, and nothing else. Saturation is restrained — it sits in the family of a screen's own glow, not a marker.
- **Domain colors** (health, routine, work, finances, mind) are muted, slightly desaturated — they identify, they don't shout.
- **No bluish-purple gradients.** No "AI" magenta. No left-border-only cards.

### Typography
- **Display:** Space Grotesk 500 — geometric grotesk, distinct silhouette, slightly negative tracking on big sizes.
- **Body:** Manrope 400/500 — humanist sans, optimized for screens.
- **Mono:** JetBrains Mono — for numbers, codes, timestamps.

> ⚠ **Font substitution flag.** The brief mentions *Aeonik* and *Sharp Grotesk* as ideal licensed options. Both are paid foundries. We've substituted **Space Grotesk** (Google Fonts) which shares the geometric grotesk DNA. **If you have Aeonik or Sharp Grotesk licenses, drop the `.woff2` files in `fonts/` and update the `@font-face` rule in `colors_and_type.css`.**

### Spacing & rhythm
A 4px base scale, with fibonacci-ish steps (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128). Generous whitespace is a primary design tool — sections breathe, dense data has its own islands.

Layouts are intentionally **asymmetric**: a title on the left with a wide gutter, a single visual element pulled off-axis on the right. Grids exist as scaffolding, not jail cells.

### Backgrounds
- **Solid dark surfaces are the default.** No full-bleed imagery in chrome.
- **Hero surfaces** (onboarding, splash, marketing) may carry an extremely subtle radial gradient (slate → slightly-warmer-slate) plus a fine SVG noise texture at ~3.5% opacity. The noise is what kills the "AI gradient" look.
- **Imagery**, when present, is desaturated and cool-leaning — never punchy stock. The product mostly shows the user's *own* data, not curated photography.

### Borders, dividers, lines
- Borders are **luminance-based**: a hair of white at 4–12% alpha on top of the surface, not gray lines.
- Dividers between rows are 1px at ~7% white.
- Inputs get a 1px outset at rest, accent-tinted ring on focus.

### Shadows
**No drop shadows in flat areas.** Depth comes from luminance steps between surfaces (bg-void → bg-base → bg-surface → bg-elevated). For floating elements (menus, modals) shadows are *long and very soft* — `0 20px 50px -20px rgba(0,0,0,0.8)` — never tight or dark.

### Corner radii
- **Inputs & small buttons:** 8–12px (taut, mechanical).
- **Cards & panels:** 16–24px (calm, considered).
- **Bottom sheets & hero surfaces:** 24–32px on the top corners only.
- **Pills & avatars:** full radius.
- Never mix more than 2 radius sizes in a single composition.

### Hover & press states
- **Hover** lifts the surface luminance by one step (`bg-surface` → `bg-elevated`); no glow, no scale.
- **Press** drops the surface back to its rest state *and* applies a 1px inset shadow (the "pushed in" feel).
- **Focus** is always a 2px outset ring in `--sl-accent` at 32% alpha, with a 1px inner ring at `--sl-line-accent`.

### Transparency & blur
- Used **only** for: the top app bar on scroll (`backdrop-filter: blur(20px)` over a 70% surface), modal backdrops, and bottom sheets above content.
- Never used decoratively. Frosted-glass cards are an anti-pattern here.

### Animation principles
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out) for narrative motion; `cubic-bezier(0.4, 0, 0.2, 1)` (standard) for UI; `cubic-bezier(0.34, 1.56, 0.64, 1)` (gentle spring) for micro-affirmations.
- **Durations:** UI = 160–240ms. Narrative scroll = 420–720ms.
- **No bounces** on primary UI. Springs only on small affirmative moments (checkmark, drop-into-place).
- **Scrollytelling** is the gold standard on the marketing site: elements pin, fade, transform as the user scrolls. Inside the product, motion is reserved for state transitions only.

### Microinteractions to nail
- Button press: a 1px vertical translate + the inset-shadow trick (feels like real pressure).
- Checkbox check: 240ms path-draw of the tick.
- Input validation: a small accent dot appears on the right when valid, not a green outline.
- Drag handles reveal at ~50ms hover delay (avoids twitchy reveals).
- Number deltas animate (today's step count rolling up).

---

## 4 · Iconography

**Library:** [Lucide](https://lucide.dev) — 1.75px stroke, rounded line caps, geometric. Loaded via CDN script (`<script src="https://unpkg.com/lucide@latest"></script>`) for HTML prototypes; install `lucide-react` in real apps.

> ⚠ **Substitution flag.** No icons were provided. Lucide was chosen because its stroke weight and corner treatment match the rest of the system (Space Grotesk's geometric feel + the soft radii on cards). **If SyncLife commissions a custom set, replace the CDN reference.** Specific icons to commission first: domain glyphs (health/routine/work/finances/mind) — currently mapped to Lucide `heart-pulse`, `sun`, `briefcase`, `wallet`, `brain`.

### Usage rules
- **Stroke icons only.** No filled-glyph mixing.
- **Sizes:** 16, 20, 24px in UI; 32, 40px for empty states.
- **Color:** inherit (`currentColor`). Tint with `--sl-fg-secondary` at rest, `--sl-fg-primary` or `--sl-accent` on emphasis.
- **Never decorative.** Every icon supports a label or stands in for one in a confined space.
- **Emoji is not iconography.** See the Content section.
- **Unicode arrows** (`→`, `↗`) are permitted inline in copy — they're typographic, not iconic.

---

## 5 · File index

```
.
├── README.md                  ← you are here
├── SKILL.md                   ← agent-skill manifest (drop into Claude Code)
├── colors_and_type.css        ← all design tokens + base element styles
├── assets/
│   ├── logo-mark.svg          ← brand mark (mono, on-dark)
│   ├── logo-lockup.svg        ← horizontal lockup
│   └── noise.svg              ← reusable noise texture
├── fonts/                     ← (empty — Google Fonts CDN used; drop .woff2 here to override)
├── preview/                   ← design-system cards (rendered in Design System tab)
│   ├── colors-*.html
│   ├── type-*.html
│   ├── spacing-*.html
│   ├── components-*.html
│   └── brand-*.html
└── ui_kits/
    ├── web/                   ← SyncLife Web dashboard
    │   ├── index.html
    │   └── components/*.jsx
    └── mobile/                ← SyncLife Mobile (iOS frame)
        ├── index.html
        └── components/*.jsx
```

---

## 6 · How to use this system

1. Link `colors_and_type.css` from any HTML file.
2. Use CSS variables (`var(--sl-accent)`, etc.) rather than hex codes.
3. Pull JSX components from `ui_kits/` as starting points — they're intentionally light on logic, heavy on visuals.
4. When in doubt: do less, leave more space, trust the type.

---

## 7 · Open questions for the SyncLife team

- **Logo direction.** The included mark is a stub — two interlocked arcs forming a sync glyph. Please confirm or replace.
- **Font licensing.** Will SyncLife purchase Aeonik / Sharp Grotesk, or commit to Space Grotesk as the production face?
- **Domain count.** The system currently treats five domains (health / routine / work / finance / mind). Confirm this list or amend.
- **Photography.** Will real photography ever appear in the product, or is the product chrome image-free? This decision shapes onboarding & marketing.
- **Localization.** The brief is in Portuguese — confirm pt-BR is the primary locale and we should design copy at pt-BR string lengths (15–20% longer than English).
