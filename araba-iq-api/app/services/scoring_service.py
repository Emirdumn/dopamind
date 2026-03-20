from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.car_variant import CarVariant
from app.models.vehicle_model import VehicleModel
from app.schemas.scoring import FitScoreItem, FitScoreResponse, UserPreferencesIn

# Marka kümeleri (paketle uyumlu; Nissan SUV demoları için ikinci ele eklendi)
PREMIUM_BRANDS = {
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Lexus",
    "Volvo",
    "Porsche",
}
STRONG_RESALE_BRANDS = {
    "Toyota",
    "Honda",
    "Volkswagen",
    "BMW",
    "Mercedes-Benz",
    "Renault",
    "Fiat",
    "Nissan",
    "Hyundai",
}
LOW_MAINTENANCE_BRANDS = {"Toyota", "Honda", "Hyundai", "Kia", "Renault", "Fiat"}
MID_PRESTIGE_BRANDS = {"Volkswagen", "Skoda", "Peugeot", "Mazda"}

WEIGHTS = {
    "budget_score": 0.20,
    "economy_score": 0.15,
    "city_usage_score": 0.10,
    "performance_score": 0.15,
    "family_score": 0.10,
    "prestige_score": 0.10,
    "resale_score": 0.10,
    "maintenance_score": 0.10,
}

DIMENSION_LABELS_TR = {
    "budget_score": "bütçe uyumu",
    "economy_score": "yakıt/ekonomi",
    "city_usage_score": "şehir içi kullanım",
    "performance_score": "performans",
    "family_score": "aile kullanımı",
    "prestige_score": "prestij",
    "resale_score": "ikinci el",
    "maintenance_score": "bakım",
    "comfort_score": "konfor",
}


def clamp(value: float, min_value: float = 0.0, max_value: float = 100.0) -> float:
    return max(min_value, min(max_value, value))


def score_budget(avg_price: float, budget_max: Optional[float]) -> float:
    if budget_max is None or budget_max <= 0:
        return 55.0
    if avg_price <= 0:
        return 52.0
    ratio = avg_price / budget_max
    if ratio <= 0.85:
        return 100.0
    if ratio <= 1.0:
        return 85.0
    if ratio <= 1.10:
        return 60.0
    if ratio <= 1.20:
        return 35.0
    return 10.0


def _fuel_match(pref: str, car_fuel: str) -> bool:
    p, c = pref.lower().strip(), car_fuel.lower().strip()
    if not p or not c:
        return False
    if p == c:
        return True
    if p == "hybrid" and "hybrid" in c:
        return True
    if p in ("benzin", "gasoline", "petrol") and c in ("benzin", "gasoline", "petrol"):
        return True
    if p == "dizel" and c in ("dizel", "diesel"):
        return True
    return False


def score_economy(
    car: CarVariant,
    fuel_preference: Optional[str],
    economy_priority: int,
) -> float:
    score = 50.0
    fuel_type = car.fuel_type or ""
    consumption = float(car.combined_fuel_consumption or 0)

    if fuel_preference:
        if _fuel_match(fuel_preference, fuel_type):
            score += 25.0
        elif fuel_preference.lower().strip() == "hybrid" and "hybrid" in fuel_type.lower():
            score += 15.0

    if consumption > 0:
        if consumption <= 5.0:
            score += 25.0
        elif consumption <= 6.5:
            score += 18.0
        elif consumption <= 8.0:
            score += 8.0
        else:
            score -= 10.0

    score += (economy_priority - 5) * 2.0
    return clamp(score)


def score_city_usage(
    car: CarVariant,
    city_usage_ratio: int,
    comfort_priority: int,
) -> float:
    score = 50.0
    transmission = (car.transmission or "").lower()
    consumption = float(car.combined_fuel_consumption or 0)
    luggage = car.luggage_capacity or 0

    if city_usage_ratio >= 60:
        if any(x in transmission for x in ("automatic", "cvt", "e-cvt", "dct")):
            score += 15.0
        if 0 < consumption <= 6.5:
            score += 20.0
        if 0 < luggage <= 520:
            score += 5.0
    else:
        if luggage >= 450:
            score += 10.0
        if car.horsepower and car.horsepower >= 150:
            score += 10.0

    score += (comfort_priority - 5) * 1.5
    return clamp(score)


def score_comfort(car: CarVariant, comfort_priority: int) -> float:
    """Bilgilendirme amaçlı; ağırlıklı genel skora dahil edilmez."""
    score = 45.0
    tr = (car.transmission or "").lower()
    if any(x in tr for x in ("automatic", "cvt", "e-cvt", "dct")):
        score += 15.0
    if (car.seat_count or 0) >= 5:
        score += 10.0
    if (car.luggage_capacity or 0) >= 450:
        score += 10.0
    score += (comfort_priority - 5) * 2.5
    return clamp(score)


def score_performance(car: CarVariant, performance_priority: int) -> float:
    score = 40.0
    hp = car.horsepower or 0
    zero_to_hundred = float(car.zero_to_hundred or 0)

    if hp >= 250:
        score += 35.0
    elif hp >= 180:
        score += 25.0
    elif hp >= 140:
        score += 15.0
    elif hp >= 110:
        score += 8.0

    if zero_to_hundred > 0:
        if zero_to_hundred <= 7.0:
            score += 20.0
        elif zero_to_hundred <= 9.0:
            score += 10.0
        elif zero_to_hundred <= 11.0:
            score += 5.0

    score += (performance_priority - 5) * 2.0
    return clamp(score)


