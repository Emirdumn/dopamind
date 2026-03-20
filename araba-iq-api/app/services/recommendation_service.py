from __future__ import annotations

import logging
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.car_variant import CarVariant
from app.models.market_stat import MarketStat
from app.models.vehicle_model import VehicleModel
from app.schemas.recommendation import (
    ExcludedCandidate,
    PriceSummary,
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
)
from app.schemas.scoring import FitScoreItem
from app.services.car_feature_matching import (
    compute_feature_match_score,
    normalize_feature_slug,
    truthy_slugs_for_variant,
)
from app.services.recommendation_ranking import build_ranking_reason
from app.services.scoring_service import _fuel_match, compute_fit_scores, score_budget

logger = logging.getLogger(__name__)


def _normalize_slug_list(raw: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for x in raw:
        s = normalize_feature_slug(x)
        if s and s not in seen:
            seen.add(s)
            out.append(s)
    return out


def _variant_display(v: CarVariant) -> str:
    brand = v.vehicle_model.brand.name.strip()
    return f"{brand} {v.vehicle_model.name} {v.trim_name} {v.year}"


def list_candidate_variants(db: Session, segment_ids: list[int]) -> list[CarVariant]:
    stmt = (
        select(CarVariant)
        .join(VehicleModel, CarVariant.model_id == VehicleModel.id)
        .options(
            joinedload(CarVariant.vehicle_model).joinedload(VehicleModel.brand),
            joinedload(CarVariant.market_stat),
            selectinload(CarVariant.features),
        )
    )
    if segment_ids:
        stmt = stmt.where(VehicleModel.segment_id.in_(segment_ids))
    stmt = stmt.order_by(CarVariant.id)
    return list(db.scalars(stmt).unique().all())


def partition_by_budget(
    variants: list[CarVariant],
    budget_max: float,
    over_ratio: float = 1.25,
) -> tuple[list[CarVariant], list[tuple[CarVariant, str]]]:
    kept: list[CarVariant] = []
    dropped: list[tuple[CarVariant, str]] = []
    for v in variants:
        ms = v.market_stat
        if ms and ms.avg_price is not None and budget_max > 0:
            if float(ms.avg_price) > budget_max * over_ratio:
                dropped.append(
                    (
                        v,
                        "Ortalama ilan fiyatı bütçe üst sınırının 1.25 katını aşıyor (bütçe ön filtresi).",
                    )
                )
                continue
        kept.append(v)
    return kept, dropped


def partition_strict_required(
    variants: list[CarVariant],
    required_slugs: list[str],
) -> tuple[list[CarVariant], list[tuple[CarVariant, str]]]:
    kept: list[CarVariant] = []
    dropped: list[tuple[CarVariant, str]] = []
    for v in variants:
        truthy = truthy_slugs_for_variant(list(v.features))
        missing = [s for s in required_slugs if s not in truthy]
        if missing:
            reason = (
                "strict_required: zorunlu donanım eksik ("
                + ", ".join(missing)
                + ")."
            )
            dropped.append((v, reason))
            logger.info(
                "Recommendation aday elendi car_id=%s reason=%s",
                v.id,
                reason,
            )
        else:
            kept.append(v)
    return kept, dropped


def compute_market_score_component(
    budget_max: float,
    stat: MarketStat | None,
) -> float:
    avg = float(stat.avg_price) if stat and stat.avg_price else 0.0
    budget_align = score_budget(avg, budget_max if budget_max > 0 else None)

    n = stat.sample_size if stat else 0
    if n >= 8:
        sample_sc = 100.0
    elif n >= 3:
        sample_sc = 65.0
    elif n >= 1:
        sample_sc = 40.0
    else:
        sample_sc = 25.0

    if stat and stat.avg_price and stat.std_dev_price:
        avg_f = float(stat.avg_price)
        std_f = float(stat.std_dev_price)
        if avg_f > 0:
            cv = std_f / avg_f
            if cv < 0.04:
                stab = 100.0
            elif cv < 0.09:
                stab = 80.0
            elif cv < 0.16:
                stab = 55.0
            else:
                stab = 30.0
        else:
            stab = 50.0
    else:
        stab = 50.0

    return round(0.6 * budget_align + 0.2 * sample_sc + 0.2 * stab, 2)


def build_price_comment(stat: MarketStat | None) -> str:
    if not stat or stat.sample_size == 0:
        return "Bu model için güncel ilan özeti yok; fiyat piyasası belirsiz."
    n = stat.sample_size
    avg = float(stat.avg_price or 0)
    std = float(stat.std_dev_price or 0)
    parts: list[str] = []
    if n < 3:
        parts.append("Bu model için piyasa verisi sınırlı.")
    elif n < 8:
        parts.append("Örneklem orta büyüklükte; ortalamayı tek başına kesin fiyat sanma.")
    if avg > 0 and std > 0:
        cv = std / avg
        if cv >= 0.16:
            parts.append("Bu modelde fiyatlar görece oynak.")
        elif cv <= 0.06:
            parts.append("Bu modelde fiyat bandı görece daha stabil.")
    if not parts:
        parts.append("Piyasada fiyat dağılımı tipik aralıkta görünüyor; ilanlar birbirine yakın olabilir.")
    return " ".join(parts)


def _fit_by_id(fit_response_results: list[FitScoreItem]) -> dict[int, FitScoreItem]:
    return {r.car_variant_id: r for r in fit_response_results}


def build_reasons_and_cautions(
    display_name: str,
    fit: FitScoreItem,
    budget_max: float,
    fuel_pref: str | None,
    city_ratio: int,
    perf_priority: int,
    required: list[str],
    preferred: list[str],
    matched_req: list[str],
    missing_req: list[str],
    matched_pref: list[str],
    market_stat: MarketStat | None,
    fuel_match: bool,
) -> tuple[list[str], list[str]]:
    reasons: list[str] = []
    cautions: list[str] = []

    avg = float(market_stat.avg_price) if market_stat and market_stat.avg_price else 0.0
    budget_line = False
    if budget_max > 0 and avg > 0:
        if avg <= budget_max * 0.92:
            reasons.append("Bütçene net şekilde uyuyor.")
            budget_line = True
        elif avg <= budget_max:
            reasons.append("Bütçe bandına uyuyor.")
            budget_line = True
        elif avg <= budget_max * 1.08:
            cautions.append("Piyasa ortalaması bütçe üst sınırına yakın; pazarlık payı düşük olabilir.")
    if not budget_line and fit.budget_score >= 82:
        reasons.append("Bütçe uyumu skoru yüksek.")

    if city_ratio >= 60 and fit.city_usage_score >= 72:
        reasons.append("Şehir içi kullanım profiline uyum iyi görünüyor.")
    if fuel_pref and fuel_match and fit.economy_score >= 70:
        reasons.append("Yakıt tercihinle uyumlu ve ekonomi skoru güçlü.")
    elif fuel_pref and fuel_match:
        reasons.append("Belirttiğin yakıt tipiyle uyumlu.")

    if fit.resale_score >= 75:
        reasons.append("İkinci el tarafı görece güçlü görünüyor.")

    if required and not missing_req:
        reasons.append("Zorunlu donanım beklentilerini karşılıyor.")
    elif matched_req:
        reasons.append(f"Zorunlu donanımlardan {len(matched_req)}/{len(required)} eşleşiyor.")

    if preferred and matched_pref:
        reasons.append(f"Tercih ettiğin ek donanımlardan {len(matched_pref)} tanesi mevcut.")

    if fit.family_score >= 75:
        reasons.append("Aile ve pratik kullanım başlıklarında öne çıkıyor.")

    if missing_req:
        cautions.append(
            "İstediğin bazı zorunlu donanımlar bu varyantta eksik; "
            + ", ".join(missing_req)
            + " listelenmiyor."
        )

    if perf_priority >= 7 and fit.performance_score < 55:
        cautions.append("Performans önceliğin yüksek; bu araç daha sakin kalabilir.")

    if fit.maintenance_score < 45 and fit.prestige_score >= 70:
        cautions.append("Prestij segmenti; bakım ve işletme maliyeti yüksek olabilir.")

    ms = market_stat
    if ms and ms.sample_size > 0 and ms.sample_size < 3:
        cautions.append("Bu model için ilan örneği az; fiyat yorumunu dikkatli kullan.")
    if ms and ms.avg_price and ms.std_dev_price and float(ms.avg_price) > 0:
        cv = float(ms.std_dev_price) / float(ms.avg_price)
        if cv >= 0.16:
            cautions.append("Fiyat oynaklığı yüksek; tek ilana kilitlenme.")

    if not reasons:
        reasons.append(f"{display_name} genel tercih profiline göre dengeli bir aday.")

    return reasons[:5], cautions[:5]


@dataclass
class _StagedRow:
    variant: CarVariant
    display: str
    overall: float
    fit: FitScoreItem
    feat_score: float
    mkt_score: float
    mreq: list[str]
    mpref: list[str]
    miss_req: list[str]
    price_summary: PriceSummary
    reasons: list[str]
    cautions: list[str]


def build_recommendations(db: Session, req: RecommendationRequest) -> RecommendationResponse:
    required_slugs = _normalize_slug_list(req.required_features)
    preferred_slugs = _normalize_slug_list(req.preferred_features)

    raw = list_candidate_variants(db, req.segment_ids)
    candidates, budget_dropped = partition_by_budget(raw, req.budget_max)

    strict_dropped: list[tuple[CarVariant, str]] = []
    if req.strict_required and required_slugs:
        candidates, strict_dropped = partition_strict_required(candidates, required_slugs)

    excluded_debug: list[ExcludedCandidate] | None = None
    if req.include_debug:
        excluded_debug = [
            ExcludedCandidate(car_id=v.id, car_name=_variant_display(v), reason=r)
            for v, r in budget_dropped + strict_dropped
        ]

    total = len(candidates)
    if total == 0:
        return RecommendationResponse(
            total_candidates=0,
            returned_count=0,
            results=[],
            excluded_candidates=excluded_debug,
        )

    ids = [c.id for c in candidates]
    prefs = req.to_user_preferences()
    fit_response = compute_fit_scores(db, prefs, ids)
    fit_map = _fit_by_id(fit_response.results)

    staged: list[_StagedRow] = []

    for v in candidates:
        fit = fit_map.get(v.id)
        if fit is None:
            continue
        display = _variant_display(v)

        truthy = truthy_slugs_for_variant(list(v.features))
        feat_score, mreq, mpref, miss_req = compute_feature_match_score(
            required_slugs, preferred_slugs, truthy
        )
        ms = v.market_stat
        mkt_score = compute_market_score_component(req.budget_max, ms)

        overall = round(
            0.70 * fit.overall_score + 0.20 * feat_score + 0.10 * mkt_score,
            2,
        )
        fuel_ok = bool(
            req.fuel_preference and v.fuel_type and _fuel_match(req.fuel_preference, v.fuel_type)
        )
        if fuel_ok:
            overall = min(100.0, round(overall + 2.0, 2))

        price_comment = build_price_comment(ms)
        avg_i = int(round(float(ms.avg_price))) if ms and ms.avg_price else None
        price_summary = PriceSummary(
            avg_price=avg_i,
            sample_size=ms.sample_size if ms else 0,
            price_comment=price_comment,
        )

        reasons, cautions = build_reasons_and_cautions(
            display,
            fit,
            req.budget_max,
            req.fuel_preference,
            req.city_usage_ratio,
            req.performance_priority,
            required_slugs,
            preferred_slugs,
            mreq,
            miss_req,
            mpref,
            ms,
            fuel_ok,
        )

        staged.append(
            _StagedRow(
                variant=v,
                display=display,
                overall=overall,
                fit=fit,
                feat_score=feat_score,
                mkt_score=mkt_score,
                mreq=mreq,
                mpref=mpref,
                miss_req=miss_req,
                price_summary=price_summary,
                reasons=reasons,
                cautions=cautions,
            )
        )

    staged.sort(key=lambda r: r.overall, reverse=True)
    sliced = staged[: req.limit]
    n_ret = len(sliced)

    filter_note_parts = ["Bütçe ön filtresi geçildi"]
    if req.strict_required and required_slugs:
        filter_note_parts.append("strict_required zorunlu donanım geçildi")
    filter_note = "; ".join(filter_note_parts) + "."

    results: list[RecommendationItem] = []
    for i, row in enumerate(sliced):
        avg_f = (
            float(row.variant.market_stat.avg_price)
            if row.variant.market_stat and row.variant.market_stat.avg_price
            else 0.0
        )
        ranking_reason = build_ranking_reason(
            rank_index=i,
            returned_count=n_ret,
            fit=row.fit,
            feature_match_score=row.feat_score,
            market_score=row.mkt_score,
            avg_price=avg_f,
            budget_max=req.budget_max,
            required_slug_count=len(required_slugs),
            preferred_slug_count=len(preferred_slugs),
        )
        results.append(
            RecommendationItem(
                car_id=row.variant.id,
                car_name=row.display,
                overall_score=row.overall,
                fit_score=row.fit.overall_score,
                feature_match_score=row.feat_score,
                market_score=row.mkt_score,
                matched_required_features=row.mreq,
                matched_preferred_features=row.mpref,
                matched_required_count=len(row.mreq),
                matched_preferred_count=len(row.mpref),
                missing_required_features=row.miss_req,
                ranking_reason=ranking_reason,
                candidate_filter_reason=filter_note if req.include_debug else None,
                price_summary=row.price_summary,
                reasons=row.reasons,
                cautions=row.cautions,
            )
        )

    return RecommendationResponse(
        total_candidates=total,
        returned_count=len(results),
        results=results,
        excluded_candidates=excluded_debug,
    )
