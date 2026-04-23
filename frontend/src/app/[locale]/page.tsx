"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Search, ArrowUpRight, GitCompare } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import VehicleSelectionModal from "@/components/compare/VehicleSelectionModal";

/**
 * Homepage — Midnight Showroom "LUXEDRIVE" edition.
 *
 * Full-bleed editorial entry page matching the reference mockup:
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ 1. Asymmetric hero                                       │
 *   │    left: title · subtitle · inline search · trending pills │
 *   │    right: full-bleed car photography (placeholder slot)  │
 *   ├──────────────────────────────────────────────────────────┤
 *   │ 2. Popular Models — asymmetric 2+1 / 1+2 grid            │
 *   │    big landscape car cards alternate with a "Compare     │
 *   │    Head-to-Head" text card (doc §6 Intentional Asymmetry)│
 *   ├──────────────────────────────────────────────────────────┤
 *   │ 3. Footer (inherited from [locale]/layout.tsx)           │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Car photography is wired but not yet populated; each model slot carries
 * a gradient placeholder that simulates automotive studio lighting until a
 * real JPEG lands at the annotated `/public/cars/*.jpg` path.
 */

type PopularModel = {
  id: string;
  kicker: string;         // "TRACK FOCUSED", "GRAND TOURER", "HYPERCAR"
  name: string;
  stats: string;          // "518 HP · 3.0s 0-60"
  /** Grid span within a 3-col layout. 2 = landscape hero; 1 = square tile. */
  span: 1 | 2;
  /** Optional real photo path. When populated, takes precedence over `gradient`. */
  imageSrc?: string;
  /** CSS gradient placeholder evoking studio-lit vehicle photography. */
  gradient: string;
};

const POPULAR_MODELS: PopularModel[] = [
  {
    id: "porsche-gt3rs",
    kicker: "TRACK FOCUSED",
    name: "Porsche 911 GT3 RS",
    stats: "518 HP · 3.0s 0–60",
    span: 2,
    // imageSrc: "/cars/porsche-gt3-rs.jpg",
    gradient:
      "radial-gradient(ellipse 70% 60% at 60% 55%, rgba(217,164,71,0.45) 0%, rgba(153,85,28,0.25) 35%, rgba(12,19,36,0.95) 75%), linear-gradient(135deg, rgba(44,35,25,0.9) 0%, rgba(12,19,36,1) 100%)",
  },
  {
    id: "aston-db12",
    kicker: "GRAND TOURER",
    name: "Aston Martin DB12",
    stats: "V8 twin-turbo · 671 HP",
    span: 1,
    // imageSrc: "/cars/aston-db12.jpg",
    gradient:
      "radial-gradient(ellipse 80% 60% at 50% 55%, rgba(180,186,196,0.35) 0%, rgba(90,98,112,0.20) 40%, rgba(12,19,36,0.95) 75%), linear-gradient(135deg, rgba(30,36,50,0.9) 0%, rgba(12,19,36,1) 100%)",
  },
  {
    id: "ferrari-sf90",
    kicker: "HYPERCAR",
    name: "Ferrari SF90 Stradale",
    stats: "PHEV · 995 HP",
    span: 2,
    // imageSrc: "/cars/ferrari-sf90.jpg",
    gradient:
      "radial-gradient(ellipse 70% 60% at 55% 55%, rgba(59,130,246,0.45) 0%, rgba(79,70,229,0.25) 40%, rgba(12,19,36,0.95) 78%), linear-gradient(135deg, rgba(20,40,80,0.9) 0%, rgba(12,19,36,1) 100%)",
  },
];

/** Hero car background placeholder — layered gradients stand in for a real
 *  full-bleed hero photograph. Replace by setting `HERO_IMAGE_SRC` when a
 *  production-grade shot lands at /public/cars/hero.jpg (or similar). */
