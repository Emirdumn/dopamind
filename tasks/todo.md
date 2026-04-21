# ArabaIQ — Airbnb Design System Migration · TODO

> **Status key:** `[ ]` pending · `[~]` in progress · `[x]` done · `[-]` deferred

---

## Faz 1 — Design Tokens (foundation)

- [x] `frontend/tailwind.config.ts` — Airbnb palette, Inter font stack, radius/shadow scale
- [x] `frontend/src/app/globals.css` — root CSS variables, Inter @import, scrollbar, selection tint, `.shadow-lift`, `.brand-gradient`, `.superscript`
- [x] Legacy token names (`background`, `foreground`, `surface`, `muted`, `accent`, `primary`) repointed to Airbnb values for backward compatibility

## Faz 2 — UI Primitives

- [x] `components/ui/Button.tsx` — variants `primary` / `secondary` / `ghost` / `danger` / `icon-circle`; sizes `sm/md/lg`; shapes `rect/pill`; leading/trailing icon slots; Ink focus ring; `active:scale-[0.96]` press
- [x] `components/ui/Input.tsx` — white canvas, hairline border, Ink focus + 2px ring, Error Red state, 12px Ash label, leading/trailing icon slots, a11y `aria-invalid`/`aria-describedby`
- [x] `components/ui/Badge.tsx` — variants `neutral/success/warning/danger/info/brand`, sizes `sm/md`, pastel 10%-fill + 20%-border pattern, opt-in uppercase for 11px status caps
- [x] `components/ui/ScoreRing.tsx` — hairline track, Ink numeral, auto stroke scaling, tabular-nums, aria-label; keeps `score.hi/mid/lo` semantic palette

## Faz 3 — Layout

- [ ] `frontend/src/app/layout.tsx` — `next/font/google` Inter (400/500/600/700) → `--font-inter`
- [ ] `frontend/src/app/[locale]/layout.tsx` — body class Inter default, white canvas
- [ ] `components/layout/Header.tsx` — 80px white, hairline bottom border, Rausch wordmark, Ink 500 nav links, active underline, locale switcher redesign
- [ ] `components/layout/Footer.tsx` — Soft Cloud bg, 3-column (Product / Company / Legal), hairline top border, 12px Mute copyright

## Faz 4 — Pages & Feature Components

### 4a · Home (`[locale]/page.tsx`)
- [ ] Hero: 64px Inter 700 Ink headline, 18px Ash subtitle, Rausch primary CTA, outlined secondary
- [ ] Retain 3-step guide (below hero)
- [ ] Hybrid: add 4:3 mock vehicle grid below hero (tabbed "Popüler Karşılaştırmalar" — C-Segment / Premium / SUV / Elektrikli)
- [ ] Inspiration text-grid: 6-col desktop / 2-col mobile list of popular comparison pairs
- [ ] Mobile bottom tab bar: Home · Compare · Garage (24px icons + 12px labels)

### 4b · Compare (`[locale]/compare/page.tsx` + `CompareClient.tsx`)
- [ ] `VehicleSelectionModal` → white bg, 20px radius, `.shadow-lift`, 24px padding, Rausch submit
- [ ] Compare table → amenity-grid style, hairline row separators, 16px row padding, icon+label pattern
- [ ] **"ArabaIQ Top Pick" lockup** on algorithm winner: centered large score (52px 700) + dual laurel SVG + `TOP PICK` superscript + Ash sub-label

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
