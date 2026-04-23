# ArabaIQ — "Midnight Showroom" Design System · TODO

> **Status key:** `[ ]` pending · `[~]` in progress · `[x]` done · `[-]` deferred
>
> **Theme:** Dark blue-black canvas, MD3 token vocabulary, electric indigo
> primary (`#c0c1ff → #8083ff` gradient), editorial dual-typeface (Plus
> Jakarta Sans display + Inter body), glassmorphism nav, **no 1px dividers**
> (surface-ladder shifts only). Supersedes both the Airbnb light palette
> (shipped briefly in Faz 1-4) and the Airbnb-on-dark revert (Rausch coral
> on near-black). See `lessons.md` → "Midnight Showroom adoption".

---

## Faz 1 — Design Tokens (foundation)

- [x] `frontend/tailwind.config.ts` — Airbnb token structure, Inter font stack, radius/shadow scale
- [x] `frontend/src/app/globals.css` — root CSS variables, Inter @import, scrollbar, selection tint, `.shadow-lift`, `.brand-gradient`, `.superscript`
- [x] Legacy token names (`background`, `foreground`, `surface`, `muted`, `accent`, `primary`) repointed for backward compatibility
- [x] **Dark palette swap (2026-04-21, post-Faz 4b):** canvas `#0b0b0d`, subsurface `#141418`, hairline `#2a2a2e`, ink `#f5f5f7`, ash `#9a9aa4`, stone `#3f3f44`, error `#ff5d3c`, info `#60a5ff`. Rausch preserved. Shadows re-tuned for dark. `color-scheme: dark`. Token names unchanged so every Phase 2-4 component theme-swaps without edits.

## Faz M0 — Midnight Showroom token foundation (2026-04-21)

- [x] `frontend/src/app/fonts.ts` — Plus Jakarta Sans added (`--font-jakarta`, weights 400-800) alongside Inter for dual-typeface system
- [x] `frontend/tailwind.config.ts` — MD3 surface ladder (`surface-dim` → `surface-container-highest`), primary indigo gradient (`#c0c1ff → #8083ff`), `on-surface #dce1fb` (no pure white), `outline-variant #434758` (ghost border substrate), MD3 error palette, `secondary-container` chip tokens, ambient shadow recipes (40-60px blur @ 4-8% tinted), `bg-gradient-primary` + `bg-light-bleed` image utilities, default transition 300ms ease-in-out
- [x] `frontend/src/app/globals.css` — root CSS variables for the full MD3 palette, Jakarta imports, `.glass-nav` / `.glass-panel` / `.primary-gradient` / `.light-bleed` / `.ghost-border-bottom` / `.ghost-border` / `.shadow-ambient` utilities, Jakarta on `h1`-`h3`, indigo selection tint
- [x] `frontend/src/app/[locale]/layout.tsx` — `jakarta.variable` attached to `<html>` alongside `inter.variable`
- [x] Legacy tokens (canvas / subsurface / hairline / ink / charcoal / ash / mute / stone / rausch) repointed to Midnight Showroom equivalents so every Phase 2-4 utility class re-themes automatically
- [x] Rausch coral retired — `bg-rausch` / `text-rausch` now resolve to MD3 primary indigo; doc update in `lessons.md` → "Midnight Showroom adoption"

## Faz 2 — UI Primitives

- [x] `components/ui/Button.tsx` — variants `primary` / `secondary` / `ghost` / `danger` / `icon-circle`; sizes `sm/md/lg`; shapes `rect/pill`; leading/trailing icon slots; Ink focus ring; `active:scale-[0.96]` press
- [x] `components/ui/Input.tsx` — white canvas, hairline border, Ink focus + 2px ring, Error Red state, 12px Ash label, leading/trailing icon slots, a11y `aria-invalid`/`aria-describedby`
- [x] `components/ui/Badge.tsx` — variants `neutral/success/warning/danger/info/brand`, sizes `sm/md`, pastel 10%-fill + 20%-border pattern, opt-in uppercase for 11px status caps
- [x] `components/ui/ScoreRing.tsx` — hairline track, Ink numeral, auto stroke scaling, tabular-nums, aria-label; keeps `score.hi/mid/lo` semantic palette

## Faz 3 — Layout

- [x] `frontend/src/app/fonts.ts` — `next/font/google` Inter (400/500/600/700) with `variable: '--font-inter'`
- [x] `frontend/src/app/layout.tsx` — root pass-through; metadata + globals.css import
- [x] `frontend/src/app/[locale]/layout.tsx` — `html` receives `inter.variable`; body class `font-sans font-medium bg-canvas text-ink`; `pt-16 md:pt-20` header offset + `pb-20 md:pb-0` for mobile tab bar
- [x] `components/layout/Header.tsx` — 64px mobile / 80px desktop, white canvas, hairline bottom; Rausch→magenta `brand-gradient` wordmark; 4-item desktop nav (Home · Recommendations · Compare · Garage) with 2px Ink underline active state; minimal mobile chrome (wordmark + locale only); locale switcher with `text-ink`/`text-mute` pair
- [x] `components/layout/Footer.tsx` — Soft Cloud subsurface, 3-column (Product · Company · Legal), Ink 14/600 headings, Ash 14/500 links, hairline top border, brand-gradient wordmark + 12px Mute copyright
- [x] `components/layout/MobileTabBar.tsx` — `md:hidden` fixed bottom bar, 3 tabs (Home · Compare · Garage), active Rausch + 2px pill indicator + heavier icon stroke, safe-area inset bottom padding
- [x] i18n: new `footer.{product,company,legal,about,contact,privacy,terms,cookies}` keys in `tr.json` + `en.json`

