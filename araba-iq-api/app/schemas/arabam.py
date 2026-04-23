from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ArabamListing(BaseModel):
    """
    arabam.com'dan çekilen tek bir ilan.

    Not: Kullanıcı talebiyle fiyat alanı çıkarıldı — tüm diğer
    metrikler (yıl, model, marka, km, yakıt, vites, renk, şehir,
    ilçe, ilan tarihi, url) dahil edilir.
    """

    ad_id: Optional[str] = None
    title: str
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    km: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    color: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    seller_type: Optional[str] = None  # "galeri" | "sahibinden"
    listed_at: Optional[str] = None
    url: Optional[str] = None


class ArabamBucket(BaseModel):
    """Tek bir gruplama birimi (bir metrik değeri için)."""

    key: str = Field(description='Bucket anahtarı, örn. "2020", "Toyota Corolla", "Dizel"')
    count: int = Field(description="Bu bucket'taki ilan sayısı")
    ad_ids: list[str] = Field(default_factory=list, description="Bucket'taki ilan ID'leri")


class ArabamGroupings(BaseModel):
    """
    İlanların farklı metriklere göre gruplanmış özeti.
    Her grup, azalan count sırasıyla döner.
    """

    by_year: list[ArabamBucket] = Field(default_factory=list)
    by_brand: list[ArabamBucket] = Field(default_factory=list)
    by_model: list[ArabamBucket] = Field(default_factory=list)
    by_year_model: list[ArabamBucket] = Field(
        default_factory=list,
        description='"{year} / {brand} {model}" kombinasyonu',
    )
    by_fuel_type: list[ArabamBucket] = Field(default_factory=list)
    by_transmission: list[ArabamBucket] = Field(default_factory=list)
    by_color: list[ArabamBucket] = Field(default_factory=list)
    by_city: list[ArabamBucket] = Field(default_factory=list)
    by_km_band: list[ArabamBucket] = Field(
        default_factory=list,
        description="KM bandı: 0-50k, 50k-100k, 100k-150k, 150k-200k, 200k+",
    )


class ArabamSearchRequest(BaseModel):
    """arabam.com arama filtresi."""

    category_slug: str = Field(
        "ikinci-el/otomobil",
        description=(
            'arabam.com kategori path\'i. Örn. "ikinci-el/otomobil", '
            '"ikinci-el/otomobil-toyota-corolla". Arabam URL\'deki '
            '/...?... arasındaki segmenttir.'
        ),
    )
    year_min: Optional[int] = Field(None, ge=1900, le=2030)
    year_max: Optional[int] = Field(None, ge=1900, le=2030)
    km_max: Optional[int] = Field(None, ge=0, description="Maksimum kilometre")
    city: Optional[str] = Field(None, description='Şehir filtresi, örn. "İstanbul"')
    fuel_type: Optional[str] = Field(
        None, description='Yakıt: "Benzin", "Dizel", "Elektrik", "Hibrit", "LPG"'
    )
    transmission: Optional[str] = Field(
        None, description='Vites: "Manuel", "Otomatik"'
    )
    max_pages: int = Field(
        3,
        ge=1,
        le=10,
        description="Çekilecek maksimum sayfa sayısı (1 sayfa ~ 20 ilan)",
    )
    sort: str = Field(
        "date_desc",
        description='Sıralama: "date_desc", "date_asc", "year_desc", "year_asc", "km_asc", "km_desc"',
    )


class ArabamSearchResponse(BaseModel):
    """arabam.com arama sonucu — ilanlar + gruplanmış özet (fiyat hariç)."""

    query: ArabamSearchRequest
    total: int = Field(description="Çekilen toplam ilan sayısı")
    pages_fetched: int
    listings: list[ArabamListing]
    groupings: ArabamGroupings
    source: str = "arabam.com"
