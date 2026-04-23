"use client";

import type { RecommendationItem } from "@/types/araba-iq-recommendation";
import type { ArabaIqRecommendationMessages } from "@/lib/araba-iq-messages";
import { formatTryPrice } from "@/lib/format-scores";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { GitCompare, Check } from "lucide-react";

interface Props {
  item: RecommendationItem;
  includeDebug: boolean;
  inCompare: boolean;
  onToggleCompare: () => void;
  t: ArabaIqRecommendationMessages;
  locale: string;
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[3px] rounded-[2px] bg-accent overflow-hidden">
        <div className="h-full rounded-[2px]" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="font-heading text-[10px] font-medium tabular text-muted w-5 text-right">{value}</span>
    </div>
  );
}

export function RecommendationResultCard({
  item,
  includeDebug,
  inCompare,
  onToggleCompare,
  t,
  locale,
}: Props) {
  return (
    <article
      className={`flex flex-col overflow-hidden transition-all duration-200 rounded-[2px] ${
        inCompare
          ? "bg-surface border-2 border-primary/40"
          : "bg-surface border border-accent hover:border-muted"
      }`}
    >
      <div
        className="h-[2px] w-full"
        style={{
          backgroundColor:
            item.overall_score >= 90 ? "var(--c-score-hi)"
            : item.overall_score >= 75 ? "var(--c-score-mid)"
            : "var(--c-score-lo)",
        }}
      />

      <div className="px-5 py-3.5 border-b border-accent bg-background">
        <p className="font-heading text-[11px] font-medium uppercase tracking-widest text-muted mb-1.5">
          {t.rankingLabel}
        </p>
        <p className="font-body text-[13px] text-foreground/70 leading-relaxed">{item.ranking_reason}</p>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-[16px] font-bold text-primary leading-snug pr-2">{item.car_name}</h3>
          <ScoreRing score={Math.round(item.overall_score)} size={52} />
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { label: t.cardFit,      value: Math.round(item.fit_score),           color: "var(--c-score-hi)" },
            { label: t.cardFeatures, value: Math.round(item.feature_match_score), color: "#3B82F6" },
            { label: t.cardMarket,   value: Math.round(item.market_score),         color: "var(--c-score-mid)" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="font-body text-[11px] text-muted w-16 shrink-0">{row.label}</span>
              <ScoreBar value={row.value} color={row.color} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="font-body text-[12px] border border-accent bg-background text-muted px-2.5 py-1 rounded-[2px]">
            {t.requiredMatches}: {item.matched_required_count}
          </span>
          <span className="font-body text-[12px] border border-accent bg-background text-muted px-2.5 py-1 rounded-[2px]">
            {t.preferredMatches}: {item.matched_preferred_count}
          </span>
        </div>

        <div className="border border-accent bg-background rounded-[2px] p-3">
          <p className="font-heading text-[11px] font-medium uppercase tracking-widest text-muted mb-1.5">
            {t.priceSummary}
          </p>
          {item.price_summary.avg_price != null ? (
            <p className="font-heading text-[14px] font-semibold text-foreground tabular">
              ~{formatTryPrice(item.price_summary.avg_price, locale)}
              <span className="text-muted ml-1.5 text-[12px] font-normal">n={item.price_summary.sample_size}</span>
            </p>
          ) : (
            <p className="font-body text-[14px] text-muted">{t.noAverage}</p>
          )}
          <p className="mt-1.5 font-body text-[12px] text-muted leading-relaxed">{item.price_summary.price_comment}</p>
        </div>

        {item.reasons.length > 0 && (
          <div>
            <p className="font-heading text-[11px] font-medium uppercase tracking-widest text-score-hi mb-2">{t.reasons}</p>
            <div className="flex flex-wrap gap-1.5">
              {item.reasons.map((r, i) => (
                <span key={i} className="border border-score-hi/20 bg-score-hi/5 px-2.5 py-1.5 font-body text-[12px] text-score-hi/80 leading-snug rounded-[2px]">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.cautions.length > 0 && (
          <div>
            <p className="font-heading text-[11px] font-medium uppercase tracking-widest text-score-mid mb-2">{t.cautions}</p>
            <div className="flex flex-wrap gap-1.5">
              {item.cautions.map((c, i) => (
                <span key={i} className="border border-score-mid/20 bg-score-mid/5 px-2.5 py-1.5 font-body text-[12px] text-score-mid/80 leading-snug rounded-[2px]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {includeDebug && item.candidate_filter_reason && (
          <p className="font-body text-[12px] text-muted border-t border-dashed border-accent pt-2">
            <span className="text-foreground">{t.debugNote}:</span> {item.candidate_filter_reason}
          </p>
        )}

        <button
          type="button"
          onClick={onToggleCompare}
          className={`mt-auto inline-flex items-center justify-center gap-2 px-4 py-3 font-heading text-[13px] font-semibold transition-all duration-200 rounded-[2px] ${
            inCompare
              ? "bg-primary text-background hover:bg-primary-dim"
              : "border border-accent text-muted hover:border-muted hover:text-foreground"
          }`}
        >
          {inCompare ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
          {inCompare ? t.inCompare : t.addCompare}
        </button>
      </div>
    </article>
  );
}
