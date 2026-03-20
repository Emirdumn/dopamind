"""
Öneri motoru senaryoları — gerçek DB gerekir.

Çalıştırma:
  cd araba-iq-api && pip install -r requirements-dev.txt
  DATABASE_URL=postgresql+psycopg://... pytest tests/test_recommendations_integration.py -v
"""

from __future__ import annotations

import os

import pytest

from app.core.database import SessionLocal
from app.schemas.recommendation import RecommendationRequest
from app.services.recommendation_service import build_recommendations

pytestmark = pytest.mark.skipif(
    not os.environ.get("DATABASE_URL"),
    reason="DATABASE_URL tanımlı değil (entegrasyon atlandı)",
)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_scenario_low_budget_hybrid_city(db):
    req = RecommendationRequest(
        budget_max=2_000_000,
        fuel_preference="Hybrid",
        city_usage_ratio=80,
        economy_priority=9,
        comfort_priority=7,
        limit=5,
    )
    r = build_recommendations(db, req)
    assert r.total_candidates >= 1
    top = r.results[0]
    assert "Hybrid" in top.car_name or "hybrid" in top.car_name.lower()


def test_scenario_family_suv_safety_features(db):
    req = RecommendationRequest(
        budget_max=3_000_000,
        segment_ids=[1],
        family_priority=9,
        required_features=["adaptive_cruise_control", "blind_spot_warning"],
        preferred_features=["sunroof"],
        strict_required=True,
        limit=10,
    )
    r = build_recommendations(db, req)
    assert r.total_candidates >= 1
    for item in r.results:
        assert not item.missing_required_features


def test_scenario_prestige_low_maintenance_sensitivity(db):
    req = RecommendationRequest(
        budget_max=6_000_000,
        prestige_priority=9,
        maintenance_sensitivity=2,
        limit=10,
    )
    r = build_recommendations(db, req)
    assert r.total_candidates >= 1
    names = [x.car_name for x in r.results]
    assert any("BMW" in n for n in names)


def test_scenario_budget_at_premium_edge(db):
    req = RecommendationRequest(
        budget_max=2_900_000,
        prestige_priority=8,
        limit=10,
    )
    r = build_recommendations(db, req)
    assert isinstance(r.total_candidates, int)
    assert r.returned_count <= req.limit


def test_strict_required_excludes_corolla_when_blind_spot_required(db):
    req = RecommendationRequest(
        budget_max=10_000_000,
        required_features=["blind_spot_warning"],
        strict_required=True,
        limit=10,
    )
    r = build_recommendations(db, req)
    ids = [x.car_id for x in r.results]
    assert 1 not in ids
    assert all(not x.missing_required_features for x in r.results)


def test_strict_required_false_keeps_corolla_with_missing(db):
    req = RecommendationRequest(
        budget_max=10_000_000,
        required_features=["blind_spot_warning"],
        strict_required=False,
        limit=10,
    )
    r = build_recommendations(db, req)
    corolla_rows = [x for x in r.results if x.car_id == 1]
    assert corolla_rows
    assert corolla_rows[0].missing_required_features


def test_include_debug_returns_excluded_and_filter_reason(db):
    req = RecommendationRequest(
        budget_max=10_000_000,
        required_features=["blind_spot_warning"],
        strict_required=True,
        include_debug=True,
        limit=10,
    )
    r = build_recommendations(db, req)
    assert r.excluded_candidates is not None
    exc_ids = {e.car_id for e in r.excluded_candidates}
    assert 1 in exc_ids
    assert r.results
    assert r.results[0].candidate_filter_reason is not None
    assert "strict_required" in r.results[0].candidate_filter_reason
