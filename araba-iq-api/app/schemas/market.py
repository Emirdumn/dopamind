from datetime import date
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class MarketStatsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    car_variant_id: int
    sample_size: int
    avg_price: Optional[Decimal]
    median_price: Optional[Decimal]
    min_price: Optional[int]
    max_price: Optional[int]
    std_dev_price: Optional[Decimal]
    variance_price: Optional[Decimal]
    price_comment: str


class MarketListingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    car_variant_id: int
    source_name: str
    title: Optional[str] = None
    price: int
    currency: str
    model_year: Optional[int] = None
    mileage_km: Optional[int] = None
    city: Optional[str] = None
    district: Optional[str] = None
    seller_type: Optional[str] = None
    listing_date: Optional[date] = None
    url: Optional[str] = None


class ListingPositionResponse(BaseModel):
    """Pozisyon: `market_stats` ortalama ve std üzerinden z-score."""

    listing_id: int
    car_variant_id: int
    listing_price: int
    currency: str
    market_avg_price: float
    market_std_dev: float
    z_score: float
    position: Literal["cheap", "normal", "expensive"]
    explanation: str
    sample_size: int
    pct_vs_avg: Optional[float] = Field(None, description="Ortalamaya göre % fark")
