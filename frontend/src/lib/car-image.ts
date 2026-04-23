/**
 * Car image resolution — single source of truth for hero photography.
 *
 * We keep real PNG/JPEGs under `/public/cars/` with slugified file names
 * (`{brand}-{model}.jpg` lowercased, spaces→dashes, ASCII only). Until the
 * editorial asset drop lands, every slot falls back to a brand-tinted
 * gradient that mimics the Midnight Showroom "spotlight on a dark stage"
 * aesthetic (doc §4 "Light Bleed").
 *
 *   slugCarImage({brand:"BMW", model:"320i"})  → "/cars/bmw-320i.jpg"
 *   slugCarImage({brand:"Porsche", model:"911 GT3 RS"}) → "/cars/porsche-911-gt3-rs.jpg"
 *
 * Consumer pattern (see `CarHeroImage`):
 *   <img src={slugCarImage(car)} onError={() => setBroken(true)} />
 *   {broken && <div style={{ background: carGradient(car.brand) }} />}
 */

/** Slugify brand + model into a safe static-asset filename. */
export function slugCarImage(car: { brand?: string | null; model?: string | null }): string {
  const raw = `${car.brand ?? ""}-${car.model ?? ""}`;
  const slug = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics (ş, ö, ç, …)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `/cars/${slug || "default"}.jpg`;
}

/**
 * Deterministic brand-tinted radial gradient, used as a fallback when a real
 * hero photo is not (yet) available. Not an exhaustive brand map — unknown
 * brands fall back to the house "electric indigo" default.
 */
export function carGradient(brand?: string | null): string {
  const b = (brand ?? "").toLowerCase();

  // Tuned to evoke each marque's marketing palette, filtered through the
  // deep canvas so nothing screams brighter than surface-container-highest.
  const brandTints: Record<string, string> = {
    bmw:        "rgba(0, 102, 177, 0.45)",   // BMW blue
    mercedes:   "rgba(200, 200, 210, 0.40)", // silver
    "mercedes-benz": "rgba(200, 200, 210, 0.40)",
    audi:       "rgba(180, 10, 30, 0.40)",   // Audi red
    porsche:    "rgba(230, 180, 60, 0.40)",  // Porsche crest gold
    ferrari:    "rgba(210, 30, 30, 0.45)",   // rosso
    lamborghini:"rgba(255, 200, 40, 0.40)",  // giallo
    astonmartin:"rgba(80, 180, 140, 0.35)",  // racing green
    "aston martin":"rgba(80, 180, 140, 0.35)",
    toyota:     "rgba(220, 40, 40, 0.35)",
    nissan:     "rgba(180, 60, 60, 0.35)",
    hyundai:    "rgba(80, 130, 200, 0.35)",
    kia:        "rgba(80, 30, 80, 0.40)",
    volkswagen: "rgba(30, 80, 160, 0.40)",
    tesla:      "rgba(200, 40, 60, 0.40)",
  };

  const tint = brandTints[b] ?? "rgba(128, 131, 255, 0.35)"; // fallback: primary

  return [
    // studio spotlight — concentrated primary-ish bleed
    `radial-gradient(ellipse 70% 55% at 55% 55%, ${tint} 0%, rgba(12,19,36,0.85) 60%, rgba(12,19,36,1) 85%)`,
    // base canvas fade
    "linear-gradient(135deg, rgba(22,30,50,0.95) 0%, rgba(12,19,36,1) 100%)",
  ].join(", ");
}
