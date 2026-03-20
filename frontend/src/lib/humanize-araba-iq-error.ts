import type { ArabaIqErrorMessages } from "./araba-iq-messages";

/**
 * Backend detail metnini kullanıcı diline yaklaştırır (tam eşleşme + kısmi).
 */
export function humanizeArabaIqError(raw: string, e: ArabaIqErrorMessages): string {
  const s = raw.trim();
  const lower = s.toLowerCase();

  if (!s) return e.generic;

  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("load failed")) {
    return e.network;
  }

  if (s.includes("car_ids 2–4") || s.includes("car_ids 2-4") || lower.includes("benzersiz araç")) {
    return e.compareCarCount;
  }

  if (s.includes("bulunamadı") || lower.includes("not found") || lower.includes("404")) {
    return e.notFound;
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return e.timeout;
  }

  if (lower.startsWith("http 5") || lower.includes("500") || lower.includes("502") || lower.includes("503")) {
    return e.server;
  }

  return s.length > 180 ? `${s.slice(0, 177)}…` : s;
}
