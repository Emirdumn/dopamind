from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class MarketListing(Base):
    __tablename__ = "market_listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    car_variant_id: Mapped[int] = mapped_column(
        ForeignKey("car_variants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_name: Mapped[str] = mapped_column(String(64), nullable=False)
    source_listing_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="TRY")
    model_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mileage_km: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    seller_type: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    painted_parts_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    changed_parts_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    accident_record_amount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    first_registration_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    listing_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    car_variant: Mapped["CarVariant"] = relationship(back_populates="listings")
