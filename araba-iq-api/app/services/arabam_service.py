"""
arabam_service.py
─────────────────────────────────────────────────────────────
arabam.com ilan scraper servisi (fiyat hariç).

Yöntem: Playwright (headless Chromium) + BeautifulSoup HTML parser.
Arabam.com bot koruması uyguladığından (403 on plain HTTP), Playwright
gerçek bir browser çalıştırarak sayfayı render ettirir.

Kullanıcı talebi: ilanları fiyat dışında tüm metriklerle (yıl, model,
marka, km, yakıt, vites, renk, şehir, ilçe, ilan tarihi) çekmek ve
her metriğe göre gruplanmış özet üretmek.
"""

from __future__ import annotations

import asyncio
import re
from collections import Counter, defaultdict
from typing import Optional
from urllib.parse import urlencode

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

from app.schemas.arabam import (
    ArabamBucket,
    ArabamGroupings,
    ArabamListing,
    ArabamSearchRequest,
    ArabamSearchResponse,
)

BASE_URL = "https://www.arabam.com"
PAGE_SIZE = 50

# Yakıt tipi normalizasyon tablosu
_FUEL_MAP: dict[str, str] = {
    "benzin": "Benzin",
    "dizel": "Dizel",
    "lpg": "LPG",
    "lpg & benzin": "LPG",
    "lpg&benzin": "LPG",
    "elektrik": "Elektrik",
    "elektrikli": "Elektrik",
    "hibrit": "Hibrit",
    "hybrid": "Hibrit",
}

_TRANS_MAP: dict[str, str] = {
    "manuel": "Manuel",
    "düz": "Manuel",
    "duz": "Manuel",
    "otomatik": "Otomatik",
    "yarı otomatik": "Yarı Otomatik",
    "yari otomatik": "Yarı Otomatik",
}

_CITY_CORRECTIONS: dict[str, str] = {
    "i̇stanbul": "İstanbul",
    "istanbul": "İstanbul",
    "i̇zmir": "İzmir",
    "izmir": "İzmir",
    "ankara": "Ankara",
}


# ─── Küçük yardımcılar ───────────────────────────────────────────────
def _digits(text: str) -> Optional[int]:
    cleaned = re.sub(r"[^\d]", "", text or "")
    return int(cleaned) if cleaned else None


def _parse_year(text: str) -> Optional[int]:
    m = re.search(r"\b(19|20)\d{2}\b", text or "")
    return int(m.group()) if m else None


def _parse_km(text: str) -> Optional[int]:
    """'125.000 km' veya '125000' gibi değerleri parse et."""
    if not text:
        return None
    return _digits(text)


def _normalize_fuel(text: str) -> Optional[str]:
    if not text:
        return None
    return _FUEL_MAP.get(text.strip().lower())


def _normalize_trans(text: str) -> Optional[str]:
    if not text:
        return None
    return _TRANS_MAP.get(text.strip().lower())


def _normalize_city(raw: str) -> Optional[str]:
    if not raw:
        return None
    low = raw.strip().lower()
    return _CITY_CORRECTIONS.get(low, raw.strip().title())


def _split_brand_model(title: str) -> tuple[Optional[str], Optional[str]]:
    """
    Başlıktan marka ve model çıkar.
    Arabam.com ilan başlıkları genelde "Brand Model ..." formatında.
    İlk kelime → marka, ikinci kelime → model (kısa varyasyon).
    """
    if not title:
        return None, None
    parts = title.strip().split()
    brand = parts[0] if parts else None
    model = parts[1] if len(parts) > 1 else None
    return brand, model


# ─── HTML parser ─────────────────────────────────────────────────────
def _parse_listings_page(html: str) -> list[ArabamListing]:
    """
    Arabam.com arama sonuç sayfasını parse et.

    Arabam tipik olarak şu yapıyı kullanır (küçük varyasyonlarla):
        <table id="listing-table">
          <tbody>
            <tr data-id="..." class="listing-list-item ...">
              <td class="listing-modelName"> ... </td>
              <td class="listing-title-cell"> <a href="/ilan/..." title="..."> title </a> </td>
              <td class="listing-text"> {year} </td>
              <td class="listing-text"> {km} </td>
              <td class="listing-text"> {color} </td>
              <td class="listing-price"> {price} </td>  # atlanıyor
              <td class="listing-text"> {date} </td>
              <td class="listing-text"> {city / district} </td>
            </tr>
    Yapı değiştiyse esnek fallback ile devam ederiz.
    """
    soup = BeautifulSoup(html, "lxml")
    results: list[ArabamListing] = []

    rows = soup.select("tr[data-id]")
    if not rows:
        # Fallback: listing-list-item sınıfıyla
        rows = soup.select("tr.listing-list-item, tbody tr")

    for row in rows:
        try:
            listing = _parse_row(row)
            if listing and listing.title:
                results.append(listing)
        except Exception:
            continue

    return results


