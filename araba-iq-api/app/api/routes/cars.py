from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.car_feature import CarFeature
from app.models.car_variant import CarVariant
from app.models.vehicle_model import VehicleModel
from app.schemas.car import CarVariantRead
from app.schemas.car_feature import CarFeatureRead
from app.schemas.compare import CarCompareRequest, CarCompareResponse
from app.services.comparison_service import build_compare_response

router = APIRouter(prefix="/cars", tags=["cars"])


def _enrich(variant: CarVariant) -> CarVariantRead:
    vm = variant.vehicle_model
    return CarVariantRead(
        id=variant.id,
        model_id=variant.model_id,
        trim_name=variant.trim_name,
        year=variant.year,
        fuel_type=variant.fuel_type,
        transmission=variant.transmission,
        brand_name=vm.brand.name if vm and vm.brand else None,
        model_name=vm.name if vm else None,
    )


@router.post("/compare", response_model=CarCompareResponse)
def compare_cars(payload: CarCompareRequest, db: Session = Depends(get_db)) -> CarCompareResponse:
    try:
        return build_compare_response(db, payload.car_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("", response_model=list[CarVariantRead])
def list_cars(
    db: Session = Depends(get_db),
    segment_id: Optional[int] = Query(None, description="Segmento: segment filtresi"),
    year_min: Optional[int] = None,
    fuel_type: Optional[str] = None,
    transmission: Optional[str] = None,
    search: Optional[str] = Query(None, description="Brand/model/trim free-text search"),
) -> list[CarVariantRead]:
    from app.models.brand import Brand

    stmt = (
        select(CarVariant)
        .join(VehicleModel, CarVariant.model_id == VehicleModel.id)
        .join(Brand, VehicleModel.brand_id == Brand.id)
        .options(selectinload(CarVariant.vehicle_model).selectinload(VehicleModel.brand))
    )
    if segment_id is not None:
        stmt = stmt.where(VehicleModel.segment_id == segment_id)
    if year_min is not None:
        stmt = stmt.where(CarVariant.year >= year_min)
    if fuel_type:
        stmt = stmt.where(CarVariant.fuel_type == fuel_type)
    if transmission:
        stmt = stmt.where(CarVariant.transmission == transmission)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            Brand.name.ilike(like)
            | VehicleModel.name.ilike(like)
            | CarVariant.trim_name.ilike(like)
        )
    stmt = stmt.order_by(CarVariant.year.desc(), CarVariant.id)
    return [_enrich(v) for v in db.scalars(stmt).all()]


@router.get("/{car_id}/features", response_model=list[CarFeatureRead])
def list_car_features(car_id: int, db: Session = Depends(get_db)) -> list[CarFeature]:
    car = db.get(CarVariant, car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Araç varyantı bulunamadı")
    stmt = (
        select(CarFeature)
        .where(CarFeature.car_variant_id == car_id)
        .order_by(CarFeature.feature_category, CarFeature.feature_name)
    )
    return list(db.scalars(stmt).all())


@router.get("/{car_id}", response_model=CarVariantRead)
def get_car(car_id: int, db: Session = Depends(get_db)) -> CarVariantRead:
    from app.models.brand import Brand  # noqa: F811

    stmt = (
        select(CarVariant)
        .where(CarVariant.id == car_id)
        .options(selectinload(CarVariant.vehicle_model).selectinload(VehicleModel.brand))
    )
    car = db.scalars(stmt).first()
    if car is None:
        raise HTTPException(status_code=404, detail="Araç varyantı bulunamadı")
    return _enrich(car)
