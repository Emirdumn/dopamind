# ArabaIQ — Design Decisions & Lessons

Running log of architectural/design decisions made during the Airbnb-inspired rebrand. Each entry: **date · decision · rationale · consequence**.

---

## 2026-04-21 · Adopt Airbnb light design system
- **Decision:** Full visual rebrand from dark (Space Grotesk/Manrope, `#0A0A0C` canvas) to Airbnb-inspired light (Inter, `#ffffff` canvas, Rausch `#ff385c` accent).
- **Rationale:** ArabaIQ is positioned as a *decision engine*, not a classic listings site. Airbnb's confidence-through-whitespace language — scarce accent, heavy use of Ink Black on white, photography-first — maps directly to "trust + clarity" as product values. Dark themes in consumer decision surfaces historically reduce perceived trust.
- **Consequence:** Every UI primitive, layout and page is rewritten. Functional logic untouched. Users will experience a radically different chrome; in-product copy unchanged.

## 2026-04-21 · Light mode only (initial decision)
- **Decision:** No dark mode variant shipped.
- **Rationale:** Airbnb does not ship a native dark mode (design doc §9 "Known Gaps"). Single-theme discipline prevents token drift and simplifies the component contract during the rebrand.
- **Consequence:** `color-scheme: light` locked at root. **Superseded** by the dark palette restoration entry below after product review — the light look read as "rental marketplace" rather than "decision engine" for ArabaIQ's audience.

## 2026-04-21 · Dark palette restoration (reversal)
- **Decision:** Revert the light canvas to a dark one while preserving every structural decision from Phases 1-4 (Top Pick lockup, Compare redesign, MobileTabBar, Button/Input/Badge variants, Laurel SVG, equipment icon chips).
- **Rationale:** On review with the light palette in place, the product lost its "tool you reach for" quality — it looked like a vacation rental site. ArabaIQ is used in evaluation mode, often at night, often on phones; dark canvas + Rausch accent reads as deliberate, editorial, analytical. Keeping Rausch on dark gives the brand the same signature moment Airbnb has on light, inverted.
- **Consequence:**
  - All canonical tokens (canvas, subsurface, hairline, ink, charcoal, ash, mute, stone) repointed in a single commit. Because names didn't change, every Phase 2-4 component theme-swapped without edits.
  - `text-canvas` on Rausch/Error fills was replaced with `text-white` in four places (Button primary/danger, equipment check chip, narrative bullets) — canvas is now near-black, so "text colored like the canvas" would collide with the fill.
  - Badge success/warning text brightened: `#4ade80` / `#fbbf24` are the dark-legible variants (new `badge-success` / `badge-warning` tokens). Pastel 12% fills remained; they read as subtle hue glows on near-black.
  - `shadow-lift` and `shadow-pop/press` re-tuned for dark: combined ambient black (40-55% opacity) with a 6%-white 1px hairline outline so elevation still reads. `shadow-focus` flips to white-ink ring.
  - Selection tint opacity bumped from 18% → 28% because Rausch needs more weight on dark to stay visible.
  - Modal backdrop: previously `bg-ink/40` (which on dark would produce a white fog — wrong). Switched to `bg-black/70` — deeper black veil, preserves focus on the modal surface.
  - Equipment presence check keeps the Rausch-filled 24px chip — on dark it gets more visual weight, which is the right direction: presence is the signal.
- **Rule for next theme change:** future flips (e.g., if we ever ship an A/B or a "daylight" mode) must follow the same pattern — token values move, token names stay frozen. Any component referring to a hex value directly is a bug to be fixed, not a feature.

## 2026-04-21 · Inter as the Cereal VF substitute
- **Decision:** Use Inter (Google Fonts, 400/500/600/700) as the system font; fallback chain `Inter → -apple-system → system-ui → Roboto → Helvetica Neue`.
- **Rationale:** Airbnb Cereal VF is proprietary. The design doc suggests Inter with letter-spacing reduced at display sizes; we honor that via Tailwind `letterSpacing.display-{sm,md,lg}` tokens and a global `h1/h2/h3 { letter-spacing: -0.018em }` rule. Circular is closer in metrics but commercial.
- **Consequence:** Body rendering weight is **500**, not 400 — every component must use `font-medium` or heavier. Adding a 400-regular utility breaks the system's deliberate density.

