"""API slug ↔ seed’deki feature_name eşlemesi; recommendation ve eşleşme skoru için."""

from __future__ import annotations

from app.models.car_feature import CarFeature

# GET /cars/{id}/features ile dönen feature_name değerleriyle uyumlu
FEATURE_SLUG_TO_LABEL: dict[str, str] = {
    "apple_carplay": "Apple CarPlay",
    "android_auto": "Android Auto",
    "adaptive_cruise_control": "Adaptif hız sabitleyici",
    "lane_keep_assist": "Şerit takip asistanı",
    "blind_spot_warning": "Kör nokta uyarısı",
    "sunroof": "Sunroof",
    "panoramic_roof": "Panoramik cam tavan",
    "rear_camera": "Geri görüş kamerası",
    "head_up_display": "Head-up display",
    "automatic_park_assistant": "Otomatik park asistanı",
}

LABEL_TO_FEATURE_SLUG: dict[str, str] = {v: k for k, v in FEATURE_SLUG_TO_LABEL.items()}


def normalize_feature_slug(raw: str) -> str | None:
    s = raw.strip().lower().replace(" ", "_").replace("-", "_")
    if s in FEATURE_SLUG_TO_LABEL:
        return s
    return None


def truthy_feature_value(value: str) -> bool:
    return value.strip().lower() in ("true", "1", "yes", "evet", "var")


def truthy_slugs_for_variant(features: list[CarFeature]) -> set[str]:
    out: set[str] = set()
    for f in features:
        if not truthy_feature_value(f.feature_value):
            continue
        slug = LABEL_TO_FEATURE_SLUG.get(f.feature_name.strip())
        if slug:
            out.add(slug)
    return out


def compute_feature_match_score(
    required_slugs: list[str],
    preferred_slugs: list[str],
    truthy: set[str],
) -> tuple[float, list[str], list[str], list[str]]:
    matched_req = [s for s in required_slugs if s in truthy]
    missing_req = [s for s in required_slugs if s not in truthy]
    matched_pref = [s for s in preferred_slugs if s in truthy]

    if not required_slugs and not preferred_slugs:
        return 50.0, matched_req, matched_pref, missing_req

    if required_slugs and preferred_slugs:
        score = (len(matched_req) / len(required_slugs)) * 70.0
        score += (len(matched_pref) / len(preferred_slugs)) * 30.0
    elif required_slugs:
        score = (len(matched_req) / len(required_slugs)) * 100.0
    else:
        score = (len(matched_pref) / len(preferred_slugs)) * 100.0

    return round(score, 1), matched_req, matched_pref, missing_req
