"use client";

import type { ExcludedCandidate } from "@/types/araba-iq-recommendation";
import type { ArabaIqRecommendationMessages } from "@/lib/araba-iq-messages";

interface Props {
  excluded: ExcludedCandidate[];
  t: ArabaIqRecommendationMessages;
}

export function RecommendationDebugPanel({ excluded, t }: Props) {
  if (excluded.length === 0) return null;

  return (
    <section className="border border-dashed border-accent bg-surface rounded-[2px] p-4">
      <h3 className="font-heading text-[14px] font-semibold text-foreground mb-2">{t.debugExcludedTitle}</h3>
      <ul className="space-y-2">
        {excluded.map((e) => (
          <li key={e.car_id} className="bg-background rounded-[2px] p-2 border border-accent">
            <span className="font-heading text-[13px] font-semibold text-primary tabular">#{e.car_id}</span>{" "}
            <span className="font-body text-[13px] text-foreground">{e.car_name}</span>
            <p className="font-body text-[12px] text-muted mt-1">{e.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
