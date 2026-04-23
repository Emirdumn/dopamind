/**
 * otoapi-normalize.ts
 *
 * Pure transformation functions: raw OtoApi JSON → UI-ready types.
 * No HTTP calls here — only data shaping.
 */

import type {
  DropdownOption,
  GroupField,
  VehicleSummary,
  PriceAnalysis,
  MarketInsight,
  MarketStatus,
  SimilarAd,
  ComparisonFields,
  FilterState,
} from "@/types/otoapi";

/* ─── Utilities ─────────────────────────────────────────────────── */

/** Turkish-aware URL slug generator */
export function slugify(str: unknown): string {
  return String(str ?? "")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function str(v: unknown): string {
  return v != null ? String(v) : "";
}

/* ─── Dropdown normalizers ──────────────────────────────────────── */

type RawItem = Record<string, unknown>;

/**
 * Normalize one raw item from the OtoApi group response
 * into the canonical { label, value, count, slug } shape.
 *
 * Handles all known OtoApi field naming conventions
 * (brand_id/brand_name, serie_id/serie_name, etc.).
 */
export function normalizeDropdownOption(
  raw: RawItem,
  field: GroupField
): DropdownOption {
  const count = num(raw.count ?? raw.total_count ?? raw.ad_count) ?? undefined;

  switch (field) {
    case "year": {
      const y = num(raw.year ?? raw.value) ?? 0;
      return { label: String(y), value: y, count, slug: String(y) };
    }

    case "brands": {
      const id   = num(raw.brand_id ?? raw.id) ?? 0;
      const name = str(raw.brand_name ?? raw.name ?? raw.label);
      return { label: name, value: id, count, slug: slugify(name) };
    }

    case "series": {
      const id   = num(raw.serie_id ?? raw.series_id ?? raw.id) ?? 0;
      const name = str(raw.serie_name ?? raw.series_name ?? raw.name ?? raw.label);
      return { label: name, value: id, count, slug: slugify(name) };
    }

    case "transmission": {
      const val = str(raw.transmission ?? raw.name ?? raw.value ?? raw.label);
      return { label: val, value: val, count, slug: slugify(val) };
    }

    case "fuel_type": {
      const val = str(raw.fuel_type ?? raw.name ?? raw.value ?? raw.label);
      return { label: val, value: val, count, slug: slugify(val) };
    }

    case "models": {
      const id   = num(raw.model_id ?? raw.id) ?? 0;
      const name = str(raw.model_name ?? raw.name ?? raw.label);
      return { label: name, value: id, count, slug: slugify(name) };
    }

    case "variants": {
      const id   = num(raw.variant_id ?? raw.id) ?? 0;
      const name = str(raw.variant_name ?? raw.name ?? raw.label);
      return { label: name, value: id, count, slug: slugify(name) };
    }

    case "sub_variants": {
      const id   = num(raw.sub_variant_id ?? raw.id) ?? 0;
      const name = str(raw.sub_variant_name ?? raw.name ?? raw.label);
      return { label: name, value: id, count, slug: slugify(name) };
    }

    default:
      return { label: "", value: 0, count, slug: "" };
  }
}

/**
 * Extract the items array from the raw OtoApi group response.
 * OtoApi may nest under .data, .result, .items, or return the array directly.
 */
export function extractGroupItems(raw: unknown): RawItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as RawItem[];

  const obj = raw as RawItem;

  // Common OtoApi wrappers
  for (const key of ["data", "result", "items", "options", "list", "vehicles"]) {
    if (Array.isArray(obj[key])) return obj[key] as RawItem[];
  }

  return [];
}

/** Normalize a full group response into a UI-ready options array */
export function normalizeGroupOptions(
  raw: unknown,
  field: GroupField
): DropdownOption[] {
  const items = extractGroupItems(raw);
  return items.map((item) => normalizeDropdownOption(item, field));
}

/* ─── Vehicle summary ───────────────────────────────────────────── */

export function normalizeVehicleSummary(
  filters: FilterState,
  km: string,
  tramer: string
): VehicleSummary {
  return {
    year:         filters.year         ?? null,
    brand:        filters.brand_name   ?? null,
    series:       filters.serie_name   ?? null,
    model:        filters.model_name   ?? null,
    variant:      filters.variant_name ?? null,
    transmission: filters.transmission ?? null,
    fuel_type:    filters.fuel_type    ?? null,
    km,
    tramer,
  };
}

/* ─── Price analysis ────────────────────────────────────────────── */

