"use client";

import type {
  RecommendationFormState,
  SegmentItem,
} from "@/types/araba-iq-recommendation";
import type { ArabaIqRecommendationMessages } from "@/lib/araba-iq-messages";
import type { PresetApplyMeta, PresetId } from "@/lib/recommendation-presets";
import { RecommendationPresetBar } from "./RecommendationPresetBar";
import {
  SEGMENT_CATALOG,
  classifySegment,
  type SegmentCode,
} from "@/lib/segment-catalog";
import { cn } from "@/lib/utils";

/**
 * `/recommendations` form — simplified per product direction:
 *
 * The previous incarnation surfaced every low-level API knob (upper budget,
 * fuel preference, city-usage ratio, 7 priority sliders, required/preferred
 * feature checkboxes, strict_required, result limit, debug toggle). That
 * overwhelmed first-time users and the priorities were barely discriminating.
 *
 * The new form is intentionally minimal:
 *
 *   ┌────────────────────────────────────────┐
 *   │ 1. Senaryo seçimi (preset grid)        │ ← primary choice
 *   ├────────────────────────────────────────┤
 *   │ 2. Segment filtresi (chip toggles)     │ ← optional refinement
 *   └────────────────────────────────────────┘
 *
 * All removed fields (budget_max, fuel_preference, priorities, features,
 * strict_required, limit, include_debug) remain in the form state and are
 * populated either by the chosen preset or by `defaultRecommendationFormState`.
 * This keeps the `POST /recommendations` request body intact without
 * exposing the knobs in the UI.
 *
 * Styling follows the Midnight Showroom design doc: no 1px dividers,
 * surface-ladder shifts define block boundaries, ghost-border on chips
 * instead of framed checkboxes.
 */

interface Props {
  value: RecommendationFormState;
  onChange: (next: RecommendationFormState) => void;
  segments: SegmentItem[];
  segmentsLoading: boolean;
  t: ArabaIqRecommendationMessages;
  onPresetApply: (next: RecommendationFormState, meta: PresetApplyMeta) => void;
  disabled?: boolean;
  /** Last applied preset — used to highlight the active card. */
  activePresetId?: PresetId | null;
}

function toggleSegment(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

/**
 * Order backend segments by the canonical European A→M order. Backend may
 * return them by insertion order or alphabetical — we always want them in
 * the same slot so returning visitors can rely on muscle memory.
 *
 * When a backend row doesn't map to a canonical code (legacy name like
 * "Premium Sedan" or "C-SUV"), it's pushed to the tail, still alphabetical.
 */
const SEGMENT_CODE_ORDER: SegmentCode[] = SEGMENT_CATALOG.map((s) => s.code);
function sortSegmentsCanonical(segments: SegmentItem[]): SegmentItem[] {
  const withOrder = segments.map((seg) => {
    const code = classifySegment(seg.name);
    const idx = code ? SEGMENT_CODE_ORDER.indexOf(code) : -1;
    return { seg, idx: idx === -1 ? 99 + seg.name.charCodeAt(0) : idx };
  });
  withOrder.sort((a, b) => a.idx - b.idx);
  return withOrder.map((x) => x.seg);
}

export function RecommendationForm({
  value: s,
  onChange,
  segments,
  segmentsLoading,
  t,
  onPresetApply,
  disabled,
  activePresetId,
}: Props) {
  const set = (patch: Partial<RecommendationFormState>) => onChange({ ...s, ...patch });

  return (
    <div className="space-y-12">
      {/* ── 1. Preset picker ─────────────────────────────────────── */}
      <RecommendationPresetBar
        current={s}
        t={t}
        onApply={onPresetApply}
        disabled={disabled}
        activeId={activePresetId}
      />

      {/* ── 2. Segment filter ────────────────────────────────────── */}
      <section>
        <p className="superscript text-primary mb-3">{t.segment}</p>
        <h2 className="font-heading text-[22px] font-bold text-on-surface tracking-tight">
          {t.segmentHeading ?? "Segment filtresi"}
        </h2>
        <p className="font-sans text-[14px] text-on-surface-variant mt-2 max-w-[560px] leading-relaxed">
          {t.segmentHint}
        </p>

        {segmentsLoading ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-20 rounded-full animate-shimmer"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #1f2539 25%, #2e3447 50%, #1f2539 75%)",
                  backgroundSize: "200% 100%",
                }}
              />
            ))}
          </div>
        ) : segments.length === 0 ? (
          <p className="mt-4 font-sans text-[13px] text-on-surface-variant/70">
            {t.segmentsLoading}
          </p>
        ) : (
          <div className="mt-6 flex flex-wrap gap-2">
            {sortSegmentsCanonical(segments).map((seg) => {
              const on = s.segment_ids.includes(seg.id);
              return (
                <button
                  key={seg.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => set({ segment_ids: toggleSegment(s.segment_ids, seg.id) })}
                  aria-pressed={on}
                  className={cn(
                    "inline-flex items-center rounded-full font-sans font-semibold leading-none",
                    "text-[13px] px-4 py-2",
                    "transition-all duration-300 ease-in-out",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    on
                      ? "bg-primary/18 text-primary shadow-glow"
                      : "ghost-border text-on-surface-variant hover:text-primary",
                  )}
                >
                  {seg.name}
                </button>
              );
            })}
          </div>
        )}

        {s.segment_ids.length > 0 && (
          <p className="mt-4 font-sans text-[12px] text-on-surface-variant/80">
            <span className="font-semibold text-on-surface">{s.segment_ids.length}</span>{" "}
            {t.segmentSelected ?? "segment seçildi"}
            {" · "}
            <button
              type="button"
              onClick={() => set({ segment_ids: [] })}
              className="text-primary hover:underline"
            >
              {t.segmentClear ?? "Temizle"}
            </button>
          </p>
        )}
      </section>
    </div>
  );
}
