/**
 * POST /api/otoapi/group
 *
 * Secure server-side proxy for OtoApi /vehicles/getVehicleByGroup.
 * The API key never leaves the server.
 *
 * Request body:
 *   { field: GroupField, filters: Record<string, unknown> }
 *
 * Response:
 *   OtoapiGroupResponse (normalized dropdown options)
 */
import { NextRequest, NextResponse } from "next/server";
import type { GroupField, OtoapiGroupResponse } from "@/types/otoapi";
import {
  normalizeGroupOptions,
  classifyOtoapiError,
} from "@/lib/otoapi-normalize";

const BASE_URL = process.env.OTOAPI_BASE_URL ?? "https://otoapi.com/api";
const ENDPOINT = `${BASE_URL}/vehicles/getVehicleByGroup`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.OTOAPI_KEY;
  if (!apiKey) {
    return NextResponse.json<OtoapiGroupResponse>(
      {
        status: "auth_error",
        message: "API anahtarı yapılandırılmamış.",
        field: "brands",
        options: [],
      },
      { status: 500 }
    );
  }

  let body: { field?: GroupField; filters?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<OtoapiGroupResponse>(
      {
        status: "server_error",
        message: "Geçersiz istek gövdesi.",
        field: "brands",
        options: [],
      },
      { status: 400 }
    );
  }

  const { field, filters = {} } = body;

  if (!field) {
    return NextResponse.json<OtoapiGroupResponse>(
      {
        status: "server_error",
        message: "'field' parametresi zorunludur.",
        field: "brands",
        options: [],
      },
      { status: 400 }
    );
  }

  /* ── Call OtoApi ── */
  let otoRes: Response;
  try {
    otoRes = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ field, filters }),
      // Next.js 14 — no edge-cache for API proxy calls
      cache: "no-store",
    });
  } catch (err) {
    console.error("[otoapi/group] Network error:", err);
    return NextResponse.json<OtoapiGroupResponse>(
      {
        status: "server_error",
        message: "OtoApi sunucusuna ulaşılamadı.",
        field,
        options: [],
      },
      { status: 502 }
    );
  }

  const rawBody = await otoRes.json().catch(() => null);

  /* ── Error handling ── */
  if (!otoRes.ok) {
    const { status, message } = classifyOtoapiError(otoRes.status, rawBody);
    return NextResponse.json<OtoapiGroupResponse>(
      { status: status as OtoapiGroupResponse["status"], message, field, options: [] },
      { status: otoRes.status }
    );
  }

  /* ── Normalize ── */
  const options = normalizeGroupOptions(rawBody, field);

  if (options.length === 0) {
    return NextResponse.json<OtoapiGroupResponse>({
      status: "empty_group",
      message: "Kriterlere uygun seçenek bulunamadı.",
      field,
      options: [],
    });
  }

  return NextResponse.json<OtoapiGroupResponse>({
    status: "success",
    message: "OK",
    field,
    options,
  });
}
