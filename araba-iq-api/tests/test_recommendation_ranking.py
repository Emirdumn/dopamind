"""Birim: sıralama özeti cümlesi (DB yok)."""

from app.schemas.scoring import FitScoreItem
from app.services.recommendation_ranking import build_ranking_reason


def _fit(**kwargs: float) -> FitScoreItem:
    base = dict(
        car_variant_id=1,
        display_name="X",
        overall_score=70.0,
        budget_score=70.0,
        economy_score=70.0,
        city_usage_score=70.0,
        performance_score=70.0,
        comfort_score=70.0,
        family_score=70.0,
        prestige_score=70.0,
        resale_score=70.0,
        maintenance_score=70.0,
        explanation="",
    )
    base.update(kwargs)
    return FitScoreItem(**base)


def test_ranking_reason_starts_with_listenin_basi_when_first():
    f = _fit(overall_score=85, economy_score=90, resale_score=88)
    s = build_ranking_reason(
        rank_index=0,
        returned_count=3,
        fit=f,
        feature_match_score=70.0,
        market_score=70.0,
        avg_price=1_500_000,
        budget_max=2_000_000,
        required_slug_count=0,
        preferred_slug_count=0,
    )
    assert s.startswith("Listenin başında")


def test_ranking_reason_mentions_donanim_when_dominant():
    f = _fit(overall_score=20, economy_score=40)
    s = build_ranking_reason(
        rank_index=0,
        returned_count=2,
        fit=f,
        feature_match_score=95.0,
        market_score=60.0,
        avg_price=1_000_000,
        budget_max=2_000_000,
        required_slug_count=2,
        preferred_slug_count=1,
    )
    assert "donanım" in s.lower()
