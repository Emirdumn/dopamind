from __future__ import annotations

from typing import Optional

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Segment(Base):
    __tablename__ = "segments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    category_type: Mapped[str] = mapped_column(String(32), nullable=False, default="technical")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    models: Mapped[list["VehicleModel"]] = relationship(back_populates="segment")
