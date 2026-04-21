# ArabaIQ — Design Decisions & Lessons

Running log of architectural/design decisions made during the Airbnb-inspired rebrand. Each entry: **date · decision · rationale · consequence**.

---

## 2026-04-21 · Adopt Airbnb light design system
- **Decision:** Full visual rebrand from dark (Space Grotesk/Manrope, `#0A0A0C` canvas) to Airbnb-inspired light (Inter, `#ffffff` canvas, Rausch `#ff385c` accent).
- **Rationale:** ArabaIQ is positioned as a *decision engine*, not a classic listings site. Airbnb's confidence-through-whitespace language — scarce accent, heavy use of Ink Black on white, photography-first — maps directly to "trust + clarity" as product values. Dark themes in consumer decision surfaces historically reduce perceived trust.
- **Consequence:** Every UI primitive, layout and page is rewritten. Functional logic untouched. Users will experience a radically different chrome; in-product copy unchanged.

## 2026-04-21 · Light mode only
- **Decision:** No dark mode variant shipped.
- **Rationale:** Airbnb does not ship a native dark mode (design doc §9 "Known Gaps"). Single-theme discipline prevents token drift and simplifies the component contract during the rebrand.
- **Consequence:** `color-scheme: light` locked at root. Any future dark-mode work must duplicate the full token table, not half-swap.

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

## 2026-04-21 · Add popular-comparisons inspiration grid to home
- **Decision:** Below the 3-step guide, add a tabbed text-only grid of popular comparison pairs (e.g. *C-Segment: Corolla vs Civic*, *Premium: 3 Series vs C-Class*, *SUV: Tiguan vs CR-V*).
- **Rationale:** Airbnb's inspiration grid makes the page feel *full* without leaning on media. Converts directly to "here are decisions people make, try these".
- **Consequence:** i18n needs `home.popular_comparisons.{tabs, pairs}` message keys. Pairs can be hand-curated initially; later, driven by most-compared analytics.

## 2026-04-21 · Ship a mobile bottom tab bar
- **Decision:** Three-tab bottom-fixed bar on <800px: Home · Compare · Garage.
- **Rationale:** Airbnb's bottom nav is why the mobile surface feels app-like. Hamburger is reserved for secondary actions (locale switcher, legal).
- **Consequence:** New component `components/layout/MobileTabBar.tsx`. Active state = Rausch icon + Rausch 12px label. `Compare` gets priority middle slot as the product's core verb.

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

## Typography notes

- **Never use `font-weight: 400`.** System body weight is 500.
- **Tracking:** only headlines 20px+ use `letter-spacing: -0.018em` to -0.02em. Body stays at 0.
- **Uppercase:** only the 8px superscript (`.superscript` utility). No other uppercase transform in the system.
- **Single family:** Inter for everything. `font-heading`, `font-body`, `font-sans` all resolve to the same stack — the visual identity comes from weight + tracking, not typeface mixing.

## Shadow notes

- **Cards have no shadow.** Listing-style cards sit on white canvas; separation comes from whitespace and radius.
- **`.shadow-lift`** is the three-layer booking-panel elevation. Use only on sticky panels, modals, dropdowns.
- **`.shadow-press`** is for icon buttons at press state (subtle 4px/12% lift).
- **`.shadow-focus`** is the 2px Ink focus ring.
- **`.shadow-focus-white`** is the 4px white separator ring — used when a circular icon button sits over a photograph.
