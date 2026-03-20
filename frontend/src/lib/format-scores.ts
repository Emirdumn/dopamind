/** Skor ve fiyat için tutarlı sayı gösterimi */

export function formatScore(value: number, locale: string = "tr-TR"): string {
  return Number.isFinite(value) ? value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—";
}

export function formatScoreCompact(value: number, locale: string = "tr-TR"): string {
  return Number.isFinite(value) ? value.toLocaleString(locale, { maximumFractionDigits: 1 }) : "—";
}

export function formatTryPrice(amount: number, locale: string): string {
  const loc = locale === "tr" ? "tr-TR" : "en-US";
  return amount.toLocaleString(loc) + " TL";
}

export function formatCellValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "✓" : "—";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "—";
  return String(v);
}
