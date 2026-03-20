"""Birleşik skor ve alt boyutlardan tek cümlelik sıralama özeti."""

from __future__ import annotations

from app.schemas.scoring import FitScoreItem


def build_ranking_reason(
    *,
    rank_index: int,
    returned_count: int,
    fit: FitScoreItem,
    feature_match_score: float,
    market_score: float,
    avg_price: float,
    budget_max: float,
    required_slug_count: int,
    preferred_slug_count: int,
) -> str:
    """rank_index: 0 = birinci; henüz limit kesilmemiş tam liste üzerinden."""
    pos = rank_index + 1
    if returned_count <= 1:
        prefix = "Listede tek aday olarak"
    elif pos == 1:
        prefix = "Listenin başında"
    else:
        prefix = f"Sıra {pos}'de"

    f = fit
    chunks: list[str] = []

    fit_contrib = 0.7 * f.overall_score
    feat_contrib = 0.2 * feature_match_score
    mkt_contrib = 0.1 * market_score
    dominant = max(
        ("genel uyum (fit)", fit_contrib),
        ("donanım eşleşmesi", feat_contrib),
        ("bütçe ve piyasa güveni", mkt_contrib),
        key=lambda x: x[1],
    )[0]

    if dominant == "genel uyum (fit)":
        tops = sorted(
            [
                ("yakıt ekonomisi", f.economy_score),
                ("ikinci el", f.resale_score),
                ("şehir içi kullanım", f.city_usage_score),
                ("aile kullanımı", f.family_score),
                ("performans", f.performance_score),
            ],
            key=lambda x: -x[1],
        )[:2]
        labels = [t[0] for t in tops if t[1] >= 68]
        if labels:
            chunks.append("özellikle " + " ve ".join(labels) + " tarafı güçlü")
        else:
            chunks.append("genel uyum skoru birleşik puanı taşıyor")
    elif dominant == "donanım eşleşmesi":
        chunks.append("donanım eşleşmesi birleşik skoru öne çekiyor")
    else:
        chunks.append("bütçe hizası ve piyasa istikrarı öne çıkıyor")

    if required_slug_count or preferred_slug_count:
        if feature_match_score >= 88:
            chunks.append("beklenen donanımlarla yüksek örtüşme var")
        elif feature_match_score < 55:
            chunks.append("donanım tarafında geride kalıyor")

    if budget_max > 0 and avg_price > 0 and avg_price >= budget_max * 0.96:
        chunks.append("ortalama fiyat bütçe sınırına yakın; sıralamayı baskılayabilir")

    if market_score < 52:
        chunks.append("piyasa güveni veya fiyat bandı zayıf")

    tail = "; ".join(chunks[:2]) if chunks else "birleşik skor bileşenleri dengeli"
    return f"{prefix}: {tail}."

