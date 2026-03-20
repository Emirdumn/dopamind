from pydantic import BaseModel, ConfigDict


class CarFeatureRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    car_variant_id: int
    feature_category: str
    feature_name: str
    feature_value: str
