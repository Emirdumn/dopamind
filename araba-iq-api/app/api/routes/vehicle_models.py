from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.vehicle_model import VehicleModel
from app.schemas.brand import VehicleModelBrief

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=list[VehicleModelBrief])
def list_models(
    db: Session = Depends(get_db),
    brand_id: Optional[int] = Query(None),
    segment_id: Optional[int] = Query(None),
    body_type: Optional[str] = Query(None),
) -> list[VehicleModel]:
    stmt = select(VehicleModel)
    if brand_id is not None:
        stmt = stmt.where(VehicleModel.brand_id == brand_id)
    if segment_id is not None:
        stmt = stmt.where(VehicleModel.segment_id == segment_id)
    if body_type:
        stmt = stmt.where(VehicleModel.body_type == body_type)
    stmt = stmt.order_by(VehicleModel.name)
    return list(db.scalars(stmt).all())


@router.get("/{model_id}", response_model=VehicleModelBrief)
def get_model(model_id: int, db: Session = Depends(get_db)) -> VehicleModel:
    m = db.get(VehicleModel, model_id)
    if m is None:
        raise HTTPException(status_code=404, detail="Model bulunamadı")
    return m
