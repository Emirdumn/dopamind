from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.segment import Segment
from app.models.car_variant import CarVariant
from app.models.vehicle_model import VehicleModel
from app.schemas.car import CarVariantRead
from app.schemas.segment import SegmentRead

router = APIRouter(prefix="/segments", tags=["segments"])


@router.get("", response_model=list[SegmentRead])
def list_segments(db: Session = Depends(get_db)) -> list[Segment]:
    return list(db.scalars(select(Segment).order_by(Segment.name)).all())


@router.get("/{segment_id}/cars", response_model=list[CarVariantRead])
def list_cars_in_segment(segment_id: int, db: Session = Depends(get_db)) -> list[CarVariant]:
    if db.get(Segment, segment_id) is None:
        raise HTTPException(status_code=404, detail="Segment bulunamadı")
    stmt = (
        select(CarVariant)
        .join(VehicleModel, CarVariant.model_id == VehicleModel.id)
        .where(VehicleModel.segment_id == segment_id)
        .order_by(CarVariant.year.desc(), CarVariant.id)
    )
    return list(db.scalars(stmt).all())


@router.get("/{segment_id}", response_model=SegmentRead)
def get_segment(segment_id: int, db: Session = Depends(get_db)) -> Segment:
    seg = db.get(Segment, segment_id)
    if seg is None:
        raise HTTPException(status_code=404, detail="Segment bulunamadı")
    return seg
