from typing import Optional

from pydantic import BaseModel, ConfigDict


class SegmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category_type: str
    description: Optional[str]
