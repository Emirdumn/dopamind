/**
 * POST /api/otoapi/evaluate
 *
 * Secure server-side proxy for OtoApi /vehicles/evaluate_vehicle.
 * Normalizes the raw response into UI-ready blocks.
 *
 * Request body: EvaluateRequestPayload (see types/otoapi.ts)
 *
 * Response: OtoapiEvaluateResponse
 */
import { NextRequest, NextResponse } from "next/server";
import type {
  EvaluateRequestPayload,
  OtoapiEvaluateResponse,
  FilterState,
} from "@/types/otoapi";
import {
  normalizePriceAnalysis,
  normalizeMarketInsight,
  normalizeSimilarAds,
  normalizeVehicleSummary,
  buildComparisonFields,
  classifyOtoapiError,
} from "@/lib/otoapi-normalize";

const BASE_URL = process.env.OTOAPI_BASE_URL ?? "https://otoapi.com/api";
const ENDPOINT = `${BASE_URL}/vehicles/evaluate_vehicle`;

const EMPTY_RESPONSE: OtoapiEvaluateResponse = {
  status:            "no_data",
  message:           "Yeterli veri bulunamadı.",
  vehicle_summary:   null,
  price_analysis:    null,
  market_insight:    null,
  similar_ads:       [],
  comparison_fields: null,
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.OTOAPI_KEY;
  if (!apiKey) {
    return NextResponse.json<OtoapiEvaluateResponse>(
      { ...EMPTY_RESPONSE, status: "auth_error", message: "API anahtarı yapılandırılmamış." },
      { status: 500 }
    );
  }

  let payload: EvaluateRequestPayload & { filterState?: FilterState };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json<OtoapiEvaluateResponse>(
      { ...EMPTY_RESPONSE, status: "server_error", message: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const { filterState, ...otoPayload } = payload;

  /* ── Call OtoApi ── */
  let otoRes: Response;
  try {
    otoRes = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(otoPayload),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[otoapi/evaluate] Network error:", err);
    return NextResponse.json<OtoapiEvaluateResponse>(
      { ...EMPTY_RESPONSE, status: "server_error", message: "OtoApi sunucusuna ulaşılamadı." },
      { status: 502 }
    );
  }

  const rawBody = await otoRes.json().catch(() => null);

  /* ── Error handling ── */
  if (!otoRes.ok) {
    const { status, message } = classifyOtoapiError(otoRes.status, rawBody);
    return NextResponse.json<OtoapiEvaluateResponse>(
      { ...EMPTY_RESPONSE, status: status as OtoapiEvaluateResponse["status"], message },
      { status: otoRes.status }
    );
  }

  /* ── Extract data from OtoApi response ── */
  // OtoApi may return the actual pricing data nested under .data or at root
  const data = (rawBody?.data ?? rawBody ?? {}) as Record<string, unknown>;

  // Check for empty/no-data response
  const isEmptyResult =
    data.status === false ||
    data.success === false ||
    (data.average_price == null && data.ortalama_fiyat == null);

  if (isEmptyResult) {
    return NextResponse.json<OtoapiEvaluateResponse>(EMPTY_RESPONSE);
  }

  /* ── Ads list ── */
  const rawAds =
    data.ads_list ??
    data.ilanlar  ??
    data.listings ??
    data.items    ??
    [];

  const totalAds =
    Number(
      data.total_count   ??
      data.total_ads     ??
      data.toplam_ilan   ??
      (Array.isArray(rawAds) ? rawAds.length : 0)
    ) || 0;

  /* ── Normalize each block ── */
  const prices  = normalizePriceAnalysis(data);
  const market  = normalizeMarketInsight(data, totalAds);
  const ads     = normalizeSimilarAds(rawAds);

  // Vehicle summary uses the filterState forwarded by the frontend client
  const summary = filterState
    ? normalizeVehicleSummary(
        filterState,
        payload.filters.km    ?? "",
        payload.filters.tramer ?? ""
      )
    : null;

  const comparison = summary
    ? buildComparisonFields(summary, prices, market)
    : null;

  return NextResponse.json<OtoapiEvaluateResponse>({
    status:            "success",
    message:           "Vehicle data fetched successfully.",
    vehicle_summary:   summary,
    price_analysis:    prices,
    market_insight:    market,
    similar_ads:       ads,
    comparison_fields: comparison,
  });
}
