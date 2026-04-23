/**
 * otoapi-frontend-client.ts
 *
 * Browser-safe client — calls our own Next.js /api/otoapi/* routes.
 * Never contains the API key. Never calls otoapi.com directly.
 *
 * Usage:
 *   import { otoapi } from "@/lib/otoapi-frontend-client";
 *
 *   // Fetch brands for 2024
 *   const res = await otoapi.group("brands", { year: [2024] });
 *
 *   // Evaluate a vehicle
 *   const val = await otoapi.evaluate(payload, filterState);
 *
 *   // Fetch a single ad
 *   const ad  = await otoapi.fetchAd("12345678");
 */

import type {
  GroupField,
  OtoapiGroupResponse,
  OtoapiEvaluateResponse,
  EvaluateRequestPayload,
  FilterState,
  DamageSelection,
} from "@/types/otoapi";
import { DEFAULT_DAMAGE } from "@/types/otoapi";

export { DEFAULT_DAMAGE };

/* ─── Internal helper ───────────────────────────────────────────── */

async function apiFetch<T>(
  path: string,
  options: RequestInit
): Promise<T> {
  const res = await fetch(path, { ...options, cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new OtoapiError(
      body?.message ?? `HTTP ${res.status}`,
      body?.status  ?? "server_error",
      res.status
    );
  }
  return res.json() as Promise<T>;
}

export class OtoapiError extends Error {
  readonly code:       string;
  readonly httpStatus: number;

  constructor(message: string, code: string, httpStatus: number) {
    super(message);
    this.name       = "OtoapiError";
    this.code       = code;
    this.httpStatus = httpStatus;
  }
}

/* ─── Public API ────────────────────────────────────────────────── */

/**
 * Step 1–8: Fetch options for a single dropdown level.
 *
 * @param field   - Which dropdown to populate (year, brands, series, …)
 * @param filters - Accumulated selections from previous steps
 */
async function group(
  field: GroupField,
  filters: Record<string, unknown> = {}
): Promise<OtoapiGroupResponse> {
  return apiFetch<OtoapiGroupResponse>("/api/otoapi/group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, filters }),
  });
}

/**
 * Step 9: Run vehicle valuation.
 *
 * @param payload     - Full EvaluateRequestPayload (required fields must be populated)
 * @param filterState - Named selections from earlier steps used to build VehicleSummary
 */
async function evaluate(
  payload: EvaluateRequestPayload,
  filterState?: FilterState
): Promise<OtoapiEvaluateResponse> {
  return apiFetch<OtoapiEvaluateResponse>("/api/otoapi/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, filterState }),
  });
}

/**
 * Fetch a single ad by its OtoApi ad number.
 */
async function fetchAd(
  adNo: string
): Promise<{ status: string; message: string; ad: import("@/types/otoapi").SimilarAd | null }> {
  return apiFetch(`/api/otoapi/ad/${encodeURIComponent(adNo)}`, {
    method: "GET",
  });
}

/**
 * Convenience: run the full cascading selection workflow up to valuation.
 *
 * Builds the EvaluateRequestPayload from a fully-resolved FilterState.
 * All required fields must already be set in `filters`.
 *
 * @param filters        - Complete filter selections (must have year, brand_id, serie_id,
 *                         transmission, fuel_type, km, tramer)
 * @param damage         - Panel condition map (defaults to all "Orijinal")
 * @param order          - OtoApi sort order (default: "ad_date DESC")
 */
async function evaluateFromFilterState(
  filters: Required<
    Pick<FilterState, "year" | "brand_id" | "serie_id" | "transmission" | "fuel_type" | "km" | "tramer">
  > &
    Omit<FilterState, "brand_name" | "serie_name" | "model_name" | "variant_name" | "sub_variant_name"> &
    Pick<FilterState, "brand_name" | "serie_name" | "model_name" | "variant_name" | "sub_variant_name">,
  damage: DamageSelection = DEFAULT_DAMAGE,
  order = "ad_date DESC"
): Promise<OtoapiEvaluateResponse> {
  const payload: EvaluateRequestPayload = {
    filters: {
      year:         [filters.year],
      brand_id:     [filters.brand_id],
      serie_id:     [filters.serie_id],
      transmission: [filters.transmission],
      fuel_type:    [filters.fuel_type],
      ...(filters.model_id       ? { model_id:       [filters.model_id]       } : {}),
      ...(filters.variant_id     ? { variant_id:     [filters.variant_id]     } : {}),
      ...(filters.sub_variant_id ? { sub_variant_id: [filters.sub_variant_id] } : {}),
      km:              filters.km,
      tramer:          filters.tramer,
      damageSelection: damage,
    },
    order,
  };

  return evaluate(payload, filters);
}

/* ─── Named exports ─────────────────────────────────────────────── */

export const otoapi = {
  group,
  evaluate,
  fetchAd,
  evaluateFromFilterState,
} as const;
