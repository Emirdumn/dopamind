from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.car_variant import CarVariant
from app.models.market_stat import MarketStat
from app.schemas.market import ListingPositionResponse, MarketListingRead, MarketStatsRead
from app.services.explanation_service import market_price_comment
from app.services.market_position_service import get_listing_position as resolve_listing_position
from app.services.market_service import list_listings

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/listings", response_model=list[MarketListingRead])
def get_market_listings(
    car_variant_id: int = Query(..., description="Araç varyantı"),
    city: Optional[str] = Query(None),
    seller_type: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list:
    if db.get(CarVariant, car_variant_id) is None:
        raise HTTPException(status_code=404, detail="Araç varyantı bulunamadı")
    return list_listings(db, car_variant_id, city=city, seller_type=seller_type, limit=limit)


@router.get("/position/{listing_id}", response_model=ListingPositionResponse)
def get_listing_position_route(listing_id: int, db: Session = Depends(get_db)) -> ListingPositionResponse:
    data, err = resolve_listing_position(db, listing_id)
    if err == "LISTING_NOT_FOUND":
        raise HTTPException(status_code=404, detail="İlan bulunamadı.")
    if err == "LISTING_INACTIVE":
        raise HTTPException(status_code=404, detail="İlan aktif değil.")
    if err == "MARKET_STATS_NOT_FOUND":
        raise HTTPException(status_code=404, detail="Bu ilanın aracı için piyasa istatistiği bulunamadı.")
    if err == "INVALID_MARKET_AVG":
        raise HTTPException(status_code=400, detail="Geçersiz piyasa ortalaması.")
    assert data is not None
    return ListingPositionResponse(**data)


@router.get("/stats/{car_variant_id}", response_model=MarketStatsRead)
def get_market_stats(car_variant_id: int, db: Session = Depends(get_db)) -> MarketStatsRead:
    if db.get(CarVariant, car_variant_id) is None:
        raise HTTPException(status_code=404, detail="Araç varyantı bulunamadı")
    stat = db.scalars(select(MarketStat).where(MarketStat.car_variant_id == car_variant_id)).one_or_none()
    if stat is None:
        raise HTTPException(status_code=404, detail="Bu varyant için piyasa istatistiği henüz yok")

    comment = market_price_comment(
        sample_size=stat.sample_size,
        std_dev_price=stat.std_dev_price if stat.std_dev_price is not None else None,
        avg_price=Decimal(str(stat.avg_price)) if stat.avg_price is not None else None,
    )
    return MarketStatsRead(
        car_variant_id=stat.car_variant_id,
        sample_size=stat.sample_size,
        avg_price=stat.avg_price,
        median_price=stat.median_price,
        min_price=stat.min_price,
        max_price=stat.max_price,
        std_dev_price=stat.std_dev_price,
        variance_price=stat.variance_price,
        price_comment=comment,
    )