def score_family(car: CarVariant, family_priority: int) -> float:
    score = 40.0
    luggage = car.luggage_capacity or 0
    seat_count = car.seat_count or 5

    if luggage >= 550:
        score += 35.0
    elif luggage >= 450:
        score += 25.0
    elif luggage >= 350:
        score += 15.0

    if seat_count >= 5:
        score += 15.0

    score += (family_priority - 5) * 2.0
    return clamp(score)


def score_prestige(brand_name: str, prestige_priority: int) -> float:
    score = 40.0
    if brand_name in PREMIUM_BRANDS:
        score += 40.0
    elif brand_name in MID_PRESTIGE_BRANDS:
        score += 20.0
    else:
        score += 10.0

    score += (prestige_priority - 5) * 2.0
    return clamp(score)


def score_resale(brand_name: str, resale_priority: int) -> float:
    score = 40.0
    if brand_name in STRONG_RESALE_BRANDS:
        score += 35.0
    else:
        score += 15.0

    score += (resale_priority - 5) * 2.0
    return clamp(score)


def score_maintenance(brand_name: str, maintenance_sensitivity: int) -> float:
    score = 50.0
    if brand_name in LOW_MAINTENANCE_BRANDS:
        score += 30.0
    elif brand_name in PREMIUM_BRANDS:
        score -= 10.0
    else:
        score += 10.0

    score += (maintenance_sensitivity - 5) * 2.0
    return clamp(score)


def build_explanation(
    display_name: str,
    sub_scores: dict[str, float],
    overall_score: float,
) -> str:
    strengths: list[str] = []
    weaknesses: list[str] = []
    for key, value in sub_scores.items():
        if key == "comfort_score":
            continue
        label = DIMENSION_LABELS_TR.get(key, key)
        if value >= 80:
            strengths.append(label)
        elif value <= 45:
            weaknesses.append(label)

    s_txt = ", ".join(strengths[:3]) if strengths else "genel olarak dengeli"
    w_txt = ", ".join(weaknesses[:2]) if weaknesses else "belirgin zayıf alan yok"
    return (
        f"{display_name} için ağırlıklı genel skor {overall_score:.1f}/100. "
        f"Güçlü görünen başlıklar: {s_txt}. "
        f"Dikkat: {w_txt}. "
        f"Konfor alt skoru ({sub_scores.get('comfort_score', 0):.0f}/100) şehir/şanzıman proxy’si; önceliklerinle birlikte oku."
    )


def compute_fit_scores(db: Session, prefs: UserPreferencesIn, car_ids: list[int]) -> FitScoreResponse:
    stmt = (
        select(CarVariant)
        .where(CarVariant.id.in_(car_ids))
        .options(
            joinedload(CarVariant.vehicle_model).joinedload(VehicleModel.brand),
            joinedload(CarVariant.market_stat),
        )
    )
    cars = list(db.scalars(stmt).unique().all())
    if len(cars) != len(set(car_ids)):
        raise ValueError("Bazı car_ids bulunamadı")

    results: list[FitScoreItem] = []
    for c in cars:
        brand = c.vehicle_model.brand
        brand_name = brand.name.strip()
        model_name = c.vehicle_model.name
        display = f"{brand_name} {model_name} {c.trim_name} {c.year}"

        avg_price = float(c.market_stat.avg_price) if c.market_stat and c.market_stat.avg_price else 0.0

        budget_score = round(score_budget(avg_price, prefs.budget_max), 2)
        economy_score = round(
            score_economy(c, prefs.fuel_preference, prefs.economy_priority),
            2,
        )
        city_usage_score = round(
            score_city_usage(c, prefs.city_usage_ratio, prefs.comfort_priority),
            2,
        )
        performance_score = round(score_performance(c, prefs.performance_priority), 2)
        family_score = round(score_family(c, prefs.family_priority), 2)
        prestige_score = round(score_prestige(brand_name, prefs.prestige_priority), 2)
        resale_score = round(score_resale(brand_name, prefs.resale_priority), 2)
        maintenance_score = round(
            score_maintenance(brand_name, prefs.maintenance_sensitivity),
            2,
        )
        comfort_score = round(score_comfort(c, prefs.comfort_priority), 2)

        weighted = {
            "budget_score": budget_score,
            "economy_score": economy_score,
            "city_usage_score": city_usage_score,
            "performance_score": performance_score,
            "family_score": family_score,
            "prestige_score": prestige_score,
            "resale_score": resale_score,
            "maintenance_score": maintenance_score,
        }
        overall_score = round(
            sum(weighted[k] * WEIGHTS[k] for k in WEIGHTS),
            2,
        )

        explain_scores = {**weighted, "comfort_score": comfort_score}
        explanation = build_explanation(display, explain_scores, overall_score)

        results.append(
            FitScoreItem(
                car_variant_id=c.id,
                display_name=display,
                overall_score=overall_score,
                budget_score=budget_score,
                economy_score=economy_score,
                city_usage_score=city_usage_score,
                performance_score=performance_score,
                comfort_score=comfort_score,
                family_score=family_score,
                prestige_score=prestige_score,
                resale_score=resale_score,
                maintenance_score=maintenance_score,
                explanation=explanation,
            )
        )

    results.sort(key=lambda r: r.overall_score, reverse=True)
    return FitScoreResponse(results=results)
