"use client";

import type { RecommendationFormState } from "@/types/araba-iq-recommendation";
import type { SegmentItem } from "@/types/araba-iq-recommendation";
import type { ArabaIqRecommendationMessages } from "@/lib/araba-iq-messages";
import type { PresetApplyMeta } from "@/lib/recommendation-presets";
import { FEATURE_SLUGS } from "./feature-slugs";
import { PrioritySlider } from "./PrioritySlider";
import { RecommendationPresetBar } from "./RecommendationPresetBar";

interface Props {
  value: RecommendationFormState;
  onChange: (next: RecommendationFormState) => void;
  segments: SegmentItem[];
  segmentsLoading: boolean;
  t: ArabaIqRecommendationMessages;
  onPresetApply: (next: RecommendationFormState, meta: PresetApplyMeta) => void;
  disabled?: boolean;
}

function toggleSlug(list: string[], slug: string): string[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
}

function toggleSegment(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

function featureLabel(t: ArabaIqRecommendationMessages, slug: string): string {
  const map = t.featureLabels as Record<string, string>;
  return map[slug] ?? slug;
}

export function RecommendationForm({
  value: s,
  onChange,
  segments,
  segmentsLoading,
  t,
  onPresetApply,
  disabled,
}: Props) {
  const set = (patch: Partial<RecommendationFormState>) => onChange({ ...s, ...patch });

  return (
    <div className="space-y-8">
      <RecommendationPresetBar
        current={s}
        t={t}
        onApply={(next, meta) => onPresetApply(next, meta)}
        disabled={!!disabled}
      />

      <section className="rounded-2xl border border-[#B7C396]/40 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2d3a2a] mb-4">{t.formBasics}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-[#2d3a2a]/80">{t.budgetMax}</span>
            <input
              type="number"
              min={0}
              step={50000}
              value={s.budget_max || ""}
              disabled={disabled}
              onChange={(e) => set({ budget_max: Number(e.target.value) || 0 })}
              className="mt-1 w-full rounded-lg border border-[#B7C396]/50 px-3 py-2 text-[#2d3a2a] disabled:opacity-50"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[#2d3a2a]/80">{t.fuelPref}</span>
            <select
              value={s.fuel_preference}
              disabled={disabled}
              onChange={(e) => set({ fuel_preference: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#B7C396]/50 px-3 py-2 text-[#2d3a2a] disabled:opacity-50"
            >
              <option value="">{t.fuelAny}</option>
              <option value="Hybrid">{t.fuelHybrid}</option>
              <option value="Benzin">{t.fuelGasoline}</option>
              <option value="Dizel">{t.fuelDiesel}</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-[#2d3a2a]/80">{t.cityRatio}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={s.city_usage_ratio}
              disabled={disabled}
              onChange={(e) => set({ city_usage_ratio: Number(e.target.value) })}
              className="mt-2 w-full accent-[#5a7a52]"
            />
            <div className="text-xs font-mono text-[#5a7a52]">{s.city_usage_ratio}%</div>
          </label>
          <label className="block text-sm">
            <span className="text-[#2d3a2a]/80">{t.resultLimit}</span>
            <input
              type="number"
              min={1}
              max={50}
              value={s.limit}
              disabled={disabled}
              onChange={(e) => set({ limit: Math.min(50, Math.max(1, Number(e.target.value) || 10)) })}
              className="mt-1 w-full rounded-lg border border-[#B7C396]/50 px-3 py-2 disabled:opacity-50"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-[#B7C396]/40 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2d3a2a] mb-4">{t.priorities}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <PrioritySlider label={t.performance} value={s.performance_priority} onChange={(v) => set({ performance_priority: v })} disabled={disabled} />
          <PrioritySlider label={t.economy} value={s.economy_priority} onChange={(v) => set({ economy_priority: v })} disabled={disabled} />
          <PrioritySlider label={t.comfort} value={s.comfort_priority} onChange={(v) => set({ comfort_priority: v })} disabled={disabled} />
          <PrioritySlider label={t.family} value={s.family_priority} onChange={(v) => set({ family_priority: v })} disabled={disabled} />
          <PrioritySlider label={t.prestige} value={s.prestige_priority} onChange={(v) => set({ prestige_priority: v })} disabled={disabled} />
          <PrioritySlider label={t.resale} value={s.resale_priority} onChange={(v) => set({ resale_priority: v })} disabled={disabled} />
          <PrioritySlider label={t.maintenance} value={s.maintenance_sensitivity} onChange={(v) => set({ maintenance_sensitivity: v })} disabled={disabled} />
        </div>
      </section>

      <section className="rounded-2xl border border-[#B7C396]/40 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2d3a2a] mb-2">{t.segment}</h2>
        <p className="text-xs text-[#2d3a2a]/60 mb-3">{t.segmentHint}</p>
        {segmentsLoading ? (
          <p className="text-sm text-[#2d3a2a]/50">{t.segmentsLoading}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {segments.map((seg) => {
              const on = s.segment_ids.includes(seg.id);
              return (
                <button
                  key={seg.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => set({ segment_ids: toggleSegment(s.segment_ids, seg.id) })}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    on ? "bg-[#5a7a52] text-white" : "bg-[#E0E7D7] text-[#2d3a2a] hover:bg-[#d4ddc8]"
                  }`}
                >
                  {seg.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#B7C396]/40 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2d3a2a] mb-2">{t.equipment}</h2>
        <p className="text-xs text-[#2d3a2a]/60 mb-3">{t.equipmentHint}</p>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-[#2d3a2a] mb-2">{t.required}</h3>
          <div className="flex flex-wrap gap-2">
            {FEATURE_SLUGS.map((slug) => {
              const on = s.required_features.includes(slug);
              return (
                <button
                  key={`r-${slug}`}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    set({
                      required_features: toggleSlug(s.required_features, slug),
                      preferred_features: s.preferred_features.filter((x) => x !== slug),
                    })
                  }
                  className={`rounded-lg border px-2.5 py-1 text-xs disabled:opacity-50 ${
                    on ? "border-[#5a7a52] bg-[#5a7a52]/15 text-[#2d3a2a]" : "border-[#B7C396]/50 text-[#2d3a2a]/80"
                  }`}
                >
                  {featureLabel(t, slug)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#2d3a2a] mb-2">{t.preferredBonus}</h3>
          <div className="flex flex-wrap gap-2">
            {FEATURE_SLUGS.map((slug) => {
              if (s.required_features.includes(slug)) return null;
              const on = s.preferred_features.includes(slug);
              return (
                <button
                  key={`p-${slug}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => set({ preferred_features: toggleSlug(s.preferred_features, slug) })}
                  className={`rounded-lg border px-2.5 py-1 text-xs disabled:opacity-50 ${
                    on ? "border-amber-600/50 bg-amber-50 text-[#2d3a2a]" : "border-[#B7C396]/50 text-[#2d3a2a]/80"
                  }`}
                >
                  {featureLabel(t, slug)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#B7C396]/40 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2d3a2a] mb-4">{t.options}</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={s.strict_required}
            disabled={disabled}
            onChange={(e) => set({ strict_required: e.target.checked })}
            className="h-4 w-4 accent-[#5a7a52]"
          />
          <span className="text-sm text-[#2d3a2a]">{t.strictRequired}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer mt-3">
          <input
            type="checkbox"
            checked={s.include_debug}
            disabled={disabled}
            onChange={(e) => set({ include_debug: e.target.checked })}
            className="h-4 w-4 accent-[#5a7a52]"
          />
          <span className="text-sm text-[#2d3a2a]">{t.includeDebug}</span>
        </label>
      </section>
    </div>
  );
}
