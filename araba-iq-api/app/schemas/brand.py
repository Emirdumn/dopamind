from typing import Optional

from pydantic import BaseModel, ConfigDict


class BrandRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    country: Optional[str]
    is_active: bool


class VehicleModelBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    brand_id: int
    segment_id: int
    name: str
    body_type: Optional[str]