## Faz 4 — Pages & Feature Components

### 4a · Home (`[locale]/page.tsx`)
- [ ] Hero: 64px Inter 700 Ink headline, 18px Ash subtitle, Rausch primary CTA, outlined secondary
- [ ] Retain 3-step guide (below hero)
- [ ] Hybrid: add 4:3 mock vehicle grid below hero (tabbed "Popüler Karşılaştırmalar" — C-Segment / Premium / SUV / Elektrikli)
- [ ] Inspiration text-grid: 6-col desktop / 2-col mobile list of popular comparison pairs
- [ ] Mobile bottom tab bar: Home · Compare · Garage (24px icons + 12px labels)

### 4b · Compare (`[locale]/compare/page.tsx` + `CompareClient.tsx`)
- [x] `VehicleSelectionModal` → Canvas bg, 20px radius (`rounded-xl`), `.shadow-lift`, Ink/40 backdrop, inline search icon + close button, hairline-separated result rows with subsurface hover
- [x] Compare table → amenity-grid style: 14px-rounded hairline container, Ash uppercase column headers, Ink cell text, subtle canvas/subsurface zebra, sticky-left field column, icon chips (Rausch check / Mute minus) for equipment booleans
- [x] **"ArabaIQ Top Pick" lockup** on algorithm winner: centered 56px 700 wins count + dual laurel SVG (`Laurel.tsx`) + `ARABAIQ TOP PICK` superscript + Ink car name + Ash `{wins}/{total} kategoride önde` sub-label + dimensions detail
- [x] `compare-top-pick.ts` — wins-per-dimension aggregator (Technical · Performance · Market · Equipment); returns `null` on ties or <2 measurable dimensions (honest: no ceremony without a clear winner)
- [x] Top Pick echo markers: Rausch 6px dot on winner's chip (sticky header) + column header + "Top Pick" superscript on winner's summary card + Ink border ring on chip

### 4c · Recommendations
- [ ] `recommendations/page.tsx` — layout reflow with sticky right-rail booking-panel style debug
- [ ] `RecommendationForm` — Airbnb search-pill 3-segment structure (tür / öncelik / bütçe) + Rausch 48px circular submit
- [ ] `PrioritySlider` — Ink track + Rausch fill + Rausch knob, 44px target
- [ ] `RecommendationPresetBar` — Ink pill chips, active = Ink fill + white label
- [ ] `RecommendationResultCard` — 14px radius, no shadow, 4:3 image well, 3-row metadata stack
- [ ] `RecommendationSkeleton` — Soft Cloud shimmer, hairline outline
- [ ] `RecommendationDebugPanel` — sticky right-rail style, `.shadow-lift`, 14px radius, 24px padding

### 4d · Garage (`[locale]/garage/page.tsx`)
- [ ] Airbnb "Wishlists" paralel: white canvas, 4:3 placeholder image, 14px radius, Rausch "Garaja ekle" CTA

### 4e · Not Found
- [ ] `[locale]/not-found.tsx` — light bg, Ink headline, Ash body, Rausch "Anasayfaya dön" primary

---

## Cross-cutting

- [ ] Remove legacy Space Grotesk / Manrope references (font classes, globals.css)
- [ ] i18n strings: add `common.nav.compare`, `common.nav.garage`, `common.cta.top_pick`, `home.popular_comparisons.*`
- [ ] Mobile bottom nav shared component: `components/layout/MobileTabBar.tsx`
- [ ] Guest Favorite equivalent SVG: `public/laurel-wreath-left.svg` + mirror (or single SVG + CSS flip)

## Deferred / Out of Scope

- [-] **Dark mode** — Airbnb ships light only; revisit post-launch.
- [-] **Plus Magenta (#92174d) / Luxe Purple (#460479)** — reserved for a future premium tier surface; not in Tailwind config yet. Documented in lessons.md so the intent is preserved.
- [-] **3D rendered category icons** — nice-to-have for category picker (Otomobil / SUV / Elektrikli); requires asset production. Placeholder: 2D outline icons until art is ready.
- [-] **Airbnb Cereal VF self-hosting** — licensing unclear; Inter is the committed fallback.
- [-] **Animation/transition timing tokens** — doc §9 "Known Gaps" says not captured. Using the 400/500ms `fade-*` + 120ms `press` defaults.
