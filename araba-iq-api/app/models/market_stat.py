from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class MarketStat(Base):
    __tablename__ = "market_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    car_variant_id: Mapped[int] = mapped_column(
        ForeignKey("car_variants.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    sample_size: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    avg_price: Mapped[Optional[float]] = mapped_column(Numeric(14, 2), nullable=True)
    median_price: Mapped[Optional[float]] = mapped_column(Numeric(14, 2), nullable=True)
    min_price: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_price: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    std_dev_price: Mapped[Optional[float]] = mapped_column(Numeric(14, 2), nullable=True)
    variance_price: Mapped[Optional[float]] = mapped_column(Numeric(20, 2), nullable=True)
    avg_mileage: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    price_mileage_corr: Mapped[Optional[float]] = mapped_column(Numeric(6, 4), nullable=True)
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    car_variant: Mapped["CarVariant"] = relationship(back_populates="market_stat")
