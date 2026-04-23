/**
 * European car segment catalog (A → M).
 *
 * Mirrors the EU Commission's passenger-car classification plus the two
 * common body-style segments (J = SUV, M = MPV) that backend and filter
 * UIs both need. Used as:
 *
 *   • a normalized reference when the backend returns a free-form
 *     `segment` string (e.g. "C-SUV", "Premium Sedan") — we map those into
 *     one of the canonical codes below;
 *   • a fallback list for segment filter chips when `/api/segments` hasn't
 *     responded yet (or when the backend DB is not yet seeded with every
 *     segment row).
 *
 * Keep the order stable — UI renders chips in this order.
 */

export type SegmentCode = "A" | "B" | "C" | "D" | "E" | "F" | "S" | "J" | "M";

export interface SegmentDefinition {
  code: SegmentCode;
  /** Canonical backend name we want to seed into `segments.name`. */
  backendName: string;
  /** Short display label in Turkish. */
  labelTr: string;
  /** Short display label in English. */
  labelEn: string;
  /** Long descriptor for tooltips / i18n. */
  descriptionTr: string;
  descriptionEn: string;
  /** Sample model hints surfaced in UI copy. */
  examples: string[];
}

export const SEGMENT_CATALOG: SegmentDefinition[] = [
  {
    code: "A",
    backendName: "A-Segment",
    labelTr: "A · Mini / Şehir",
    labelEn: "A · Mini / City",
    descriptionTr: "Küçük şehir araçları — park kolaylığı ve düşük işletme maliyeti.",
    descriptionEn: "Micro/city cars — ideal for dense urban use and low running costs.",
    examples: ["Fiat 500", "Hyundai i10", "Toyota Aygo X"],
  },
  {
    code: "B",
    backendName: "B-Segment",
    labelTr: "B · Küçük",
    labelEn: "B · Small",
    descriptionTr: "Supermini sınıfı — ekonomik fakat A'dan daha konforlu.",
    descriptionEn: "Supermini class — still economical but with more room than A.",
    examples: ["Ford Fiesta", "Renault Clio", "VW Polo"],
  },
  {
    code: "C",
    backendName: "C-Segment",
    labelTr: "C · Kompakt",
    labelEn: "C · Compact",
    descriptionTr: "Kompakt sınıf — günlük-uzun yol dengesi, Türkiye'nin en popüler dilimi.",
    descriptionEn: "Compact class — balanced daily/long-distance use, Turkey's most popular slice.",
    examples: ["VW Golf", "Ford Focus", "Toyota Corolla"],
  },
  {
    code: "D",
    backendName: "D-Segment",
    labelTr: "D · Orta",
    labelEn: "D · Mid-size",
    descriptionTr: "Orta sedan/hatchback — aile+iş hattı, premium markaların giriş seviyesi.",
    descriptionEn: "Mid-size sedan/hatchback — premium brands' entry tier.",
    examples: ["BMW 3 Serisi", "Audi A4", "Mercedes C-Serisi"],
  },
  {
    code: "E",
    backendName: "E-Segment",
    labelTr: "E · Executive",
    labelEn: "E · Executive",
    descriptionTr: "Üst orta sınıf — iş/prestij kullanım, geniş iç mekân.",
    descriptionEn: "Upper-mid executive — business/status use with spacious cabins.",
    examples: ["BMW 5 Serisi", "Audi A6", "Mercedes E-Serisi"],
  },
  {
    code: "F",
    backendName: "F-Segment",
    labelTr: "F · Lüks",
    labelEn: "F · Luxury",
    descriptionTr: "Full-size lüks — en yüksek konfor ve mühendislik derinliği.",
    descriptionEn: "Full-size luxury — top-tier comfort and engineering depth.",
    examples: ["BMW 7 Serisi", "Mercedes S-Serisi", "Audi A8"],
  },
  {
    code: "S",
    backendName: "S-Segment",
    labelTr: "S · Spor / Performans",
    labelEn: "S · Sports / Performance",
    descriptionTr: "Spor coupé & performans türevleri — sürüş odaklı.",
    descriptionEn: "Sports coupes & performance variants — driving-focused.",
    examples: ["Porsche 911", "BMW M4", "Aston Martin Vantage"],
  },
  {
    code: "J",
    backendName: "J-Segment",
    labelTr: "J · SUV / Crossover",
    labelEn: "J · SUV / Crossover",
    descriptionTr: "Spor arazi ve crossover — yüksek sürüş pozisyonu, çok amaçlı kullanım.",
    descriptionEn: "Sport utility & crossovers — elevated stance, multi-purpose use.",
    examples: ["Nissan Qashqai", "BMW X3", "Toyota RAV4"],
  },
  {
    code: "M",
    backendName: "M-Segment",
    labelTr: "M · MPV / Van",
    labelEn: "M · MPV / Van",
    descriptionTr: "Çok amaçlı araç — 7+ koltuk, yoğun aile/kargo kullanımı.",
    descriptionEn: "Multi-purpose vehicles — 7+ seats, family/cargo hauling.",
    examples: ["VW Touran", "Ford Tourneo", "Dacia Jogger"],
  },
];

/**
 * Normalize a free-form backend segment string ("C-SUV", "Premium Sedan",
 * "Compact", "suv", …) into one of the canonical segment codes. Returns
 * `null` when no heuristic match is found — callers should render the raw
 * string in that case.
 */
export function classifySegment(raw?: string | null): SegmentCode | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();

  // Direct code match: "A", "C-Segment", "Segment D", etc.
  const codeMatch = s.match(/\b([a-f]|s|j|m)(\b|-| *segment)/i);
  if (codeMatch) {
    const c = codeMatch[1].toUpperCase() as SegmentCode;
    if ((SEGMENT_CATALOG as ReadonlyArray<{ code: string }>).some((e) => e.code === c)) {
      return c;
    }
  }

  // Heuristic body-type / size matches
  if (s.includes("suv") || s.includes("crossover") || s.includes("arazi")) return "J";
  if (s.includes("mpv") || s.includes("van") || s.includes("minivan")) return "M";
  if (s.includes("luxury") || s.includes("lüks") || s.includes("luks")) return "F";
  if (s.includes("executive") || s.includes("üst orta")) return "E";
  if (s.includes("premium") && s.includes("sedan")) return "D";
  if (s.includes("mid") || s.includes("orta")) return "D";
  if (s.includes("compact") || s.includes("kompakt")) return "C";
  if (s.includes("small") || s.includes("supermini") || s.includes("küçük")) return "B";
  if (s.includes("mini") || s.includes("city") || s.includes("şehir")) return "A";
  if (s.includes("sport") || s.includes("spor") || s.includes("performance")) return "S";

  return null;
}

/** Short locale-aware label for a raw segment string (falls back to raw). */
export function segmentLabel(raw: string | null | undefined, locale: string): string {
  const code = classifySegment(raw);
  if (!code) return raw ?? "";
  const def = SEGMENT_CATALOG.find((s) => s.code === code);
  if (!def) return raw ?? "";
  return locale === "tr" ? def.labelTr : def.labelEn;
}
