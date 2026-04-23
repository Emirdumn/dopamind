"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Sparkles, X, GitCompare, ArrowRight } from "lucide-react";

import { postRecommendations, fetchSegments } from "@/lib/araba-iq-client";
import {
  defaultRecommendationFormState,
  formStateToRequestBody,
  type RecommendationFormState,
  type RecommendationResponse,
  type SegmentItem,
} from "@/types/araba-iq-recommendation";
import { RecommendationForm } from "@/components/recommendations/RecommendationForm";
import { RecommendationResultCard } from "@/components/recommendations/RecommendationResultCard";
import { RecommendationDebugPanel } from "@/components/recommendations/RecommendationDebugPanel";
import { RecommendationSkeleton } from "@/components/recommendations/RecommendationSkeleton";
import { useCompareCarsStore, MAX_COMPARE } from "@/stores/compare-cars";
import { getArabaIqMessages } from "@/lib/araba-iq-messages";
import { humanizeArabaIqError } from "@/lib/humanize-araba-iq-error";
import { interpolate } from "@/lib/interpolate";
import { presetCardTitle, type PresetApplyMeta, type PresetId } from "@/lib/recommendation-presets";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

/**
 * `/recommendations` — Midnight Showroom edition.
 *
 * Simplified product flow: a welcoming hero, a scenario picker, optional
 * segment refinement, and the result grid. All the low-level API knobs
 * (budget, fuel, priorities, features, limits, debug) are still populated
 * in form state from presets/defaults but are not exposed in the UI.
 */
