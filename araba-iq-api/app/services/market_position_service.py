"""
İlan pozisyonu: market_stats kaydındaki ortalama ve std ile z-score (canlı ilan agregasyonu değil).
"""

from __future__ import annotations

from typing import Any, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.market_listing import MarketListing
from app.models.market_stat import MarketStat


def classify_listing_position(z_score: float) -> str:
    if z_score <= -1.0:
        return "cheap"
    if z_score >= 1.0:
        return "expensive"
    return "normal"


def build_position_explanation(position: str, avg_price: float, listing_price: float) -> str:
    diff_pct = ((listing_price - avg_price) / avg_price * 100) if avg_price else 0.0

    if position == "cheap":
        return (
            f"Bu ilan piyasa ortalamasının yaklaşık %{abs(diff_pct):.1f} altında. "
            f"Benzer ilanlara göre avantajlı görünüyor."
        )
    if position == "expensive":
        return (
            f"Bu ilan piyasa ortalamasının yaklaşık %{abs(diff_pct):.1f} üzerinde. "
            f"Benzer ilanlara göre pahalı tarafta kalıyor."
        )
    return (
        "Bu ilan piyasa ortalamasına yakın. "
        "Benzer araçlarla karşılaştırıldığında normal fiyat bandında görünüyor."
    )


def get_listing_position(db: Session, listing_id: int) -> Tuple[Optional[dict[str, Any]], Optional[str]]:
    listing = db.get(MarketListing, listing_id)
    if listing is None:
        return None, "LISTING_NOT_FOUND"
    if not listing.is_active:
        return None, "LISTING_INACTIVE"

    stat = db.scalars(
        select(MarketStat).where(MarketStat.car_variant_id == listing.car_variant_id)
    ).one_or_none()
    if stat is None:
        return None, "MARKET_STATS_NOT_FOUND"

    avg_price = float(stat.avg_price or 0)
    std_dev = float(stat.std_dev_price or 0)
    listing_price = float(listing.price)

    if avg_price <= 0:
        return None, "INVALID_MARKET_AVG"

    if std_dev == 0:
        z_score = 0.0
    else:
        z_score = (listing_price - avg_price) / std_dev

    position = classify_listing_position(z_score)
    explanation = build_position_explanation(position, avg_price, listing_price)
    pct_vs_avg = ((listing_price - avg_price) / avg_price * 100) if avg_price else None

    return {
        "listing_id": listing.id,
        "car_variant_id": listing.car_variant_id,
        "listing_price": int(listing_price),
        "currency": listing.currency,
        "market_avg_price": round(avg_price, 2),
        "market_std_dev": round(std_dev, 2),
        "z_score": round(z_score, 3),
        "position": position,
        "explanation": explanation,
        "sample_size": stat.sample_size,
        "pct_vs_avg": round(pct_vs_avg, 2) if pct_vs_avg is not None else None,
    }, None
