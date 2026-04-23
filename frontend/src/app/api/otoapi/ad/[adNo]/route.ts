/**
 * GET /api/otoapi/ad/[adNo]
 *
 * Secure proxy for OtoApi GET /vehicles/get_vehicle/{adNo}.
 * Returns a normalized SimilarAd record.
 */
import { NextRequest, NextResponse } from "next/server";
import type { SimilarAd, OtoapiStatus } from "@/types/otoapi";
import { normalizeSimilarAd, classifyOtoapiError } from "@/lib/otoapi-normalize";

const BASE_URL = process.env.OTOAPI_BASE_URL ?? "https://otoapi.com/api";

interface AdResponse {
  status:  OtoapiStatus;
  message: string;
  ad:      SimilarAd | null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { adNo: string } }
): Promise<NextResponse> {
  const apiKey = process.env.OTOAPI_KEY;
  if (!apiKey) {
    return NextResponse.json<AdResponse>(
      { status: "auth_error", message: "API anahtarı yapılandırılmamış.", ad: null },
      { status: 500 }
    );
  }

  const { adNo } = params;
  if (!adNo) {
    return NextResponse.json<AdResponse>(
      { status: "server_error", message: "İlan numarası eksik.", ad: null },
      { status: 400 }
    );
  }

  /* ── Call OtoApi ── */
  let otoRes: Response;
  try {
    otoRes = await fetch(`${BASE_URL}/vehicles/get_vehicle/${encodeURIComponent(adNo)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[otoapi/ad/${adNo}] Network error:`, err);
    return NextResponse.json<AdResponse>(
      { status: "server_error", message: "OtoApi sunucusuna ulaşılamadı.", ad: null },
      { status: 502 }
    );
  }

  const rawBody = await otoRes.json().catch(() => null);

  if (!otoRes.ok) {
    const { status, message } = classifyOtoapiError(otoRes.status, rawBody);
    return NextResponse.json<AdResponse>(
      { status: status as OtoapiStatus, message, ad: null },
      { status: otoRes.status }
    );
  }

  const data = rawBody?.data ?? rawBody;
  if (!data || data.status === false) {
    return NextResponse.json<AdResponse>({
      status:  "no_data",
      message: "İlan bulunamadı.",
      ad:      null,
    });
  }

  return NextResponse.json<AdResponse>({
    status:  "success",
    message: "OK",
    ad:      normalizeSimilarAd(data as Record<string, unknown>),
  });
}
