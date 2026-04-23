import type { Metadata } from "next";
import {
  Search,
  Heart,
  ArrowRight,
  GitCompare,
  Share2,
  X,
  Star,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";

export const metadata: Metadata = {
  title: "Design System — Midnight Showroom",
  description: "Live showcase of the ArabaIQ design system primitives.",
};

/**
 * /tr/design-system — /en/design-system
 *
 * Not linked from primary navigation. A static, server-rendered showcase
 * of every primitive in the Midnight Showroom system so that design doc
 * compliance can be eyeballed in one place after changes to tokens,
 * utilities, or variants.
 */

function Section({
  title,
  kicker,
  description,
  children,
}: {
  title: string;
  kicker: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 md:py-20 border-none">
      <div className="mb-10">
        <p className="superscript text-primary mb-3">{kicker}</p>
        <h2 className="font-heading text-display-sm text-on-surface mb-3">{title}</h2>
        {description && (
          <p className="font-sans text-[15px] text-on-surface-variant max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function SpecRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="bg-canvas text-on-surface">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-container-lowest">
        <div className="pointer-events-none absolute inset-0 light-bleed-strong" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <p className="superscript text-primary mb-6">Design System · v1.0</p>
          <h1 className="font-heading text-display-lg text-on-surface mb-6">
            The Midnight <span className="brand-gradient">Showroom</span>
          </h1>
          <p className="font-sans text-[18px] text-on-surface-variant max-w-2xl leading-relaxed">
            A spotlight in a dark gallery. Tonal depth over dividers, editorial
            type over utility chrome, electric-indigo LED accents over generic
            blues. Every primitive on this page is production-ready.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" trailingIcon={<ArrowRight size={16} />}>
              Compare Cars
            </Button>
            <Button variant="secondary" size="lg">
              My Garage
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        {/* ── Colors ─────────────────────────────────────────────── */}
        <Section
          kicker="§2 Colors"
          title="Tonal Atmosphere"
          description="The surface ladder replaces 1px dividers. Boundaries between content areas are defined exclusively through background shifts."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg overflow-hidden bg-surface-container-lowest">
            {[
              { name: "surface-dim", hex: "#050914", cls: "bg-surface-dim" },
              { name: "surface-container-lowest", hex: "#070d1f", cls: "bg-surface-container-lowest" },
              { name: "surface", hex: "#0c1324", cls: "bg-canvas" },
              { name: "surface-container-low", hex: "#10182b", cls: "bg-surface-container-low" },
              { name: "surface-container", hex: "#161e32", cls: "bg-surface-container" },
              { name: "surface-container-high", hex: "#23293c", cls: "bg-surface-container-high" },
              { name: "surface-container-highest", hex: "#2e3447", cls: "bg-surface-container-highest" },
              { name: "surface-variant", hex: "#1f2539", cls: "bg-surface-variant" },
            ].map((s) => (
              <div key={s.name} className={`${s.cls} p-5 min-h-[110px] flex flex-col justify-end`}>
                <p className="font-sans text-[12px] font-semibold text-on-surface">{s.name}</p>
                <p className="font-sans text-[11px] tabular text-on-surface-variant">{s.hex}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "primary", hex: "#c0c1ff", cls: "bg-primary text-[#0c1324]" },
              { name: "primary-container", hex: "#8083ff", cls: "bg-primary-container text-white" },
              { name: "on-surface", hex: "#dce1fb", cls: "bg-on-surface text-[#0c1324]" },
              { name: "outline-variant", hex: "#434758", cls: "bg-[#434758] text-on-surface" },
            ].map((s) => (
              <div key={s.name} className={`${s.cls} rounded-lg p-5 min-h-[96px] flex flex-col justify-end`}>
                <p className="font-sans text-[12px] font-semibold">{s.name}</p>
                <p className="font-sans text-[11px] tabular opacity-80">{s.hex}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Typography ─────────────────────────────────────────── */}
        <Section
          kicker="§3 Typography"
          title="Editorial Authority"
          description="Plus Jakarta Sans for display, Inter for body. Extreme contrast in scale creates the magazine-style hierarchy."
        >
          <div className="space-y-8 bg-surface-container-low rounded-lg p-8">
            <div>
              <p className="superscript text-on-surface-variant mb-2">display-lg · Jakarta 700</p>
              <p className="font-heading text-display-lg text-on-surface">Choose Your Car Wisely</p>
            </div>
            <div>
              <p className="superscript text-on-surface-variant mb-2">display-md · Jakarta 700</p>
              <p className="font-heading text-display-md text-on-surface">BMW M3 Competition</p>
            </div>
            <div>
              <p className="superscript text-on-surface-variant mb-2">display-sm · Jakarta 600</p>
              <p className="font-heading text-display-sm text-on-surface">Tesla Model S Plaid</p>
            </div>
            <div>
              <p className="superscript text-on-surface-variant mb-2">body-md · Inter 500</p>
              <p className="font-sans text-[15px] text-on-surface max-w-xl leading-relaxed">
                Inter provides the technical spec feel. It is highly legible even at small sizes,
                ensuring that complex car data remains digestible.
              </p>
            </div>
            <div>
              <p className="superscript text-on-surface-variant mb-2">label-sm · Inter 600</p>
              <p className="font-sans text-[12px] font-semibold text-on-surface-variant">
                Starting ₺3,000 — 35,900 · n = 124 listings
              </p>
            </div>
            <div>
              <p className="superscript text-on-surface-variant mb-2">tabular numeric · Inter 700</p>
              <p className="font-heading text-[28px] font-bold tabular text-on-surface">
                0–100 km/h · 3.4 s
              </p>
            </div>
          </div>
        </Section>

        {/* ── Buttons ────────────────────────────────────────────── */}
        <Section
          kicker="§5 Buttons"
          title="Primary is the LED"
          description="Primary fires the indigo gradient. Secondary is a 20% ghost border that fills to 10% primary on hover. Tertiary is text-only and high-energy."
        >
          <div className="space-y-10">
            <SpecRow label="Variants — size md">
              <Button variant="primary">Compare Cars</Button>
              <Button variant="secondary">My Garage</Button>
              <Button variant="tertiary">Learn More</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="danger">Remove</Button>
            </SpecRow>

            <SpecRow label="Sizes — primary">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </SpecRow>

            <SpecRow label="With icons">
              <Button variant="primary" leadingIcon={<Search size={16} />}>Search</Button>
              <Button variant="primary" trailingIcon={<ArrowRight size={16} />}>Continue</Button>
              <Button variant="secondary" leadingIcon={<Heart size={16} />}>Save</Button>
              <Button variant="tertiary" trailingIcon={<ArrowRight size={14} />}>View Details</Button>
            </SpecRow>

            <SpecRow label="Icon circle">
              <Button variant="icon-circle" aria-label="Share"><Share2 size={16} /></Button>
              <Button variant="icon-circle" aria-label="Favorite"><Heart size={16} /></Button>
              <Button variant="icon-circle" aria-label="Close"><X size={16} /></Button>
            </SpecRow>

            <SpecRow label="States">
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="secondary" disabled>Disabled</Button>
            </SpecRow>

            <SpecRow label="Pill shape">
              <Button variant="primary" shape="pill" size="lg">Get Started</Button>
              <Button variant="secondary" shape="pill" size="lg">Explore</Button>
            </SpecRow>
          </div>
        </Section>

        {/* ── Cards ──────────────────────────────────────────────── */}
        <Section
          kicker="§5 Cards"
          title="The Showroom Card"
          description="No divider lines. surface-container-low baseline. 24px canonical gap. Hover lifts to surface-container-high with a primary ghost-glow."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="default">
              <p className="superscript text-on-surface-variant mb-2">variant: default</p>
              <h3 className="font-heading text-[20px] font-bold text-on-surface mb-2">Static Surface</h3>
              <p className="font-sans text-[14px] text-on-surface-variant leading-relaxed">
                Content panels that should not invite interaction. Summary stats, metadata rows,
                descriptive copy. No hover state.
              </p>
            </Card>

            <Card variant="interactive">
              <p className="superscript text-primary mb-2">variant: interactive · hover me</p>
              <h3 className="font-heading text-[20px] font-bold text-on-surface mb-2">Interactive Row</h3>
              <p className="font-sans text-[14px] text-on-surface-variant leading-relaxed">
                Clickable list-row geometry. Hover lifts the background to surface-container-high
                with a 1px primary ghost border and 32px LED bloom.
              </p>
            </Card>

            <Card variant="floating">
              <p className="superscript text-on-surface-variant mb-2">variant: floating</p>
              <h3 className="font-heading text-[20px] font-bold text-on-surface mb-2">Modal / Sticky Panel</h3>
              <p className="font-sans text-[14px] text-on-surface-variant leading-relaxed">
                Highest elevation. surface-container-high baseline plus the tinted 40–60px diffused
                ambient shadow. Never a default Material shadow.
              </p>
            </Card>

            <Card variant="showroom" lightBleed>
              <p className="superscript text-primary mb-2">variant: showroom · light-bleed</p>
              <h3 className="font-heading text-[20px] font-bold text-on-surface mb-2">Editorial Hero</h3>
              <p className="font-sans text-[14px] text-on-surface-variant leading-relaxed">
                Reserved for car-hero cards and Top Pick moments. Primary radial spotlight glows
                softly behind the content. Hover lifts with primary glow.
              </p>
            </Card>
          </div>

          {/* Full showroom example — mirrors the mockup tile */}
          <div className="mt-10">
            <p className="superscript text-on-surface-variant mb-4">composed example · showroom card</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Tesla Model S", price: "₺3,000 — 35,900", score: 94, hue: "from-sky-500/30 to-indigo-700/30" },
                { name: "Porsche 911",   price: "₺3,000 — 29,900", score: 88, hue: "from-zinc-400/30 to-zinc-700/30" },
                { name: "BMW M3",        price: "₺3,900 — 29,500", score: 82, hue: "from-blue-500/30 to-violet-700/30" },
              ].map((car) => (
                <Card key={car.name} variant="showroom" padding="none" lightBleed>
                  {/* Hero image placeholder — uses gradient to stand in for car photography */}
                  <div className={`relative h-44 bg-gradient-to-br ${car.hue} overflow-hidden`}>
                    <div className="absolute inset-0 light-bleed" aria-hidden="true" />
                    <div className="absolute top-4 left-4">
                      <Badge variant="brand" uppercase size="sm">
                        <Star size={10} className="mr-1" /> Top Pick
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <ScoreRing score={car.score} size={44} />
                    </div>
                  </div>
                  {/* Specs — 24px gap from image per doc §5 */}
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="font-heading text-[18px] font-bold text-on-surface mb-1">{car.name}</h3>
                      <p className="font-sans text-[13px] tabular text-on-surface-variant">
                        Starting {car.price}
                      </p>
                    </div>
                    <Button variant="secondary" size="md" className="w-full">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Inputs ─────────────────────────────────────────────── */}
        <Section
          kicker="§5 Inputs"
          title="Minimalist · Bottom-Only"
          description="No solid backgrounds. Bottom-only ghost border using outline-variant @ 22%. On focus, animates to 2px primary over 300ms."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-container-low rounded-lg p-8">
            <Input label="Default" placeholder="Enter model name…" />
            <Input label="With helper" placeholder="e.g. 2021" helperText="Any year between 1990 and 2026" />
            <Input
              label="Leading icon"
              placeholder="Search BMW, Tesla, Porsche…"
              leadingIcon={<Search size={16} />}
            />
            <Input
              label="Error state"
              placeholder="model"
              defaultValue="BNW M3"
              error="We couldn't find that model. Did you mean BMW M3?"
            />
            <Input label="Disabled" placeholder="Locked" disabled defaultValue="Tesla Model S" />
            <Input
              label="Focus me"
              placeholder="Tab into this input to see the primary focus animation"
            />
          </div>
        </Section>

        {/* ── Badges ─────────────────────────────────────────────── */}
        <Section
          kicker="§5 Chips"
          title="Action Chips"
          description="Full 9999px radius to contrast with the structured 12px cards. secondary-container fills carry the neutral default; semantic exceptions for score/success/warning."
        >
          <div className="space-y-10">
            <SpecRow label="Variants — size md">
              <Badge variant="neutral">Hybrid</Badge>
              <Badge variant="brand">Recommended</Badge>
              <Badge variant="info">Electric</Badge>
              <Badge variant="success">94 / 100</Badge>
              <Badge variant="warning">80 / 100</Badge>
              <Badge variant="danger">Out of Stock</Badge>
            </SpecRow>

            <SpecRow label="Uppercase status chips">
              <Badge variant="brand" uppercase size="sm">Top Pick</Badge>
              <Badge variant="success" uppercase size="sm">New</Badge>
              <Badge variant="info" uppercase size="sm">EV Pick</Badge>
              <Badge variant="warning" uppercase size="sm">Watch</Badge>
            </SpecRow>

            <SpecRow label="Size sm — inline tags">
              <Badge variant="neutral" size="sm">AWD</Badge>
              <Badge variant="neutral" size="sm">Panoramic Roof</Badge>
              <Badge variant="neutral" size="sm">Adaptive Cruise</Badge>
              <Badge variant="neutral" size="sm">360° Camera</Badge>
            </SpecRow>
          </div>
        </Section>

        {/* ── ScoreRing ──────────────────────────────────────────── */}
        <Section
          kicker="§7 Score"
          title="Traffic-Light Semantic Exception"
          description="The only place the system breaks the all-indigo accent rule. Green / amber / red are required for at-a-glance data legibility."
        >
          <div className="flex flex-wrap items-end gap-10 bg-surface-container-low rounded-lg p-10">
            {[
              { score: 96, label: "high (≥90)" },
              { score: 88, label: "amber (≥75)" },
              { score: 62, label: "low (<75)" },
            ].map((s) => (
              <div key={s.score} className="flex flex-col items-center gap-3">
                <ScoreRing score={s.score} size={96} />
                <p className="font-sans text-[12px] text-on-surface-variant">{s.label}</p>
              </div>
            ))}

            <div className="flex flex-col items-center gap-3 ml-auto">
              <p className="superscript text-on-surface-variant">size scale</p>
              <div className="flex items-end gap-4">
                <ScoreRing score={92} size={32} />
                <ScoreRing score={92} size={48} />
                <ScoreRing score={92} size={64} />
                <ScoreRing score={92} size={96} />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Interaction Utilities ──────────────────────────────── */}
        <Section
          kicker="§2 & §4"
          title="Glass, Glow & Ghost Border"
          description="Three signature utilities that replace heavy shadows and dividers: glass-nav (20px blur), shadow-glow (LED bloom), and ghost-border (20% outline, 10% primary hover fill)."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative rounded-lg p-8 min-h-[160px] bg-gradient-to-br from-primary/20 to-primary-container/30 overflow-hidden">
              <div className="glass-nav absolute inset-4 rounded-lg flex items-center justify-center">
                <p className="font-sans text-[13px] font-semibold text-on-surface">.glass-nav</p>
              </div>
            </div>
            <div className="rounded-lg bg-surface-container-low p-8 min-h-[160px] flex items-center justify-center shadow-glow">
              <p className="font-sans text-[13px] font-semibold text-on-surface">shadow-glow</p>
            </div>
            <button
              type="button"
              className="ghost-border rounded-lg p-8 min-h-[160px] flex items-center justify-center bg-transparent text-on-surface"
            >
              <p className="font-sans text-[13px] font-semibold">.ghost-border · hover me</p>
            </button>
          </div>
        </Section>

        {/* ── Inline Compose Example ─────────────────────────────── */}
        <Section
          kicker="composition"
          title="Everything together"
          description="How the primitives settle in one editorial row."
        >
          <Card variant="showroom" padding="none" lightBleed>
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
              <div className="relative h-64 md:h-auto bg-gradient-to-br from-indigo-600/30 via-violet-700/20 to-transparent overflow-hidden">
                <div className="absolute inset-0 light-bleed-strong" aria-hidden="true" />
                <div className="absolute top-5 left-5 flex gap-2">
                  <Badge variant="brand" uppercase size="sm"><Star size={10} className="mr-1" /> Top Pick</Badge>
                  <Badge variant="info" uppercase size="sm">EV</Badge>
                </div>
                <div className="absolute bottom-5 right-5">
                  <ScoreRing score={94} size={72} />
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <p className="superscript text-primary mb-2">2024 · electric · awd</p>
                  <h3 className="font-heading text-display-sm text-on-surface">Tesla Model S Plaid</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral" size="sm">Panoramic Roof</Badge>
                  <Badge variant="neutral" size="sm">Autopilot</Badge>
                  <Badge variant="neutral" size="sm">Air Suspension</Badge>
                </div>
                <p className="font-heading text-[24px] font-bold tabular text-on-surface">
                  ₺4,250,000 <span className="font-sans text-[13px] font-medium text-on-surface-variant ml-2">avg · n=47</span>
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" trailingIcon={<ArrowRight size={16} />}>View Details</Button>
                  <Button variant="secondary" leadingIcon={<GitCompare size={16} />}>Compare</Button>
                  <Button variant="icon-circle" aria-label="Save"><Heart size={16} /></Button>
                </div>
              </div>
            </div>
          </Card>
        </Section>

        <div className="pb-24" />
      </div>
    </div>
  );
}
