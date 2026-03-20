from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.brand import Brand
from app.models.vehicle_model import VehicleModel
from app.schemas.brand import BrandRead, VehicleModelBrief

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("", response_model=list[BrandRead])
def list_brands(db: Session = Depends(get_db)) -> list[Brand]:
    return list(db.scalars(select(Brand).where(Brand.is_active.is_(True)).order_by(Brand.name)).all())


@router.get("/{brand_id}/models", response_model=list[VehicleModelBrief])
def list_brand_models(brand_id: int, db: Session = Depends(get_db)) -> list[VehicleModel]:
    if db.get(Brand, brand_id) is None:
        raise HTTPException(status_code=404, detail="Marka bulunamadı")
    stmt = select(VehicleModel).where(VehicleModel.brand_id == brand_id).order_by(VehicleModel.name)
    return list(db.scalars(stmt).all())
