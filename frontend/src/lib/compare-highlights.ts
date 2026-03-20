import type { CarCompareResponse } from "./araba-iq-client";

export interface CompareHighlight {
  areaKey: string;
  label: string;
  leaderCarId: number;
  leaderShortName: string;
  detail: string;
}

function shortName(c: CarCompareResponse["cars"][0]): string {
  return `${c.brand} ${c.model}`.trim();
}

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Hangi araç hangi metrikte önde — özet kartları + tablolara bağlam */
export function buildCompareHighlights(
  r: CarCompareResponse,
  labels: {
    fuel: string;
    luggage: string;
    priceLow: string;
    equipment: string;
  },
  locale: string,
): CompareHighlight[] {
  const loc = locale === "tr" ? "tr-TR" : "en-US";
  const out: CompareHighlight[] = [];
  const cars = r.cars;
  if (cars.length < 2) return out;

  const perf = r.performance_comparison;
  const cons = perf["ortalama_tüketim"];
  if (cons && typeof cons === "object") {
    let best: { id: number; v: number } | null = null;
    for (const c of cars) {
      const n = num(cons[String(c.car_variant_id)]);
      if (n !== null && (best === null || n < best.v)) best = { id: c.car_variant_id, v: n };
    }
    if (best) {
      const leader = cars.find((x) => x.car_variant_id === best!.id)!;
      out.push({
        areaKey: "fuel",
        label: labels.fuel,
        leaderCarId: best.id,
        leaderShortName: shortName(leader),
        detail: `${best.v.toLocaleString(loc, { maximumFractionDigits: 1 })} L/100km`,
      });
    }
  }

  const tech = r.technical_comparison;
  const bag = tech["bagaj_l"];
  if (bag && typeof bag === "object") {
    let best: { id: number; v: number } | null = null;
    for (const c of cars) {
      const n = num(bag[String(c.car_variant_id)]);
      if (n !== null && (best === null || n > best.v)) best = { id: c.car_variant_id, v: n };
    }
    if (best) {
      const leader = cars.find((x) => x.car_variant_id === best!.id)!;
      out.push({
        areaKey: "luggage",
        label: labels.luggage,
        leaderCarId: best.id,
        leaderShortName: shortName(leader),
        detail: `${best.v.toLocaleString(loc)} L`,
      });
    }
  }

  const mkt = r.market_comparison as Record<string, Record<string, unknown>>;
  const prices = mkt["ortalama_fiyat"];
  if (prices && typeof prices === "object") {
    let best: { id: number; v: number } | null = null;
    for (const c of cars) {
      const n = num(prices[String(c.car_variant_id)]);
      if (n !== null && n > 0 && (best === null || n < best.v)) best = { id: c.car_variant_id, v: n };
    }
    if (best) {
      const leader = cars.find((x) => x.car_variant_id === best!.id)!;
      out.push({
        areaKey: "price",
        label: labels.priceLow,
        leaderCarId: best.id,
        leaderShortName: shortName(leader),
        detail: `~${Math.round(best.v).toLocaleString(loc)} TL`,
      });
    }
  }

  const eq = r.equipment_comparison as {
    truthy_counts_by_variant_id?: Record<string, number>;
  };
  const counts = eq?.truthy_counts_by_variant_id;
  if (counts && typeof counts === "object") {
    let best: { id: number; v: number } | null = null;
    for (const c of cars) {
      const n = num(counts[String(c.car_variant_id)]);
      if (n !== null && (best === null || n > best.v)) best = { id: c.car_variant_id, v: n };
    }
    if (best) {
      const leader = cars.find((x) => x.car_variant_id === best!.id)!;
      out.push({
        areaKey: "equipment",
        label: labels.equipment,
        leaderCarId: best.id,
        leaderShortName: shortName(leader),
        detail: `${best.v}`,
      });
    }
  }

  return out;
}
