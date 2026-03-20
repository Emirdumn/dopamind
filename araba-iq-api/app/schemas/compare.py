from typing import Any, Optional

from pydantic import BaseModel, Field


class CarCompareRequest(BaseModel):
    car_ids: list[int] = Field(..., min_length=2, max_length=4)


class CompareMarketSlice(BaseModel):
    sample_size: Optional[int] = None
    avg_price: Optional[float] = None
    median_price: Optional[float] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    std_dev_price: Optional[float] = None


class CompareCarBlock(BaseModel):
    car_variant_id: int
    display_name: str
    brand: str
    model: str
    segment: str
    trim_name: str
    year: int
    technical: dict[str, Optional[Any]]
    performance: dict[str, Optional[Any]]
    market: Optional[CompareMarketSlice] = None


class CarCompareResponse(BaseModel):
    cars: list[CompareCarBlock]
    technical_comparison: dict[str, dict[str, Optional[Any]]]
    performance_comparison: dict[str, dict[str, Optional[Any]]]
    market_comparison: dict[str, dict[str, Optional[Any]]]
    equipment_comparison: dict[str, Any]
    summary_comments: list[str]