export default function RecommendationsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const ai = getArabaIqMessages(locale);
  const t = ai.recommendations;

  const [form, setForm]                       = useState<RecommendationFormState>(defaultRecommendationFormState);
  const [segments, setSegments]               = useState<SegmentItem[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(true);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [data, setData]                       = useState<RecommendationResponse | null>(null);
  const [compareHint, setCompareHint]         = useState<string | null>(null);
  const [presetBanner, setPresetBanner]       = useState<(PresetApplyMeta & { label: string }) | null>(null);
  const [activePresetId, setActivePresetId]   = useState<PresetId | null>(null);

  const ids           = useCompareCarsStore((s) => s.ids);
  const toggleCompare = useCompareCarsStore((s) => s.toggle);
  const hasCompare    = useCompareCarsStore((s) => s.has);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const segs = await fetchSegments();
        if (!cancelled) setSegments(segs);
      } catch {
        if (!cancelled) setSegments([]);
      } finally {
        if (!cancelled) setSegmentsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const resetForm = useCallback(() => {
    setForm(defaultRecommendationFormState());
    setPresetBanner(null);
    setActivePresetId(null);
    setData(null);
    setError(null);
    setCompareHint(null);
  }, []);

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setCompareHint(null);
    try {
      const res = await postRecommendations(formStateToRequestBody(form));
      setData(res);
      // Smooth-scroll to results region on success
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "API error";
      setError(humanizeArabaIqError(raw, ai.errors));
    } finally {
      setLoading(false);
    }
  }, [form, ai.errors]);

  const onToggleCard = useCallback(
    (carId: number) => {
      setCompareHint(null);
      const r = toggleCompare(carId);
      if (!r.ok && r.message) setCompareHint(r.message);
    },
    [toggleCompare],
  );

  const onPresetApply = useCallback(
    (next: RecommendationFormState, meta: PresetApplyMeta) => {
      setForm(next);
      setActivePresetId(meta.preset.id as PresetId);
      const rec = getArabaIqMessages(locale).recommendations;
      setPresetBanner({ ...meta, label: presetCardTitle(rec, meta.preset.id) });
    },
    [locale],
  );

  const emptyRaiseBudget    = useCallback(() => setForm((f) => ({ ...f, budget_max: Math.round(f.budget_max * 1.25) })), []);
  const emptyStrictOff      = useCallback(() => setForm((f) => ({ ...f, strict_required: false })), []);
  const emptyReduceFeatures = useCallback(() => {
    setForm((f) => {
      if (f.required_features.length > 0)  return { ...f, required_features: f.required_features.slice(0, -1) };
      if (f.preferred_features.length > 0) return { ...f, preferred_features: f.preferred_features.slice(0, -1) };
      return f;
    });
  }, []);
  const emptyClearSegments = useCallback(() => setForm((f) => ({ ...f, segment_ids: [] })), []);

  const welcomeTitle =
    t.welcomeTitle ?? (locale === "tr" ? "Tercihini seç, doğru aracı önerelim." : "Pick a scenario, we'll match the right car.");
  const welcomeSubtitle =
    t.welcomeSubtitle ??
    (locale === "tr"
      ? "Uzun bir form yok. Bir senaryo seç, istersen segment ekle — gerisini veriye bırak."
      : "No long form. Pick a scenario, optionally filter by segment — we handle the rest.");

  return (
    <div className="bg-canvas min-h-screen">
      {/* ── Welcome hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-container-lowest">
        <div className="pointer-events-none absolute inset-0 light-bleed-strong" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
            <span className="superscript text-primary">{t.badge}</span>
          </div>
          <h1 className="font-heading text-display-md text-on-surface max-w-[720px]">
            {welcomeTitle}
          </h1>
          <p className="mt-4 font-sans text-[16px] md:text-[17px] text-on-surface-variant max-w-[620px] leading-relaxed">
            {welcomeSubtitle}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-16">
        {/* ── Sticky compare tray (only when ≥1 car selected) ── */}
        {ids.length > 0 && (
          <Card variant="floating" padding="none" className="sticky top-20 z-30 mb-10">
            <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="superscript text-on-surface-variant">{t.compareTray}</p>
                <p className="font-sans text-[13px] text-on-surface-variant mt-1">
                  {t.compareTraySubtitle}
                </p>
                <p className="font-heading text-[16px] font-bold text-primary mt-1 tabular">
                  {ids.length}/{MAX_COMPARE}
                </p>
              </div>
              <Link href={`/${locale}/compare`} className="shrink-0">
                <Button
                  variant={ids.length >= 2 ? "primary" : "secondary"}
                  size="md"
                  leadingIcon={<GitCompare size={16} />}
                  disabled={ids.length < 2}
                >
                  {ids.length >= 2
                    ? t.openCompareReady
                    : interpolate(t.openCompareProgress, { current: ids.length, max: MAX_COMPARE })}
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* ── Preset banner ── */}
        {presetBanner && (
          <Card variant="default" padding="none" className="mb-10">
            <div className="p-5 pr-12 relative">
              <button
                type="button"
                onClick={() => setPresetBanner(null)}
                aria-label={t.presetCloseBanner}
                className="absolute top-3 right-3 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition duration-300"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="superscript text-primary mb-2">{t.presetAppliedTitle}</p>
              <p className="font-heading text-[16px] font-semibold text-on-surface">
                {presetBanner.label}
              </p>
              <p className="mt-2 font-sans text-[13px] text-on-surface-variant">
                {presetBanner.budgetPreserved
                  ? interpolate(t.presetBudgetKept, {
                      amount: presetBanner.budgetAmount.toLocaleString(locale === "tr" ? "tr-TR" : "en-US"),
                    })
                  : t.presetBudgetChanged}
              </p>
            </div>
          </Card>
        )}

        {/* ── Form ── */}
        <RecommendationForm
          value={form}
          onChange={setForm}
          segments={segments}
          segmentsLoading={segmentsLoading}
          t={t}
          onPresetApply={onPresetApply}
          disabled={loading}
          activePresetId={activePresetId}
        />

        {/* ── Action row ── */}
        <div className="mt-12 flex flex-col sm:flex-row gap-3 items-start">
          <Button
            variant="primary"
            size="lg"
            shape="pill"
            onClick={submit}
            loading={loading}
            disabled={loading}
            trailingIcon={!loading ? <ArrowRight size={18} /> : undefined}
            className="min-w-[220px]"
          >
            {loading ? t.submitLoading : t.submit}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            shape="pill"
            onClick={resetForm}
            disabled={loading}
          >
            {t.resetForm}
          </Button>
        </div>

        {/* ── Results region ── */}
        <div id="results" className="mt-16 scroll-mt-24">
          {error && (
            <div className="mb-6 rounded-lg bg-error-container/30 p-5">
              <p className="font-sans text-[14px] font-medium text-error leading-relaxed">{error}</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <p className="font-sans text-[14px] text-on-surface-variant flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                {t.scoringWait}
              </p>
              <RecommendationSkeleton />
            </div>
          )}

          {!loading && data && (
            <>
              <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <p className="superscript text-primary mb-2">{t.badge}</p>
                  <h2 className="font-heading text-display-sm text-on-surface">
                    {t.resultsHeading ?? (locale === "tr" ? "Senin için öneriler" : "Your recommendations")}
                  </h2>
                  <p className="mt-2 font-sans text-[13px] tabular text-on-surface-variant">
                    {interpolate(t.statsLine, { total: data.total_candidates, returned: data.returned_count })}
                  </p>
                </div>
              </div>

              {/* Empty: no candidates */}
              {data.total_candidates === 0 && data.results.length === 0 && (
                <Card variant="default" padding="lg" className="mb-6">
                  <p className="font-heading text-[18px] font-semibold text-on-surface mb-2">
                    {t.emptyNoCandidatesTitle}
                  </p>
                  <p className="font-sans text-[14px] text-on-surface-variant leading-relaxed">
                    {t.emptyNoCandidatesBody}
                  </p>
                  <p className="superscript text-on-surface-variant mt-6 mb-3">
                    {t.emptyQuickActions}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: t.emptyActionRaiseBudget,    fn: emptyRaiseBudget },
                      { label: t.emptyActionStrictOff,      fn: emptyStrictOff },
                      { label: t.emptyActionReduceFeatures, fn: emptyReduceFeatures },
                      { label: t.emptyActionClearSegments,  fn: emptyClearSegments },
                    ].map(({ label, fn }) => (
                      <Button
                        key={label}
                        variant="secondary"
                        size="sm"
                        shape="rect"
                        onClick={fn}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Empty: candidates but nothing made the cut */}
              {data.results.length === 0 && data.total_candidates > 0 && (
                <Card variant="default" padding="md" className="mb-6">
                  <p className="font-heading text-[16px] font-semibold text-on-surface">
                    {t.emptyPartialTitle}
                  </p>
                  <p className="mt-1 font-sans text-[14px] text-on-surface-variant">
                    {t.emptyPartialBody}
                  </p>
                </Card>
              )}

              {compareHint && (
                <p className="mb-4 font-sans text-[13px] text-[var(--c-score-mid)]">
                  {compareHint}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
                {data.results.map((item) => (
                  <RecommendationResultCard
                    key={item.car_id}
                    item={item}
                    includeDebug={form.include_debug}
                    inCompare={hasCompare(item.car_id)}
                    onToggleCompare={() => onToggleCard(item.car_id)}
                    t={t}
                    locale={locale}
                  />
                ))}
              </div>

              {form.include_debug && data.excluded_candidates && data.excluded_candidates.length > 0 && (
                <div className="mt-6">
                  <RecommendationDebugPanel excluded={data.excluded_candidates} t={t} />
                </div>
              )}
            </>
          )}

          {/* Initial hint — dashed ghost panel */}
          {!loading && !data && !error && (
            <Card variant="default" padding="lg" className="text-center">
              <p className="font-sans text-[14px] text-on-surface-variant max-w-md mx-auto leading-relaxed">
                {t.initialHint}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
