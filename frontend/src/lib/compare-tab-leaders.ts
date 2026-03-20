import type { CarCompareResponse } from "./araba-iq-client";
import type { ArabaIqCompareMessages } from "./araba-iq-messages";
import { interpolate } from "./interpolate";

export interface TabLeaderResult {
  leaderCarId: number;
  leaderShortName: string;
  headline: string;
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

/** Teknik: sayısal satırlarda gruptan ortalamaya en yakın (düşük normalize sapma) = dengeli */
export function technicalBalancedLeader(r: CarCompareResponse, t: ArabaIqCompareMessages): TabLeaderResult | null {
  const cars = r.cars;
  if (cars.length < 2) return null;
  const tech = r.technical_comparison as Record<string, Record<string, unknown>>;
  const keys = Object.keys(tech);
  const usable: string[] = [];
  for (const k of keys) {
    const row = tech[k];
    const nums = cars.map((c) => num(row[String(c.car_variant_id)])).filter((x): x is number => x !== null);
    if (nums.length === cars.length && nums.length >= 2) usable.push(k);
  }
  if (usable.length === 0) return null;

  let bestId = cars[0].car_variant_id;
  let bestScore = Infinity;
  for (const c of cars) {
    let sum = 0;
    for (const k of usable) {
      const row = tech[k];
      const vals = cars.map((x) => num(row[String(x.car_variant_id)])!);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const denom = Math.abs(avg) < 1e-6 ? 1 : avg * avg;
      const v = num(row[String(c.car_variant_id)])!;
      sum += ((v - avg) * (v - avg)) / denom;
    }
    if (sum < bestScore) {
      bestScore = sum;
      bestId = c.car_variant_id;
    }
  }
  const leader = cars.find((x) => x.car_variant_id === bestId)!;
  return {
    leaderCarId: bestId,
    leaderShortName: shortName(leader),
    headline: t.tabLeaderTechnicalHeadline,
    detail: interpolate(t.tabLeaderTechnicalDetail, { fields: usable.length }),
  };
}

/** Performans: en yüksek beygir */
export function performancePowerLeader(r: CarCompareResponse, t: ArabaIqCompareMessages, locale: string): TabLeaderResult | null {
  const cars = r.cars;
  const perf = r.performance_comparison as Record<string, Record<string, unknown>>;
  const hp = perf["beygir"];
  if (!hp || typeof hp !== "object") return null;
  let best: { id: number; v: number } | null = null;
  for (const c of cars) {
    const n = num(hp[String(c.car_variant_id)]);
    if (n !== null && (best === null || n > best.v)) best = { id: c.car_variant_id, v: n };
  }
  if (!best) return null;
  const leader = cars.find((x) => x.car_variant_id === best.id)!;
  const loc = locale === "tr" ? "tr-TR" : "en-US";
  return {
    leaderCarId: best.id,
    leaderShortName: shortName(leader),
    headline: t.tabLeaderPerformanceHeadline,
    detail: interpolate(t.tabLeaderPerformanceDetail, { hp: best.v.toLocaleString(loc) }),
  };
}

/** Piyasa: en düşük ortalama fiyat */
export function marketPriceLeader(r: CarCompareResponse, t: ArabaIqCompareMessages, locale: string): TabLeaderResult | null {
  const cars = r.cars;
  const mkt = r.market_comparison as Record<string, Record<string, unknown>>;
  const prices = mkt["ortalama_fiyat"];
  if (!prices || typeof prices !== "object") return null;
  let best: { id: number; v: number } | null = null;
  for (const c of cars) {
    const n = num(prices[String(c.car_variant_id)]);
    if (n !== null && n > 0 && (best === null || n < best.v)) best = { id: c.car_variant_id, v: n };
  }
  if (!best) return null;
  const leader = cars.find((x) => x.car_variant_id === best.id)!;
  const loc = locale === "tr" ? "tr-TR" : "en-US";
  return {
    leaderCarId: best.id,
    leaderShortName: shortName(leader),
    headline: t.tabLeaderMarketHeadline,
    detail: interpolate(t.tabLeaderMarketDetail, { price: Math.round(best.v).toLocaleString(loc) }),
  };
}

/** Donanım: en yüksek evet sayısı */
export function equipmentRichLeader(r: CarCompareResponse, t: ArabaIqCompareMessages, locale: string): TabLeaderResult | null {
  const cars = r.cars;
  const eq = r.equipment_comparison as { truthy_counts_by_variant_id?: Record<string, number> };
  const counts = eq?.truthy_counts_by_variant_id;
  if (!counts) return null;
  let best: { id: number; v: number } | null = null;
  for (const c of cars) {
    const n = num(counts[String(c.car_variant_id)]);
    if (n !== null && (best === null || n > best.v)) best = { id: c.car_variant_id, v: n };
  }
  if (!best) return null;
  const leader = cars.find((x) => x.car_variant_id === best.id)!;
  const loc = locale === "tr" ? "tr-TR" : "en-US";
  return {
    leaderCarId: best.id,
    leaderShortName: shortName(leader),
    headline: t.tabLeaderEquipmentHeadline,
    detail: interpolate(t.tabLeaderEquipmentDetail, { count: best.v.toLocaleString(loc) }),
  };
}
