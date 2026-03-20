"""Kıyas sonuçları için kazanan/kaybeden tarzı Türkçe özet cümleleri."""

from __future__ import annotations

from typing import Any, Optional

from app.models.car_feature import CarFeature
from app.models.car_variant import CarVariant
from app.schemas.compare import CompareCarBlock

PREMIUM_BRANDS = frozenset({"BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Volvo"})


def _label(block: CompareCarBlock) -> str:
    return f"{block.brand} {block.model}"


def feature_truthy(raw: str) -> bool:
    return str(raw).strip().lower() in ("true", "1", "yes", "var", "evet")


def build_equipment_section(
    variants: list[CarVariant],
) -> tuple[dict[str, Any], dict[int, int]]:
    """
    rows: pivot satırları
    truthy_counts: varyant id -> pozitif özellik sayısı
    """
    vids = [v.id for v in variants]
    # (category, name) -> vid -> bool veya ham metin
    matrix: dict[tuple[str, str], dict[int, Any]] = {}
    categories: dict[tuple[str, str], str] = {}

    for v in variants:
        for f in v.features:
            key = (f.feature_category, f.feature_name)
            categories[key] = f.feature_category
            matrix.setdefault(key, {})
            matrix[key][v.id] = feature_truthy(f.feature_value)

    rows: list[dict[str, Any]] = []
    for (cat, name) in sorted(matrix.keys(), key=lambda x: (x[0], x[1])):
        by_v = {str(vid): matrix[(cat, name)].get(vid) for vid in vids}
        rows.append(
            {
                "category": cat,
                "feature": name,
                "by_variant_id": by_v,
            }
        )

    truthy_counts: dict[int, int] = {vid: 0 for vid in vids}
    for v in variants:
        for f in v.features:
            if feature_truthy(f.feature_value):
                truthy_counts[v.id] = truthy_counts.get(v.id, 0) + 1

    return (
        {
            "rows": rows,
            "truthy_counts_by_variant_id": {str(k): v for k, v in truthy_counts.items()},
        },
        truthy_counts,
    )


def build_narratives(
    blocks: list[CompareCarBlock],
    variants: list[CarVariant],
    truthy_counts: dict[int, int],
    equipment_rows: list[dict[str, Any]],
) -> list[str]:
    by_vid = {b.car_variant_id: b for b in blocks}
    lines: list[str] = []

    # Yakıt ekonomisi
    cons = [(b.car_variant_id, b.performance.get("ortalama_tüketim")) for b in blocks]
    cons_n = [(vid, float(v)) for vid, v in cons if v is not None]
    if len(cons_n) >= 2:
        best_id, best_v = min(cons_n, key=lambda t: t[1])
        lines.append(
            f"Yakıt ekonomisinde (ortalama tüketim) {_label(by_vid[best_id])} öne çıkıyor ({best_v} L/100km)."
        )

    # Bagaj / aile
    bag = [(b.car_variant_id, b.technical.get("bagaj_l")) for b in blocks]
    bag_n = [(vid, int(v)) for vid, v in bag if v is not None]
    if len(bag_n) >= 2:
        top_id, top_v = max(bag_n, key=lambda t: t[1])
        lines.append(f"Aile ve bagaj kullanımında {_label(by_vid[top_id])} daha avantajlı ({top_v} L bagaj).")

    # Piyasa / bütçe
    price = [(b.car_variant_id, b.market.avg_price if b.market else None) for b in blocks]
    price_n = [(vid, float(v)) for vid, v in price if v is not None]
    if len(price_n) >= 2:
        cheap_id, cheap_v = min(price_n, key=lambda t: t[1])
        high_id, high_v = max(price_n, key=lambda t: t[1])
        if cheap_id != high_id:
            lines.append(
                f"Piyasa ortalaması en uygun bantta {_label(by_vid[cheap_id])} (~{cheap_v:,.0f} TL); "
                f"en yüksek ortalama {_label(by_vid[high_id])} (~{high_v:,.0f} TL)."
            )

    # Prestij (premium marka)
    prem = [(b.car_variant_id, b.brand in PREMIUM_BRANDS) for b in blocks]
    if any(p for _, p in prem) and not all(p for _, p in prem):
        premium_blocks = [b for b in blocks if b.brand in PREMIUM_BRANDS]
        mass_blocks = [b for b in blocks if b.brand not in PREMIUM_BRANDS]
        if premium_blocks and mass_blocks:
            p = premium_blocks[0]
            lines.append(
                f"Prestij tarafında {_label(p)} daha güçlü; bütçe ve işletme maliyeti genelde daha yüksek olabilir."
            )

    # Donanım sayısı
    if len(truthy_counts) >= 2 and any(truthy_counts.values()):
        best_vid = max(truthy_counts, key=lambda vid: truthy_counts[vid])
        worst_vid = min(truthy_counts, key=lambda vid: truthy_counts[vid])
        if truthy_counts[best_vid] > truthy_counts[worst_vid]:
            lines.append(
                f"Donanım zenginliği (evet sayısı) bakımından {_label(by_vid[best_vid])} önde "
                f"({truthy_counts[best_vid]} özellik)."
            )

    # Sadece bir araçta olan özellikler
    for row in equipment_rows:
        feat = row["feature"]
        by_v = row["by_variant_id"]
        true_ids = [int(vid) for vid, val in by_v.items() if val is True]
        if len(true_ids) == 1:
            vid = true_ids[0]
            lines.append(f"Sadece {_label(by_vid[vid])} {feat} sunuyor.")

    # Ek teknik kıyas (güç farkı belirginse)
    hp = [(b.car_variant_id, b.performance.get("beygir")) for b in blocks]
    hp_n = [(vid, int(v)) for vid, v in hp if v is not None]
    if len(hp_n) >= 2:
        top_id, top_hp = max(hp_n, key=lambda t: t[1])
        low_id, low_hp = min(hp_n, key=lambda t: t[1])
        if top_id != low_id and top_hp - low_hp >= 25:
            lines.append(
                f"Performans (beygir) tarafında {_label(by_vid[top_id])} daha güçlü ({top_hp} hp); "
                f"{_label(by_vid[low_id])} {low_hp} hp."
            )

    if not lines:
        lines.append(
            "Seçilen araçlar için özet: tablolarda teknik, performans ve piyasa alanlarını incele; "
            "donanım satırları eksikse özellik kıyası sınırlı kalır."
        )

    return lines
