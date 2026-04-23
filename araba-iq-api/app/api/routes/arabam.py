"""
arabam.py — arabam.com scraper route (fiyat hariç)

POST /api/v1/arabam/search
    → İlan listesi + yıl/model/metrik bazlı gruplanmış özet döner.
    Fiyat alanı bilinçli olarak çıkarılmıştır.

GET  /api/v1/arabam/search
    → Hızlı sorgu için query-param versiyonu.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.schemas.arabam import ArabamSearchRequest, ArabamSearchResponse
from app.services.arabam_service import search_arabam

router = APIRouter(prefix="/arabam", tags=["arabam"])


@router.post(
    "/search",
    response_model=ArabamSearchResponse,
    summary="arabam.com ilan ara (fiyat hariç)",
)
async def arabam_search_post(req: ArabamSearchRequest) -> ArabamSearchResponse:
    """
    arabam.com'dan ilan çeker ve yıl/model/yakıt/vites/renk/şehir/km bandı
    metriklerine göre gruplanmış özet üretir. **Fiyat alanı döndürülmez.**

    `category_slug` örnekleri:
    - `"ikinci-el/otomobil"` → tüm ikinci el otomobiller (default)
    - `"ikinci-el/otomobil-toyota-corolla"` → Toyota Corolla
    - `"ikinci-el/otomobil-bmw-3-serisi"` → BMW 3 Serisi

    Slug'ı bulmak için arabam.com'da arama yapın, URL'deki path
    segmentini kullanın (örn. `https://www.arabam.com/ikinci-el/otomobil-bmw-3-serisi?...`
    → `ikinci-el/otomobil-bmw-3-serisi`).
    """
    try:
        return await search_arabam(req)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"arabam.com'a erişilemedi: {exc}",
        ) from exc


@router.get(
    "/search",
    response_model=ArabamSearchResponse,
    summary="arabam.com ilan ara (GET, fiyat hariç)",
)
async def arabam_search_get(
    category_slug: str = Query(
        "ikinci-el/otomobil",
        description="arabam.com kategori path'i",
    ),
    year_min: Optional[int] = Query(None),
    year_max: Optional[int] = Query(None),
    km_max: Optional[int] = Query(None),
    city: Optional[str] = Query(None),
    fuel_type: Optional[str] = Query(None),
    transmission: Optional[str] = Query(None),
    max_pages: int = Query(3, ge=1, le=10),
    sort: str = Query("date_desc"),
) -> ArabamSearchResponse:
    req = ArabamSearchRequest(
        category_slug=category_slug,
        year_min=year_min,
        year_max=year_max,
        km_max=km_max,
        city=city,
        fuel_type=fuel_type,
        transmission=transmission,
        max_pages=max_pages,
        sort=sort,
    )
    try:
        return await search_arabam(req)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"arabam.com'a erişilemedi: {exc}",
        ) from exc