## 2026-04-21 · Preserve `score.hi/mid/lo` traffic-light palette
- **Decision:** Keep green `#22C55E` / amber `#F59E0B` / red `#EF4444` as `score.*` tokens alongside the Rausch-only accent rule.
- **Rationale:** The Do/Don'ts §7 say "no secondary accent colors" — a rule built for photography-led content. ArabaIQ's `ScoreRing` conveys at-a-glance algorithmic fitness; replacing green/amber/red with greyscale or Rausch would destroy the signal.
- **Consequence:** Documented as an explicit **semantic exception**. Only the `ScoreRing` component and any derivative badges (e.g. "Top Pick score ≥ 90") may use `score.*`. No button, link, or decorative element is allowed to reach for these.

## 2026-04-21 · Reserve Plus Magenta + Luxe Purple, do not ship
- **Decision:** Omit `#92174d` (Plus) and `#460479` (Luxe) from Tailwind config and runtime CSS.
- **Rationale:** We have no product-tier distinction today. Shipping unused tokens invites accidental use and dilutes the Rausch-centric identity. Intent is preserved here; when a premium surface ships, we add both tokens in one dedicated commit.
- **Consequence:** Future premium-tier work has a documented path. Until then, Rausch is the sole brand color.

## 2026-04-21 · Hybrid home surface (hero + vehicle grid)
- **Decision:** Keep a text-first hero with strong Rausch CTA, but add a 4:3 placeholder-image vehicle grid below, tabbed by segment.
- **Rationale:** Pure photography-first home pages (Airbnb native) require a content pipeline we don't have (real listings, real photos). Pure text-first feels thin. The hybrid signals that ArabaIQ is about real vehicles while maintaining the "decision engine" voice.
- **Consequence:** Need placeholder/mock vehicle renders for Phase 4a. Long-term, this grid becomes the *popular comparisons* entry point.

## 2026-04-21 · Guest Favorite → "ArabaIQ Top Pick" lockup
- **Decision:** Adapt the Airbnb Guest Favorite centered-number + laurel-wreath pattern for the algorithm's winning vehicle on Compare pages.
- **Rationale:** Directly serves the "decision engine" promise — the product tells the user what to pick, not just what exists. This is the single moment where ArabaIQ should feel ceremonial.
- **Consequence:** Needs an SVG laurel asset pair (or single + mirror flip). Only one Top Pick allowed per viewport to preserve ceremony.

