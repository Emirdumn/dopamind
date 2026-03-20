"""Saf Python istatistik yardımcıları (numpy yok)."""

from __future__ import annotations

from typing import Optional, Sequence


def mean(values: Sequence[float]) -> float:
    if not values:
        raise ValueError("empty")
    return sum(values) / len(values)


def median(values: Sequence[float]) -> float:
    if not values:
        raise ValueError("empty")
    s = sorted(values)
    n = len(s)
    mid = n // 2
    if n % 2:
        return float(s[mid])
    return (s[mid - 1] + s[mid]) / 2.0


def pstdev(values: Sequence[float]) -> float:
    """Popülasyon std (n payda). n<2 ise 0.0."""
    n = len(values)
    if n < 2:
        return 0.0
    m = sum(values) / n
    var = sum((x - m) ** 2 for x in values) / n
    return var**0.5


def pvariance(values: Sequence[float]) -> float:
    n = len(values)
    if n < 2:
        return 0.0
    m = sum(values) / n
    return sum((x - m) ** 2 for x in values) / n


def pearson_price_mileage(prices: Sequence[float], mileages: Sequence[float]) -> Optional[float]:
    """İkisi de aynı uzunlukta ve eşlenik; None olan km satırları filtrelenmiş olmalı."""
    if len(prices) != len(mileages) or len(prices) < 3:
        return None
    n = len(prices)
    mx = sum(prices) / n
    my = sum(mileages) / n
    num = sum((px - mx) * (my_k - my) for px, my_k in zip(prices, mileages))
    dx = sum((px - mx) ** 2 for px in prices) ** 0.5
    dy = sum((my_k - my) ** 2 for my_k in mileages) ** 0.5
    if dx == 0 or dy == 0:
        return None
    r = num / (dx * dy)
    return max(-1.0, min(1.0, r))


def z_score(value: float, avg: float, std: float) -> Optional[float]:
    if std is None or std <= 0:
        return None
    return (value - avg) / std
