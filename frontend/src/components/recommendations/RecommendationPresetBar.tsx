"use client";

import {
  Leaf,
  Users,
  Gem,
  ShieldCheck,
  Receipt,
  GraduationCap,
  Route,
  type LucideIcon,
} from "lucide-react";

import {
  RECOMMENDATION_PRESETS,
  applyPreset,
  summarizePresetDiff,
  presetCardTitle,
  presetCardDescription,
  type PresetApplyMeta,
  type PresetId,
  type RecommendationPreset,
} from "@/lib/recommendation-presets";
import type { RecommendationFormState } from "@/types/araba-iq-recommendation";
import type { ArabaIqRecommendationMessages } from "@/lib/araba-iq-messages";
import { cn } from "@/lib/utils";

interface Props {
  current: RecommendationFormState;
  t: ArabaIqRecommendationMessages;
  onApply: (next: RecommendationFormState, meta: PresetApplyMeta) => void;
  disabled?: boolean;
  /**
   * Optional preset that the caller considers "currently active" (e.g. the
   * last one applied). If provided, that card renders with a primary-tinted
   * ghost border + gradient accent stroke.
   */
  activeId?: PresetId | null;
}

/**
 * Preset scenario picker — the primary interaction on /recommendations.
 *
 * Renders each `RecommendationPreset` as an editorial "showroom" card:
 *   ┌─────────────────────────────────┐
 *   │  ICON                           │
 *   │                                 │
 *   │  Title (Jakarta 700 · 18)       │
 *   │  Description (Inter · 13)       │
 *   └─────────────────────────────────┘
 *
 * Styling follows the Midnight Showroom doc:
 *   • surface-container-low baseline (no 1px divider)
 *   • hover lifts to surface-container-high + primary ghost-glow
 *   • active state: primary @ 18% fill + primary ring
 *   • radius: MD3 xl (12px), matches the primary CTA grammar
 */

const PRESET_ICONS: Record<PresetId, LucideIcon> = {
  city_economy:   Leaf,
  family_suv:     Users,
  prestige:       Gem,
  low_maintenance: ShieldCheck,
  low_tax:        Receipt,
  first_car:      GraduationCap,
  long_distance:  Route,
};

export function RecommendationPresetBar({ current, t, onApply, disabled, activeId }: Props) {
  const apply = (preset: RecommendationPreset) => {
    const next = applyPreset(current, preset);
    const diff = summarizePresetDiff(current, next, preset, t);
    onApply(next, { preset, ...diff });
  };

  return (
    <div>
      <p className="superscript text-primary mb-3">{t.presetsTitle}</p>
      <h2 className="font-heading text-[22px] font-bold text-on-surface tracking-tight">
        {t.presetsHeading ?? "Senaryonu seç"}
      </h2>
      {t.presetsSubtitle && (
        <p className="font-sans text-[14px] text-on-surface-variant mt-2 max-w-[560px] leading-relaxed">
          {t.presetsSubtitle}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RECOMMENDATION_PRESETS.map((p) => {
          const Icon = PRESET_ICONS[p.id];
          const active = activeId === p.id;

          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => apply(p)}
              aria-pressed={active}
              className={cn(
                "group relative text-left rounded-lg p-5",
                "transition-all duration-300 ease-in-out",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                active
                  ? "bg-surface-container-high shadow-glow"
                  : "bg-surface-container-low hover:bg-surface-container-high hover:shadow-glow",
              )}
            >
              {/* Subtle light-bleed behind the active card for spotlight effect */}
              {active && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-lg light-bleed"
                />
              )}

              <div className="relative flex flex-col gap-4 min-h-[140px]">
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                    "transition-colors duration-300",
                    active
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container-high text-on-surface-variant group-hover:text-primary",
                  )}
                >
                  {Icon && <Icon size={20} strokeWidth={1.75} />}
                </div>

                <div>
                  <p
                    className={cn(
                      "font-heading text-[17px] font-bold tracking-tight mb-1.5",
                      active ? "text-primary" : "text-on-surface",
                    )}
                  >
                    {presetCardTitle(t, p.id)}
                  </p>
                  <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed">
                    {presetCardDescription(t, p.id)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
