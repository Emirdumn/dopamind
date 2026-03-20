from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class CarFeature(Base):
    __tablename__ = "car_features"
    __table_args__ = (UniqueConstraint("car_variant_id", "feature_name", name="uq_car_features_variant_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    car_variant_id: Mapped[int] = mapped_column(
        ForeignKey("car_variants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    feature_category: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    feature_name: Mapped[str] = mapped_column(String(128), nullable=False)
    feature_value: Mapped[str] = mapped_column(Text, nullable=False, default="true")

    car_variant: Mapped["CarVariant"] = relationship(back_populates="features")
