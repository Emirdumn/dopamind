from typing import Optional

from pydantic import BaseModel, ConfigDict


class CarVariantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    model_id: int
    trim_name: str
    year: int
    fuel_type: Optional[str]
    transmission: Optional[str]
