# ArabaIQ API (Segmento)

**ArabaIQ** ürün adı; **Segmento** segment ve filtre motorunun kod adı. FastAPI + PostgreSQL + SQLAlchemy 2 + Alembic.

## Gereksinimler

- Python 3.9+ (öneri: 3.11+)
- PostgreSQL 16 (monorepo’da `docker compose up -d araba-iq-db`)
- Bağlantı sürücüsü: **psycopg 3** (`postgresql://` URL’leri otomatik `postgresql+psycopg://` olarak normalize edilir)

## Kurulum

```bash
cd araba-iq-api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# .env içinde DATABASE_URL (varsayılan: localhost:5433)
```

`.venv` yalnızca yerel ortamdır; kök dizindeki `.gitignore` ile repoya eklenmez ve commit edilmemelidir.

Kök dizinden veritabanı:

```bash
docker compose up -d araba-iq-db
```

Migrasyon ve örnek veri:

```bash
cd araba-iq-api
source .venv/bin/activate
alembic upgrade head
PYTHONPATH=. python scripts/seed_demo.py
```

Sunucu:

```bash
cd araba-iq-api
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8100
```

- Swagger: http://localhost:8100/docs  
- Kök: http://localhost:8100/ → `product: ArabaIQ`, `engine: Segmento`

## API (v1)

| Metod | Yol | Açıklama |
|--------|-----|----------|
| GET | `/health` | Sağlık |
| GET | `/api/v1/segments` | Segment listesi |
| GET | `/api/v1/segments/{id}/cars` | Segmentteki varyantlar |
| GET | `/api/v1/segments/{id}` | Segment detay |
| GET | `/api/v1/brands` | Markalar |
| GET | `/api/v1/brands/{id}/models` | Markaya göre modeller |
| GET | `/api/v1/models` | Modeller (`brand_id`, `segment_id`, `body_type`) |
| GET | `/api/v1/models/{id}` | Model özeti |
| GET | `/api/v1/cars` | Filtreli varyantlar (`segment_id`, `year_min`, `fuel_type`, `transmission`) |
| GET | `/api/v1/cars/{id}` | Varyant detay |
| GET | `/api/v1/cars/{car_id}/features` | Varyant donanım özellikleri (kategori, isim, değer) |
| POST | `/api/v1/cars/compare` | 2–4 araç: teknik / performans / piyasa / **donanım pivot** + özet yorumlar |
| GET | `/api/v1/market/stats/{car_variant_id}` | Piyasa özeti + `price_comment` |
| GET | `/api/v1/market/listings` | `car_variant_id` zorunlu; `city`, `seller_type`, `limit` (1–100, varsayılan 20) |
| GET | `/api/v1/market/position/{listing_id}` | **`market_stats`** ortalama/std ile z-score; `cheap`/`normal`/`expensive` + Türkçe `explanation` |
| POST | `/api/v1/scoring/fit-score` | `user_preferences` + `car_ids`. Alt skorlar 0–100; **genel skor** ağırlıklı ortalama (bütçe 20%, ekonomi 15%, şehir 10%, performans 15%, aile 10%, prestij 10%, ikinci el 10%, bakım 10%). `comfort_score` bilgi amaçlı (genel skora dahil değil). |
| POST | `/api/v1/recommendations` | Tercih + opsiyonel `required_features` / `preferred_features` (slug) + `segment_ids` + `strict_required` (varsayılan false; true ise eksik zorunlu donanımlı varyant elenir) + `include_debug` (elenen adaylar + satır `candidate_filter_reason`). **overall** ≈ 0.7×fit + 0.2×donanım + 0.1×piyasa; yakıt eşleşmesine +2. Cevapta `ranking_reason`, eşleşme sayıları. |

**`total_candidates` (UI ile aynı dil):** `segment_ids` sonrası havuzda, **bütçe ön filtresi** (ortalama fiyat, `budget_max`×1.25 üstü → elendi) ve isteğe bağlı **`strict_required`** uygulanmış **skorlanan aday sayısı**. `returned_count` = `limit` ile kesilmiş sonuç sayısı.

**Donanım slug’ları (recommendations):** `apple_carplay`, `android_auto`, `adaptive_cruise_control`, `lane_keep_assist`, `blind_spot_warning`, `sunroof`, `panoramic_roof`, `rear_camera`, `head_up_display`, `automatic_park_assistant` — tam eşleme: `app/services/car_feature_matching.py`.

**Job:** `python scripts/stats_refresh_job.py` — tüm aktif ilanlardan `market_stats` yenilenir (cron ile çalıştır).

**Seed:** `PYTHONPATH=. python scripts/seed_demo.py` — PostgreSQL’de `TRUNCATE ... RESTART IDENTITY` ile temiz demo (ilan `id` genelde 1’den başlar). Sonra isteğe bağlı `stats_refresh_job` ile stats’ı ilanlardan tazeleyebilirsin.

Test (DB ile): `pip install -r requirements-dev.txt` → `DATABASE_URL=... pytest tests/ -v`

**Frontend (Next.js):** Aynı repodaki `frontend/` uygulaması `/[locale]/recommendations` ve `/[locale]/compare` üzerinden bu API’ye bağlanır. `.env.local` → `NEXT_PUBLIC_ARABAIQ_API_URL=http://localhost:8100/api/v1`. Tarayıcı CORS için API `.env` içinde `CORS_ORIGINS` (ör. `http://localhost:3000`).

Sonraki adımlar (roadmap): `docs/araba-iq-roadmap.md` — Faz 2 kalan: fit-score++ (kullanıcı ağırlıkları, normalizasyon).

## Ortam değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | PostgreSQL bağlantısı |
| `API_V1_PREFIX` | Varsayılan `/api/v1` |
| `PROJECT_NAME` | OpenAPI başlığı |
| `SEGMENTO_TAGLINE` | Açıklama metni |
