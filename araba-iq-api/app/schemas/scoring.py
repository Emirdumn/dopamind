from typing import Optional

from pydantic import BaseModel, Field, field_validator


class UserPreferencesIn(BaseModel):
    budget_max: Optional[float] = Field(None, ge=0, description="TL cinsinden üst bütçe")
    budget_min: Optional[float] = Field(None, ge=0)
    fuel_preference: Optional[str] = None
    transmission_preference: Optional[str] = None
    city_usage_ratio: int = Field(50, ge=0, le=100)
    long_trip_ratio: Optional[int] = Field(None, ge=0, le=100)
    performance_priority: int = Field(5, ge=1, le=10)
    economy_priority: int = Field(5, ge=1, le=10)
    comfort_priority: int = Field(5, ge=1, le=10)
    prestige_priority: int = Field(5, ge=1, le=10)
    family_priority: int = Field(5, ge=1, le=10)
    resale_priority: int = Field(5, ge=1, le=10)
    maintenance_sensitivity: int = Field(5, ge=1, le=10)

    @field_validator("fuel_preference", "transmission_preference", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: object) -> object:
        if v == "":
            return None
        return v


class FitScoreRequest(BaseModel):
    user_preferences: UserPreferencesIn
    car_ids: list[int] = Field(..., min_length=1, max_length=20)


class FitScoreItem(BaseModel):
    car_variant_id: int
    display_name: str
    overall_score: float = Field(description="8 boyutun ağırlıklı ortalaması (0–100)")
    budget_score: float
    economy_score: float
    city_usage_score: float
    performance_score: float
    comfort_score: float = Field(
        description="Şanzıman/koltuk/bagaj proxy’si; genel skora ağırlıkla dahil değil"
    )
    family_score: float
    prestige_score: float
    resale_score: float
    maintenance_score: float
    explanation: str


class FitScoreResponse(BaseModel):
    results: list[FitScoreItem]