export function normalizePriceAnalysis(raw: RawItem): PriceAnalysis {
  return {
    quick_sell_price:  num(raw.quick_sell_price  ?? raw.hizli_satis_fiyati  ?? raw.quick_price),
    retail_sell_price: num(raw.retail_sell_price ?? raw.perakende_satis_fiyati ?? raw.retail_price),
    tough_sell_price:  num(raw.tough_sell_price  ?? raw.zor_satis_fiyati    ?? raw.tough_price),
    average_price:     num(raw.average_price     ?? raw.ortalama_fiyat      ?? raw.avg_price),
    min_price:         num(raw.min_price         ?? raw.minimum_fiyat),
    max_price:         num(raw.max_price         ?? raw.maximum_fiyat),
    recommended_purchase_price_range: {
      min: num(
        raw.purchase_price_min ??
        raw.recommended_purchase_min ??
        raw.onerilen_alis_min
      ),
      max: num(
        raw.purchase_price_max ??
        raw.recommended_purchase_max ??
        raw.onerilen_alis_max
      ),
    },
  };
}

/* ─── Market insight ────────────────────────────────────────────── */

function deriveMarketStatus(totalAds: number): MarketStatus {
  if (totalAds >= 30) return "sufficient_data";
  if (totalAds >= 5)  return "limited_data";
  return "no_data";
}

export function normalizeMarketInsight(
  raw: RawItem,
  totalAds: number
): MarketInsight {
  const min = num(raw.min_price ?? raw.minimum_fiyat) ?? null;
  const max = num(raw.max_price ?? raw.maximum_fiyat) ?? null;
  const priceSpan = min != null && max != null ? max - min : null;

  return {
    total_ads:     totalAds,
    market_status: deriveMarketStatus(totalAds),
    price_span:    priceSpan,
  };
}

/* ─── Similar ads ───────────────────────────────────────────────── */

export function normalizeSimilarAd(raw: RawItem): SimilarAd {
  return {
    ad_no: str(raw.ad_no ?? raw.adNo ?? raw.ilan_no ?? raw.id),
    title: str(
      raw.title ?? raw.baslik ??
      `${raw.year ?? ""} ${raw.brand_name ?? ""} ${raw.serie_name ?? ""} ${raw.model_name ?? ""}`.trim()
    ),
    brand:        str(raw.brand_name  ?? raw.marka ?? raw.brand),
    series:       str(raw.serie_name  ?? raw.seri  ?? raw.series),
    model:        str(raw.model_name  ?? raw.model),
    year:         num(raw.year        ?? raw.yil),
    price:        num(raw.price       ?? raw.fiyat),
    kilometre:    num(raw.kilometre   ?? raw.km    ?? raw.kilometre_bilgisi),
    fuel_type:    str(raw.fuel_type   ?? raw.yakit_tipi),
    transmission: str(raw.transmission ?? raw.vites),
    city:         str(raw.city        ?? raw.sehir ?? raw.il),
  };
}

export function normalizeSimilarAds(rawList: unknown): SimilarAd[] {
  if (!Array.isArray(rawList)) return [];
  return (rawList as RawItem[]).map(normalizeSimilarAd);
}

/* ─── Comparison fields ─────────────────────────────────────────── */

export function buildComparisonFields(
  summary: VehicleSummary,
  prices: PriceAnalysis,
  market: MarketInsight
): ComparisonFields {
  return {
    year:              summary.year,
    brand:             summary.brand,
    series:            summary.series,
    model:             summary.model,
    transmission:      summary.transmission,
    fuel_type:         summary.fuel_type,
    km:                summary.km,
    tramer:            summary.tramer,
    quick_sell_price:  prices.quick_sell_price,
    retail_sell_price: prices.retail_sell_price,
    tough_sell_price:  prices.tough_sell_price,
    average_price:     prices.average_price,
    total_ads:         market.total_ads,
  };
}

/* ─── OtoApi error → status code ───────────────────────────────── */

export function classifyOtoapiError(
  status: number,
  body?: unknown
): { status: string; message: string } {
  if (status === 401 || status === 403) {
    return { status: "auth_error", message: "API anahtarı geçersiz veya eksik." };
  }
  if (status === 429) {
    return { status: "rate_limited", message: "İstek limiti aşıldı. Lütfen bekleyin." };
  }
  if (status >= 500) {
    return { status: "server_error", message: "OtoApi sunucu hatası." };
  }

  // Check for application-level no-data signals
  const obj = body as Record<string, unknown> | null;
  if (obj) {
    const hasData = obj.data != null || obj.result != null || obj.items != null;
    if (!hasData && (obj.status === false || obj.success === false)) {
      return { status: "no_data", message: "Yeterli veri bulunamadı." };
    }
  }

  return { status: "server_error", message: "Beklenmeyen bir hata oluştu." };
}