## 2026-04-21 · Top Pick scoring = wins across dimensions (+ honest ties)
- **Decision:** The "ArabaIQ Top Pick" centerpiece number is a **wins count**, not a composite score. Each of the four leader dimensions (Technical balanced · Performance power · Market price · Equipment richness) casts one vote; the car with the most votes wins. Ties or fewer-than-2 measurable dimensions → no lockup rendered.
- **Rationale:** A synthetic 0-100 composite would imply a precision the compare response doesn't carry (weights aren't user-tunable on this page; budget/KM/fuel-preference context only exists on Recommendations). Wins count is derived from data the user can already see in the tabs — reasoning is auditable. "No winner" in a tie is preferable to a false ceremony; the algorithm stays honest.
- **Consequence:** The lockup will not always appear. Subtle Rausch echo markers (dot on sticky chip, dot on table column header, "Top Pick" superscript on summary card, Ink border ring on winner's chip) keep the winner visible across every tab even when the lockup is off-screen. `compare-top-pick.ts` is the single source of truth; future aggregate-score work should extend it, not bypass it.

## 2026-04-21 · Tab active indicator = Ink underline, not Rausch
- **Decision:** Compare's five-tab selector (Summary · Technical · Performance · Market · Equipment) uses a 2px **Ink** bottom border for the active tab, with Ink label. Inactive tabs are Ash.
- **Rationale:** Rausch is reserved for CTAs and the Top Pick ceremony. Using Rausch on tabs dilutes the signal — every time a user scans the page, Rausch should mean "do this" or "this is the winner", never "you're here".
- **Consequence:** Matches the Airbnb tri-tab picker pattern (Stays/Experiences/Services). Any future tabbed UI in ArabaIQ follows the same rule: Ink underline active, Rausch forbidden in navigation chrome.

## 2026-04-21 · Equipment cells: icon chips, not text labels
- **Decision:** In the equipment comparison table, `true` renders as a 24px Rausch-filled circle with a white check, `false` as a hairline-outlined circle with a Mute minus, and missing data as a Stone em-dash.
- **Rationale:** Text "Var/Yok" columns become a wall of repetition that the eye can't pattern-match. Icon chips turn the column into a visual diff — you can see instantly which car has more features without reading. The Rausch check earns its accent use here because presence/absence is a decision signal, not decorative.
- **Consequence:** One more place where Rausch appears outside CTAs; lintable against the "Rausch rarely" rule only if paired with an intentional meaning (present = advantage). Reviewers checking accent discipline should treat equipment check marks as an approved exception alongside the Top Pick dot.

## 2026-04-21 · Add popular-comparisons inspiration grid to home
- **Decision:** Below the 3-step guide, add a tabbed text-only grid of popular comparison pairs (e.g. *C-Segment: Corolla vs Civic*, *Premium: 3 Series vs C-Class*, *SUV: Tiguan vs CR-V*).
- **Rationale:** Airbnb's inspiration grid makes the page feel *full* without leaning on media. Converts directly to "here are decisions people make, try these".
- **Consequence:** i18n needs `home.popular_comparisons.{tabs, pairs}` message keys. Pairs can be hand-curated initially; later, driven by most-compared analytics.

## 2026-04-21 · Ship a mobile bottom tab bar
- **Decision:** Three-tab bottom-fixed bar on <800px: Home · Compare · Garage.
- **Rationale:** Airbnb's bottom nav is why the mobile surface feels app-like. Hamburger is reserved for secondary actions (locale switcher, legal).
- **Consequence:** New component `components/layout/MobileTabBar.tsx`. Active state = Rausch icon + Rausch 12px label. `Compare` gets priority middle slot as the product's core verb.

## 2026-04-21 · Midnight Showroom adoption (supersedes Airbnb direction)
- **Decision:** Retire the Airbnb-inspired language (both the light and the Rausch-on-dark revert) in favour of a self-styled "Midnight Showroom" design system: MD3 token vocabulary, deep blue-black surface ladder (`#0c1324` canvas, 7-step `surface-container-*` ramp to `#2e3447`), electric indigo primary gradient (`#c0c1ff → #8083ff`), dual-typeface (Plus Jakarta Sans display + Inter body), glassmorphism navigation, and a strict **no-1px-divider** rule (all sectioning via surface shifts).
- **Rationale:** After reviewing both the light Airbnb pass and the Rausch-on-dark revert, the product still read as "marketplace" rather than "decision engine at a luxury launch". The user referenced `arabaiq.com/en` as a structural baseline (simple home, 3-step flow, Compare/Garage CTAs) and asked for a visual layer that feels like "a spotlight hitting a vehicle in a dark gallery" — hence tonal depth + LED-gradient primary + editorial Jakarta display. This is not an iteration on Airbnb; it is a new identity. Airbnb decisions that remain valuable (Top Pick lockup structure, Compare table amenity-grid layout, MobileTabBar, tab underline convention) are preserved as **structural bones** under the new skin.
- **Consequence:**
  - Every canonical token (canvas, subsurface, hairline, ink, charcoal, ash, mute, stone) repointed to MD3 values. Token names frozen to avoid a ~300-reference utility-class churn. Rausch coral (`#ff385c`) is gone; `bg-rausch` / `text-rausch` now resolve to MD3 primary indigo so old utility classes quietly re-theme themselves into the new palette.
  - New canonical tokens introduced alongside: `primary-container`, `secondary-container`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, full `surface-container-*` ladder, `surface-variant` (for glass). Components built after M0 should prefer these MD3 names over legacy.
  - `on-surface` is **`#dce1fb`**, not pure white (doc §6 "no 100% white on pure black — visual vibration"). Any `text-white` must be justified (doc-approved: primary CTA label only, where the gradient earns it).
  - Ambient shadows tinted with `surface-container-lowest` (`rgba(7, 13, 31, X)`) at 4-8% opacity, never pure black; 40-60px blur. All Material-weight drop shadows forbidden.
  - **No-line rule:** `border`, `border-b`, `divide-*` utilities between content blocks are banned. Zebra rows use alternating `bg-surface` vs `bg-surface-container-low`. Card edges are surface shifts, not strokes. `outline-variant` exists for inputs (ghost-border-bottom @ 15-22%) and focus rings; that is its only job.
  - Typography: `h1`-`h3` reach for Plus Jakarta Sans via `--font-jakarta`. Body remains Inter. Tight negative tracking (`-0.028em` on `h1`) is part of the brand voice, not optional.
  - Transitions: default duration bumped to **300ms ease-in-out** at the Tailwind config level — premium-feel minimum per doc §6. Components still free to override for snappy micro-interactions (`press: 120ms`).
  - Focus rings: `shadow-focus` now primary indigo, not ink white.
  - Score palette preserved untouched (green/amber/red data semantic) — same semantic-exception rule carried over.
- **Rule for next theme change:** same discipline as before — **token values move, token names stay frozen**. The MD3 ladder (`surface-container-*`) is a one-way doorway: once a component adopts it, it should not fall back to the legacy canvas/subsurface pair unless there's a specific reason. Any hex value inline in a component is a bug.

---

## Token repoint strategy (Phase 1)

Legacy Tailwind token names were **kept and repointed** rather than renamed:

| Legacy | New value | Semantic |
|--------|-----------|----------|
| `background` | `#ffffff` | Canvas |
| `surface` | `#f7f7f7` | Subsurface |
| `foreground` | `#222222` | Ink |
| `muted` | `#6a6a6a` | Ash |
| `accent` | `#dddddd` | Hairline |
| `primary` | `#ff385c` | Rausch |
| `primary.dim` | `#e00b41` | Deep Rausch |

**Why:** Roughly 2,200 LOC of component code uses these class names. Renaming would force 21 files to change in Phase 1, inflating the blast radius and making the visual diff harder to review. Repointing means Phase 1 is *just tokens* — each component migration in Phases 2–4 can then adopt the Airbnb-named tokens (`ink`, `rausch`, `hairline`, ...) with clean semantics.

**Trade-off:** Until Phase 2–4 complete, some components will render Rausch coral where `primary` is used as a neutral light accent (e.g. a `text-primary` that was meant to be "lighter than foreground"). This is acceptable migration noise — caught visually, not catastrophically. Any component whose semantic would read incorrectly post-repoint must be fixed in the same commit that introduces the new token names.

---

## Typography notes (Midnight Showroom)

- **Dual-typeface:** Plus Jakarta Sans for display/headlines (`font-heading`, `font-display`, `h1`-`h3`). Inter for body/labels (`font-sans`, `font-body`). The visual identity comes from typeface pairing + extreme scale contrast (display-lg paired with body-md), not weight alone.
- **Never use `font-weight: 400` for body.** System body weight remains 500; Jakarta display can use 700 or 800 for hero moments.
- **Tracking:** Jakarta display stack gets `-0.028em` at `display-lg`, `-0.02em` at `display-md`, `-0.015em` at `display-sm`. Body stays at 0.
- **Uppercase:** only the 8px superscript (`.superscript` utility), e.g. "ARABAIQ TOP PICK". No other uppercase transforms.
- **Fluid display sizes:** `display-{sm,md,lg}` use `clamp()` so hero type scales with viewport without breakpoint ceremony.

## Shadow notes (Midnight Showroom)

- **Cards have no shadow by default.** Cards sit on the surface-container ladder; separation comes from ladder shifts (e.g. `surface` card on `surface-dim` context, or `surface-container-low` card stepping up to `surface-container-high` on hover).
- **Ambient tinted shadows only.** All shadow recipes are built from `rgba(7, 13, 31, X)` (surface-container-lowest tinted) at 4-8% opacity, 40-60px blur. Pure black shadows are banned.
- **`.shadow-ambient`** (Tailwind: `shadow-ambient`) — the standard floating-element elevation. 48px/16px blur, 5-6% opacity.
- **`.shadow-lift`** — stronger, for sticky panels, modals, dropdowns. Same tinted recipe, deeper blur.
- **`.shadow-pop` / `.shadow-press`** — subtle lift for interactive affordances.
- **`shadow-focus`** flips to primary indigo (`0 0 0 2px #c0c1ff`) — never white on dark.
- **`shadow-glow`** — light bleed simulation for Showroom-card hover states: faint `rgba(192, 193, 255, …)` 1px inner ring + 32px outer glow.

## No-line rule (Midnight Showroom)

Solid `1px` borders between content blocks are banned. If you reach for `border`, `border-b`, or `divide-*` to separate sections, stop and ask: can a surface-ladder shift do this? The answer is yes in every non-input case.

- **Card edges:** surface shift, never a stroke.
- **Table rows:** zebra stripe via `bg-surface` / `bg-surface-container-low`, not `border-b`.
- **Sections:** parent uses `bg-surface`, child card uses `bg-surface-container` (visible edge emerges from the tone shift).
- **Exception:** inputs and focus rings. A minimal `ghost-border-bottom` at `outline-variant` @ 15-22% opacity is acceptable on form controls; focus thickens to 2px primary.
