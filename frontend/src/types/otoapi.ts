/**
 * OtoApi — Normalized types for the ArabaIQ frontend.
 *
 * Raw API responses are never passed to the UI.
 * Every shape here is the post-normalization contract between the
 * /api/otoapi/* proxy routes and the React components.
 */

/* ─── Status codes ─────────────────────────────────────────────── */

export type OtoapiStatus =
  | "success"
  | "no_data"
  | "empty_group"
  | "auth_error"
  | "rate_limited"
  | "server_error";

/* ─── Dropdown options ──────────────────────────────────────────── */

export interface DropdownOption {
  /** Human-readable label shown in the UI */
  label: string;
  /** Numeric or string ID used in subsequent filter calls */
  value: number | string;
  /** Total active listings that match this option */
  count?: number;
  /** URL-safe slug for deep links / analytics */
  slug: string;
}

/** All filter fields supported by /vehicles/getVehicleByGroup */
export type GroupField =
  | "year"
  | "brands"
  | "series"
  | "transmission"
  | "fuel_type"
  | "models"
  | "variants"
  | "sub_variants";

/* ─── Cascading filter state ────────────────────────────────────── */

/** The accumulated selections the user has made in the dropdowns */
export interface FilterState {
  year?:           number;
  brand_id?:       number;
  brand_name?:     string;
  serie_id?:       number;
  serie_name?:     string;
  transmission?:   string;
  fuel_type?:      string;
  model_id?:       number;
  model_name?:     string;
  variant_id?:     number;
  variant_name?:   string;
  sub_variant_id?: number;
  sub_variant_name?: string;
  km?:             string;
  tramer?:         string;
}

/* ─── Vehicle summary card ──────────────────────────────────────── */

export interface VehicleSummary {
  year:         number | null;
  brand:        string | null;
  series:       string | null;
  model:        string | null;
  variant:      string | null;
  transmission: string | null;
  fuel_type:    string | null;
  km:           string;
  tramer:       string;
}

/* ─── Price analysis card ───────────────────────────────────────── */

export interface PriceAnalysis {
  quick_sell_price:  number | null;
  retail_sell_price: number | null;
  tough_sell_price:  number | null;
  average_price:     number | null;
  min_price:         number | null;
  max_price:         number | null;
  recommended_purchase_price_range: {
    min: number | null;
    max: number | null;
  };
}

/* ─── Market insight block ──────────────────────────────────────── */

export type MarketStatus = "sufficient_data" | "limited_data" | "no_data";

export interface MarketInsight {
  total_ads:     number;
  market_status: MarketStatus;
  price_span:    number | null;
}

/* ─── Similar ads (listing cards) ──────────────────────────────── */

export interface SimilarAd {
  ad_no:        string;
  title:        string;
  brand:        string;
  series:       string;
  model:        string;
  year:         number | null;
  price:        number | null;
  kilometre:    number | null;
  fuel_type:    string;
  transmission: string;
  city:         string;
}

/* ─── Comparison-ready flat structure ───────────────────────────── */

export interface ComparisonFields {
  year:              number | null;
  brand:             string | null;
  series:            string | null;
  model:             string | null;
  transmission:      string | null;
  fuel_type:         string | null;
  km:                string;
  tramer:            string;
  quick_sell_price:  number | null;
  retail_sell_price: number | null;
  tough_sell_price:  number | null;
  average_price:     number | null;
  total_ads:         number;
}

/* ─── Full evaluate response (returned to frontend) ────────────── */

export interface OtoapiEvaluateResponse {
  status:            OtoapiStatus;
  message:           string;
  vehicle_summary:   VehicleSummary | null;
  price_analysis:    PriceAnalysis  | null;
  market_insight:    MarketInsight  | null;
  similar_ads:       SimilarAd[];
  comparison_fields: ComparisonFields | null;
}

/* ─── Group response (returned to frontend) ────────────────────── */

export interface OtoapiGroupResponse {
  status:  OtoapiStatus;
  message: string;
  field:   GroupField;
  options: DropdownOption[];
}

/* ─── Damage selection (panel condition) ───────────────────────── */

export type PanelCondition =
  | "Orijinal"
  | "Boyalı"
  | "Değişen"
  | "Lokal Boyalı"
  | "Çürük";

export interface DamageSelection {
  tavan:               PanelCondition;
  bagaj_kaputu:        PanelCondition;
  motor_kaputu:        PanelCondition;
  sag_arka_camurluk:   PanelCondition;
  sol_arka_camurluk:   PanelCondition;
  sag_arka_kapi:       PanelCondition;
  sol_arka_kapi:       PanelCondition;
  sag_on_kapi:         PanelCondition;
  sol_on_kapi:         PanelCondition;
  sag_on_camurluk:     PanelCondition;
  sol_on_camurluk:     PanelCondition;
}

/** Default — all panels original */
export const DEFAULT_DAMAGE: DamageSelection = {
  tavan:               "Orijinal",
  bagaj_kaputu:        "Orijinal",
  motor_kaputu:        "Orijinal",
  sag_arka_camurluk:   "Orijinal",
  sol_arka_camurluk:   "Orijinal",
  sag_arka_kapi:       "Orijinal",
  sol_arka_kapi:       "Orijinal",
  sag_on_kapi:         "Orijinal",
  sol_on_kapi:         "Orijinal",
  sag_on_camurluk:     "Orijinal",
  sol_on_camurluk:     "Orijinal",
};

/* ─── Evaluate request payload ──────────────────────────────────── */

export interface EvaluateFilters {
  year:            number[];
  brand_id:        number[];
  serie_id:        number[];
  transmission:    string[];
  fuel_type:       string[];
  model_id?:       number[];
  variant_id?:     number[];
  sub_variant_id?: number[];
  km:              string;
  tramer:          string;
  damageSelection: DamageSelection;
}

export interface EvaluateRequestPayload {
  filters: EvaluateFilters;
  order?:  string;
}