def _parse_row(row) -> Optional[ArabamListing]:
    ad_id = row.get("data-id") or None

    # ── Başlık ve URL ──
    a_tag = row.find("a", href=re.compile(r"/ilan/"))
    if not a_tag:
        a_tag = row.find("a")
    title = (a_tag.get("title") or a_tag.get_text(strip=True)) if a_tag else ""
    href = a_tag.get("href", "") if a_tag else ""
    url = (BASE_URL + href) if href.startswith("/") else (href or None)

    if not title:
        return None

    brand, model = _split_brand_model(title)

    # ── Hücreleri topla ──
    cells = [c.get_text(" ", strip=True) for c in row.find_all("td")]

    # Boş ve sayısal olmayan hücreleri ayıkla — fiyat hücresini atlamak için
    # en temiz yol: regex ile yıl, km, renk, tarih, konum alanlarını bulmak.
    year: Optional[int] = None
    km: Optional[int] = None
    color: Optional[str] = None
    fuel: Optional[str] = None
    trans: Optional[str] = None
    listed_at: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None

    _COLOR_WORDS = {
        "beyaz", "siyah", "gri", "füme", "fume", "gümüş", "gumus", "kırmızı",
        "kirmizi", "mavi", "yeşil", "yesil", "sarı", "sari", "kahverengi",
        "bordo", "turuncu", "lacivert", "mor", "pembe", "bej", "turkuaz",
        "şampanya", "sampanya",
    }

    for cell in cells:
        low = cell.lower()

        # Yıl
        if year is None:
            y = _parse_year(cell)
            if y:
                year = y
                continue

        # KM — "125.000 km" veya 4–7 haneli saf sayı
        if km is None:
            km_match = re.match(r"^\s*[\d.,]{2,}\s*(km)?\s*$", low) or (
                "km" in low and re.search(r"\d", low)
            )
            if km_match and "tl" not in low and "₺" not in low and "$" not in low:
                val = _digits(cell)
                if val is not None and 0 < val < 2_000_000:
                    km = val
                    continue

        # Renk
        if color is None:
            for w in _COLOR_WORDS:
                if re.search(rf"\b{re.escape(w)}\b", low):
                    color = w.title()
                    break
            if color:
                continue

        # Yakıt
        if fuel is None:
            f = _normalize_fuel(cell)
            if f:
                fuel = f
                continue

        # Vites
        if trans is None:
            t = _normalize_trans(cell)
            if t:
                trans = t
                continue

        # Tarih: "12 Ocak 2025" veya "01.12.2024" gibi
        if listed_at is None:
            if re.search(
                r"\b\d{1,2}[./\s-](ocak|şubat|subat|mart|nisan|mayıs|mayis|"
                r"haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|"
                r"aralık|aralik|\d{1,2})[./\s-]\d{2,4}\b",
                low,
            ):
                listed_at = cell
                continue

        # Konum: "İstanbul / Kadıköy" veya tek kelime şehir
        if city is None and "/" in cell:
            parts = [p.strip() for p in cell.split("/")]
            if len(parts) == 2 and all(1 < len(p) < 25 for p in parts):
                city = _normalize_city(parts[0])
                district = parts[1]

    # Konum tek hücrede değilse son hücreyi dene
    if city is None and cells:
        last = cells[-1]
        if "/" in last:
            parts = [p.strip() for p in last.split("/")]
            if len(parts) == 2:
                city = _normalize_city(parts[0])
                district = parts[1]

    # Satıcı tipi
    seller_type: Optional[str] = None
    if row.find(class_=re.compile(r"galeri|store|gallery", re.I)):
        seller_type = "galeri"
    elif row.find(class_=re.compile(r"sahibinden|owner", re.I)):
        seller_type = "sahibinden"

    return ArabamListing(
        ad_id=ad_id,
        title=title,
        brand=brand,
        model=model,
        year=year,
        km=km,
        fuel_type=fuel,
        transmission=trans,
        color=color,
        city=city,
        district=district,
        seller_type=seller_type,
        listed_at=listed_at,
        url=url,
    )


# ─── URL builder ────────────────────────────────────────────────────
_SORT_MAP = {
    "date_desc": "date_desc",
    "date_asc": "date_asc",
    "year_desc": "year_desc",
    "year_asc": "year_asc",
    "km_asc": "km_asc",
    "km_desc": "km_desc",
}


def _build_url(req: ArabamSearchRequest, page: int) -> str:
    params: dict[str, str] = {
        "take": str(PAGE_SIZE),
        "page": str(page + 1),
        "sort": _SORT_MAP.get(req.sort, "date_desc"),
    }
    if req.year_min:
        params["minYear"] = str(req.year_min)
    if req.year_max:
        params["maxYear"] = str(req.year_max)
    if req.km_max:
        params["maxKm"] = str(req.km_max)
    if req.fuel_type:
        params["fuel"] = req.fuel_type
    if req.transmission:
        params["transmission"] = req.transmission

    slug = req.category_slug.strip("/")
    return f"{BASE_URL}/{slug}?{urlencode(params)}"


