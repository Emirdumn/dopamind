/**
 * Hazır form senaryoları: yalnızca `id` + API’ye giden `patch`.
 * Kullanıcıya görünen başlık/açıklama ve diff satırı etiketleri → `arabaIq.recommendations`
 * (presetCards, presetFieldLabels, presetValue*, fuel*, featureLabels).
 *
 * Backend’in ürettiği metinler (ranking_reason, summary_comments, vb.) bilinçli olarak çevrilmiyor.
 * Yakıt ve donanım: API değeri sabit (örn. fuel_preference "Benzin"); select’te görünen metin i18n’de.
 *
 * UI/i18n notları: `docs/araba-iq-ui-i18n.md`
 */

import type { RecommendationFormState } from "@/types/araba-iq-recommendation";
import type { ArabaIqRecommendationMessages } from "@/lib/araba-iq-messages";

export type PresetId = "city_economy" | "family_suv" | "prestige" | "low_maintenance";

export interface RecommendationPreset {
  id: PresetId;
  patch: Partial<RecommendationFormState>;
}

/** Form alanlarını dolduran hazır senaryolar */
export const RECOMMENDATION_PRESETS: RecommendationPreset[] = [
  {
    id: "city_economy",
    patch: {
      fuel_preference: "Hybrid",
      city_usage_ratio: 85,
      economy_priority: 9,
      performance_priority: 4,
      comfort_priority: 6,
      family_priority: 5,
      prestige_priority: 3,
      resale_priority: 7,
      maintenance_sensitivity: 8,
      segment_ids: [],
      required_features: ["apple_carplay"],
      preferred_features: ["adaptive_cruise_control"],
      strict_required: false,
    },
  },
  {
    id: "family_suv",
    patch: {
      segment_ids: [1],
      family_priority: 9,
      comfort_priority: 7,
      economy_priority: 6,
      performance_priority: 5,
      prestige_priority: 4,
      resale_priority: 7,
      maintenance_sensitivity: 7,
      city_usage_ratio: 55,
      fuel_preference: "",
      required_features: ["adaptive_cruise_control", "blind_spot_warning"],
      preferred_features: ["sunroof", "rear_camera"],
      strict_required: true,
    },
  },
  {
    id: "prestige",
    patch: {
      prestige_priority: 9,
      performance_priority: 8,
      economy_priority: 4,
      family_priority: 4,
      comfort_priority: 8,
      resale_priority: 6,
      maintenance_sensitivity: 3,
      city_usage_ratio: 50,
      fuel_preference: "Benzin",
      segment_ids: [],
      required_features: [],
      preferred_features: ["head_up_display", "automatic_park_assistant"],
      strict_required: false,
    },
  },
  {
    id: "low_maintenance",
    patch: {
      maintenance_sensitivity: 9,
      economy_priority: 8,
      resale_priority: 8,
      prestige_priority: 3,
      performance_priority: 5,
      family_priority: 6,
      comfort_priority: 6,
      city_usage_ratio: 60,
      fuel_preference: "Hybrid",
      segment_ids: [],
      required_features: [],
      preferred_features: ["apple_carplay", "rear_camera"],
      strict_required: false,
    },
  },
];

export function presetCardTitle(t: ArabaIqRecommendationMessages, id: PresetId): string {
  const cards = t.presetCards as Record<PresetId, { title: string; description: string }>;
  return cards[id]?.title ?? id;
}

export function presetCardDescription(t: ArabaIqRecommendationMessages, id: PresetId): string {
  const cards = t.presetCards as Record<PresetId, { title: string; description: string }>;
  return cards[id]?.description ?? "";
}

export function applyPreset(base: RecommendationFormState, preset: RecommendationPreset): RecommendationFormState {
  return { ...base, ...preset.patch };
}

export interface PresetApplyMeta {
  preset: RecommendationPreset;
  lines: string[];
  budgetPreserved: boolean;
  budgetAmount: number;
}

function formatFuelValue(v: string, t: ArabaIqRecommendationMessages): string {
  if (v === "") return t.fuelAny;
  if (v === "Hybrid") return t.fuelHybrid;
  if (v === "Benzin") return t.fuelGasoline;
  if (v === "Dizel") return t.fuelDiesel;
  return v;
}

function formatFeatureList(slugs: string[], t: ArabaIqRecommendationMessages): string {
  if (!slugs.length) return t.presetValueEmpty;
  const map = t.featureLabels as Record<string, string>;
  return slugs.map((s) => map[s] ?? s).join(", ");
}

function fmtVal(k: keyof RecommendationFormState, v: RecommendationFormState[typeof k], t: ArabaIqRecommendationMessages): string {
  if (Array.isArray(v)) {
    if (!v.length) return t.presetValueEmpty;
    if (k === "required_features" || k === "preferred_features") {
      return formatFeatureList(v as string[], t);
    }
    return v.join(", ");
  }
  if (typeof v === "boolean") return v ? t.presetValueOn : t.presetValueOff;
  if (k === "fuel_preference" && typeof v === "string") return formatFuelValue(v, t);
  return String(v);
}

/** Preset sonrası kullanıcıya gösterilecek kısa diff (yalnızca değişen alanlar) */
export function summarizePresetDiff(
  before: RecommendationFormState,
  after: RecommendationFormState,
  preset: RecommendationPreset,
  t: ArabaIqRecommendationMessages,
): Omit<PresetApplyMeta, "preset"> {
  const labels = t.presetFieldLabels as Partial<Record<keyof RecommendationFormState, string>>;
  const lines: string[] = [];
  const keys = Object.keys(preset.patch) as (keyof RecommendationFormState)[];
  for (const k of keys) {
    const prev = before[k];
    const next = after[k];
    const same = JSON.stringify(prev) === JSON.stringify(next);
    if (same) continue;
    const label = labels[k] ?? String(k);
    lines.push(`${label}: ${fmtVal(k, prev, t)} → ${fmtVal(k, next, t)}`);
  }
  return {
    lines,
    budgetPreserved: before.budget_max === after.budget_max,
    budgetAmount: after.budget_max,
  };
}