const HERO_IMAGE_SRC: string | null = null;
const HERO_GRADIENT =
  "radial-gradient(ellipse 75% 65% at 68% 55%, rgba(59, 130, 246, 0.50) 0%, rgba(79, 70, 229, 0.30) 35%, rgba(12, 19, 36, 0.95) 70%), linear-gradient(135deg, rgba(22, 34, 56, 0.95) 0%, rgba(12, 19, 36, 1) 100%)";

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";

  const [messages, setMessages] = useState<Record<string, Record<string, string>> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    import(`@/i18n/messages/${locale}.json`).then((m) => setMessages(m.default));
  }, [locale]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!messages) return null;
  const h = messages.home;

  const submitSearch = () => {
    // For now, any search opens the VehicleSelectionModal with the query
    // pre-filled. A dedicated `/search` results page can be added later.
    setModalOpen(true);
  };

  // Trending chips — curated static list that nudges users toward known
  // high-interest models. Swap for a backend trending feed when available.
  const TRENDING = ["911 GT3", "Vantage", "SF90"];

  return (
    <div
      className="transition-opacity duration-[400ms] ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* ─────────────────────────────────────────────────────────
          1. HERO — asymmetric editorial layout
             Left: text + search + trending chips
             Right: full-bleed car photography (placeholder for now)
         ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-canvas">
        {/* Car image layer — right-side full-bleed with falloff to canvas
            on the left so the text remains legible (doc §6 Do: use surface-dim
            overlays on images to ensure legibility). */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-y-0 right-0 w-full md:w-[68%] lg:w-[62%]"
            style={{
              backgroundImage: HERO_IMAGE_SRC ? `url(${HERO_IMAGE_SRC})` : HERO_GRADIENT,
              backgroundSize: "cover",
              backgroundPosition: "center right",
            }}
          />
          {/* Left-to-right canvas falloff — blends the car into the dark void */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(12,19,36,1) 0%, rgba(12,19,36,0.95) 30%, rgba(12,19,36,0.45) 55%, rgba(12,19,36,0.05) 80%, rgba(12,19,36,0) 100%)",
            }}
          />
          {/* Bottom fade for section-boundary tonal shift (no 1px divider) */}
          <div
            className="absolute inset-x-0 bottom-0 h-32"
            style={{
              background: "linear-gradient(180deg, transparent 0%, var(--color-surface) 100%)",
            }}
          />
        </div>

        {/* Content column — left aligned, max 560px, editorial breathing room */}
        <div className="relative mx-auto max-w-[1200px] px-6 min-h-[560px] md:min-h-[640px] flex items-center">
          <div className="w-full max-w-[580px] py-20 md:py-28">
            <h1 className="font-heading text-display-lg text-on-surface leading-[1.02] tracking-[-0.028em]">
              {h.hero_title_part1}
              <br />
              <span className="brand-gradient">{h.hero_title_part2}</span>
            </h1>

            <p className="font-sans text-[15px] md:text-[16px] text-on-surface-variant max-w-[480px] mt-6 leading-relaxed">
              {h.hero_subtitle}
            </p>

            {/* Inline search: pill container with search icon, input, and a
                primary gradient "Discover" button flush-right. Doc §5 Input
                spec uses a bottom-only ghost border for standalone fields;
                this composite uses a full ghost border because it frames the
                search-CTA as a single unit, more consistent with the mockup. */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="mt-10 flex items-center gap-2 rounded-full bg-surface-container-lowest/70 ghost-border pl-5 pr-2 py-2 max-w-[460px] backdrop-blur-[4px]"
            >
              <Search size={18} className="text-on-surface-variant shrink-0" strokeWidth={2} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={h.hero_search_placeholder}
                className="flex-1 h-9 bg-transparent outline-none font-sans text-[14px] font-medium text-on-surface placeholder:text-on-surface-variant/60"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                shape="pill"
                className="min-w-[104px]"
              >
                {h.hero_search_cta}
              </Button>
            </form>

            {/* Trending row — small uppercase label + purple-tinted pills */}
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <span className="superscript text-on-surface-variant/70">
                {h.hero_trending_label}
              </span>
              <div className="flex gap-2 flex-wrap">
                {TRENDING.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      setTimeout(submitSearch, 0);
                    }}
                    className="inline-flex items-center rounded-full px-3.5 py-1.5 font-sans text-[12px] font-semibold tracking-wide bg-primary/18 text-primary hover:bg-primary/28 transition duration-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          2. POPULAR MODELS — asymmetric 2+1 / 1+2 grid
             First row:  [Porsche (col-span-2)] [Aston (col-span-1)]
             Second row: [Compare (col-span-1)] [Ferrari (col-span-2)]
         ───────────────────────────────────────────────────────── */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
          {/* Section header — title on the left, "View All" link on the right */}
          <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
            <div>
              <h2 className="font-heading text-display-sm text-on-surface tracking-tight">
                {h.popular_title}
              </h2>
              <p className="font-sans text-[14px] text-on-surface-variant mt-2 max-w-[480px]">
                {h.popular_subtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/compare`}
              className="group inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold tracking-[0.14em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              {h.popular_view_all}
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Asymmetric grid — 3 columns on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-fr">
            {/* Row 1, tile 1 — Porsche (col-span-2) */}
            <ModelCard model={POPULAR_MODELS[0]} viewDetailsLabel={h.popular_view_details} />

            {/* Row 1, tile 2 — Aston (col-span-1) */}
            <ModelCard model={POPULAR_MODELS[1]} viewDetailsLabel={h.popular_view_details} />

            {/* Row 2, tile 1 — Compare Head-to-Head (text card, col-span-1) */}
            <CompareHeadToHeadCard
              title={h.compare_card_title}
              body={h.compare_card_body}
              cta={h.compare_card_cta}
              onClick={() => router.push(`/${locale}/compare`)}
            />

            {/* Row 2, tile 2 — Ferrari (col-span-2) */}
            <ModelCard model={POPULAR_MODELS[2]} viewDetailsLabel={h.popular_view_details} />
          </div>
        </div>
      </section>

      {/* Vehicle Selection Modal — triggered by hero search + trending chips */}
      <VehicleSelectionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setQuery("");
        }}
        locale={locale}
      />
    </div>
  );
}

/**
 * Showroom-style model card. Full-bleed hero image placeholder + overlay
 * with kicker, name, stats, and an ArrowUpRight "open" affordance in the
 * top-right corner. Hover lifts to surface-container-high + primary glow
 * via the `Card` primitive's showroom variant.
 */
function ModelCard({
  model,
  viewDetailsLabel,
}: {
  model: PopularModel;
  viewDetailsLabel: string;
}) {
  const spanCls = model.span === 2 ? "md:col-span-2" : "md:col-span-1";

  return (
    <Card
      variant="showroom"
      padding="none"
      className={`${spanCls} min-h-[220px] md:min-h-[260px] group`}
      aria-label={`${model.name} — ${viewDetailsLabel}`}
    >
      {/* Full-bleed image layer */}
      <div
        className="relative w-full h-full min-h-[220px] md:min-h-[260px]"
        style={{
          backgroundImage: model.imageSrc ? `url(${model.imageSrc})` : model.gradient,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Subtle light-bleed behind the car */}
        <div className="absolute inset-0 light-bleed" aria-hidden="true" />

        {/* Legibility wash — surface-dim overlay from bottom (doc §6 Do) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 40%, rgba(7,13,31,0.55) 70%, rgba(7,13,31,0.92) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Top-right open affordance — tertiary tertiary-energy indicator */}
        <button
          type="button"
          aria-label={viewDetailsLabel}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-lowest/40 text-on-surface-variant ghost-border opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ArrowUpRight size={16} strokeWidth={2} />
        </button>

        {/* Copy block — bottom-left asymmetric placement */}
        <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-1.5">
          <p className="superscript text-on-surface-variant/80">{model.kicker}</p>
          <h3 className="font-heading text-[20px] md:text-[22px] font-bold text-on-surface tracking-tight">
            {model.name}
          </h3>
          <p className="font-sans text-[12.5px] tabular text-on-surface-variant">
            {model.stats}
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Text-only "Compare Head-to-Head" card. Fills the asymmetric slot in
 * Popular Models where a 4th car image would otherwise sit. Acts as the
 * editorial callout that invites the user into the compare flow.
 */
function CompareHeadToHeadCard({
  title,
  body,
  cta,
  onClick,
}: {
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <Card
      variant="interactive"
      padding="lg"
      onClick={onClick}
      className="md:col-span-1 min-h-[220px] md:min-h-[260px] flex"
    >
      <div className="flex flex-col justify-between h-full w-full gap-6">
        <div>
          <h3 className="font-heading text-[20px] font-bold text-on-surface leading-tight tracking-tight">
            {title}
          </h3>
          <p className="mt-3 font-sans text-[13px] text-on-surface-variant leading-relaxed">
            {body}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {/* Monogram tiles — stand-ins for the cars currently staged in
              the compare flow. Replaces the mockup's P · A · F letters. */}
          <div className="flex items-center gap-1.5">
            {["P", "A", "F"].map((letter) => (
              <span
                key={letter}
                className="w-7 h-7 rounded-md bg-surface-container-highest flex items-center justify-center font-heading text-[11px] font-bold text-on-surface-variant"
                aria-hidden="true"
              >
                {letter}
              </span>
            ))}
          </div>

          <span className="inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-primary">
            <GitCompare size={14} strokeWidth={2} />
            {cta}
          </span>
        </div>
      </div>
    </Card>
  );
}
