"use client";

import {
  RECOMMENDATION_PRESETS,
  applyPreset,
  summarizePresetDiff,
  presetCardTitle,
  presetCardDescription,
  type PresetApplyMeta,
  type RecommendationPreset,
} from "@/lib/recommendation-presets";
import type { RecommendationFormState } from "@/types/araba-iq-recommendation";
import type { ArabaIqRecommendationMessages } from "@/lib/araba-iq-messages";

interface Props {
  current: RecommendationFormState;
  t: ArabaIqRecommendationMessages;
  onApply: (next: RecommendationFormState, meta: PresetApplyMeta) => void;
  disabled?: boolean;
}

export function RecommendationPresetBar({ current, t, onApply, disabled }: Props) {
  const apply = (preset: RecommendationPreset) => {
    const next = applyPreset(current, preset);
    const diff = summarizePresetDiff(current, next, preset, t);
    onApply(next, { preset, ...diff });
  };

  return (
    <div className="rounded-2xl border border-[#5a7a52]/30 bg-[#5a7a52]/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#5a7a52] mb-2">{t.presetsTitle}</p>
      <div className="flex flex-wrap gap-2">
        {RECOMMENDATION_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            title={presetCardDescription(t, p.id)}
            onClick={() => apply(p)}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#2d3a2a] shadow-sm border border-[#B7C396]/40 hover:border-[#5a7a52] hover:bg-[#E0E7D7]/50 transition-colors disabled:opacity-50"
          >
            {presetCardTitle(t, p.id)}
          </button>
        ))}
      </div>
    </div>
  );
}