# ─── Ana servis fonksiyonu ───────────────────────────────────────────
async def search_arabam(req: ArabamSearchRequest) -> ArabamSearchResponse:
    """
    arabam.com'dan ilan çek (fiyat hariç) ve gruplanmış özet üret.
    Playwright headless Chromium ile bot korumalarını geçer.
    """
    all_listings: list[ArabamListing] = []
    pages_fetched = 0

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
            ],
        )
        context = await browser.new_context(
            locale="tr-TR",
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1440, "height": 900},
            extra_http_headers={
                "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8",
            },
        )
        await context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )

        page = await context.new_page()

        try:
            for page_num in range(req.max_pages):
                url = _build_url(req, page_num)
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                    await asyncio.sleep(2)
                    try:
                        await page.wait_for_selector(
                            "tr[data-id], table#listing-table, table.listing-table",
                            timeout=10000,
                        )
                    except PlaywrightTimeout:
                        break
                except PlaywrightTimeout:
                    break

                html = await page.content()
                page_listings = _parse_listings_page(html)

                if not page_listings:
                    break

                if req.city:
                    city_lower = req.city.lower()
                    page_listings = [
                        l for l in page_listings
                        if l.city and city_lower in l.city.lower()
                    ]

                all_listings.extend(page_listings)
                pages_fetched += 1

                if len(page_listings) < PAGE_SIZE:
                    break

                if page_num < req.max_pages - 1:
                    await asyncio.sleep(1.0)

        finally:
            await browser.close()

    groupings = _compute_groupings(all_listings)
    return ArabamSearchResponse(
        query=req,
        total=len(all_listings),
        pages_fetched=pages_fetched,
        listings=all_listings,
        groupings=groupings,
    )


# ─── Gruplama ────────────────────────────────────────────────────────
def _bucket_from_groups(groups: dict[str, list[str]]) -> list[ArabamBucket]:
    """Dict'ten azalan count sıralı ArabamBucket listesi üret."""
    result = [
        ArabamBucket(key=key, count=len(ids), ad_ids=ids)
        for key, ids in groups.items()
    ]
    result.sort(key=lambda b: (-b.count, b.key))
    return result


def _km_band(km: Optional[int]) -> Optional[str]:
    if km is None:
        return None
    if km < 50_000:
        return "0-50k"
    if km < 100_000:
        return "50k-100k"
    if km < 150_000:
        return "100k-150k"
    if km < 200_000:
        return "150k-200k"
    return "200k+"


def _compute_groupings(listings: list[ArabamListing]) -> ArabamGroupings:
    by_year: dict[str, list[str]] = defaultdict(list)
    by_brand: dict[str, list[str]] = defaultdict(list)
    by_model: dict[str, list[str]] = defaultdict(list)
    by_year_model: dict[str, list[str]] = defaultdict(list)
    by_fuel: dict[str, list[str]] = defaultdict(list)
    by_trans: dict[str, list[str]] = defaultdict(list)
    by_color: dict[str, list[str]] = defaultdict(list)
    by_city: dict[str, list[str]] = defaultdict(list)
    by_km_band: dict[str, list[str]] = defaultdict(list)

    for idx, l in enumerate(listings):
        key_id = l.ad_id or f"row-{idx}"

        if l.year:
            by_year[str(l.year)].append(key_id)
        if l.brand:
            by_brand[l.brand].append(key_id)
        if l.model:
            model_full = f"{l.brand} {l.model}" if l.brand else l.model
            by_model[model_full].append(key_id)
        if l.year and (l.brand or l.model):
            ym = f"{l.year} / {l.brand or ''} {l.model or ''}".strip()
            by_year_model[ym].append(key_id)
        if l.fuel_type:
            by_fuel[l.fuel_type].append(key_id)
        if l.transmission:
            by_trans[l.transmission].append(key_id)
        if l.color:
            by_color[l.color.title()].append(key_id)
        if l.city:
            by_city[l.city].append(key_id)
        band = _km_band(l.km)
        if band:
            by_km_band[band].append(key_id)

    return ArabamGroupings(
        by_year=_bucket_from_groups(by_year),
        by_brand=_bucket_from_groups(by_brand),
        by_model=_bucket_from_groups(by_model),
        by_year_model=_bucket_from_groups(by_year_model),
        by_fuel_type=_bucket_from_groups(by_fuel),
        by_transmission=_bucket_from_groups(by_trans),
        by_color=_bucket_from_groups(by_color),
        by_city=_bucket_from_groups(by_city),
        by_km_band=_bucket_from_groups(by_km_band),
    )
