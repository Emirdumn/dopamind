from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class VehicleModel(Base):
    """Üretici modeli (ör. Corolla). Tablo adı: models."""

    __tablename__ = "models"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id", ondelete="CASCADE"), nullable=False, index=True)
    segment_id: Mapped[int] = mapped_column(ForeignKey("segments.id", ondelete="RESTRICT"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    body_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    start_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    brand: Mapped["Brand"] = relationship(back_populates="models")
    segment: Mapped["Segment"] = relationship(back_populates="models")
    variants: Mapped[list["CarVariant"]] = relationship(back_populates="vehicle_model")
