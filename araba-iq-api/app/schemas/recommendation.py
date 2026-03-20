from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.schemas.scoring import UserPreferencesIn


class RecommendationRequest(BaseModel):
    """Fit-score öncelikleri ile uyumlu tercihler + opsiyonel donanım slug’ları."""

    budget_max: float = Field(..., ge=0, description="TL üst bütçe")
    fuel_preference: Optional[str] = None
    city_usage_ratio: int = Field(50, ge=0, le=100)
    performance_priority: int = Field(5, ge=1, le=10)
    economy_priority: int = Field(5, ge=1, le=10)
    comfort_priority: int = Field(5, ge=1, le=10)
    family_priority: int = Field(5, ge=1, le=10)
    prestige_priority: int = Field(5, ge=1, le=10)
    resale_priority: int = Field(5, ge=1, le=10)
    maintenance_sensitivity: int = Field(5, ge=1, le=10)
    required_features: list[str] = Field(default_factory=list)
    preferred_features: list[str] = Field(default_factory=list)
    segment_ids: list[int] = Field(default_factory=list)
    strict_required: bool = Field(
        False,
        description="True ise zorunlu donanımı eksik varyantlar aday dışı bırakılır.",
    )
    include_debug: bool = Field(
        False,
        description="True ise elenen adaylar ve satır bazlı aday filtresi özeti döner (geliştirici / iç araçlar).",
    )
    limit: int = Field(10, ge=1, le=50)

    @field_validator("fuel_preference", mode="before")
    @classmethod
    def empty_fuel_to_none(cls, v: object) -> object:
        if v == "":
            return None
        return v

    def to_user_preferences(self) -> UserPreferencesIn:
        return UserPreferencesIn(
            budget_max=self.budget_max,
            fuel_preference=self.fuel_preference,
            city_usage_ratio=self.city_usage_ratio,
            performance_priority=self.performance_priority,
            economy_priority=self.economy_priority,
            comfort_priority=self.comfort_priority,
            family_priority=self.family_priority,
            prestige_priority=self.prestige_priority,
            resale_priority=self.resale_priority,
            maintenance_sensitivity=self.maintenance_sensitivity,
        )


class PriceSummary(BaseModel):
    avg_price: Optional[int] = None
    sample_size: int = 0
    price_comment: str


class RecommendationItem(BaseModel):
    car_id: int
    car_name: str
    overall_score: float
    fit_score: float
    feature_match_score: float
    market_score: float
    matched_required_features: list[str]
    matched_preferred_features: list[str]
    matched_required_count: int = Field(description="required_features ile eşleşen slug sayısı")
    matched_preferred_count: int = Field(description="preferred_features ile eşleşen slug sayısı")
    missing_required_features: list[str]
    ranking_reason: str = Field(description="Bu sıralamayı özetleyen tek cümle")
    candidate_filter_reason: Optional[str] = Field(
        None,
        description="include_debug=true iken: bu satırın ön filtreleri geçtiğine dair kısa not",
    )
    price_summary: PriceSummary
    reasons: list[str]
    cautions: list[str]


class ExcludedCandidate(BaseModel):
    car_id: int
    car_name: str
    reason: str


class RecommendationResponse(BaseModel):
    """total_candidates: bütçe + (isteğe bağlı) strict_required sonrası skorlanan havuz boyutu."""

    total_candidates: int
    returned_count: int
    results: list[RecommendationItem]
    excluded_candidates: Optional[list[ExcludedCandidate]] = Field(
        None,
        description="include_debug=true iken elenen varyantlar ve gerekçe",
    )
