# Task log

## Current — ArabaIQ (Segmento) bootstrap

### Plan

- Monorepo içinde `araba-iq-api`: FastAPI, SQLAlchemy modelleri, Alembic, MVP endpoint’ler.
- PostgreSQL mevcut ADHD DB’sinden ayrı: `araba-iq-db` (port 5433).

### Checklist

- [x] `araba-iq-api` iskeleti (config, DB, modeller, Alembic `001`)
- [x] Endpoint’ler: health, segments, segment cars, cars list/detail, market stats + açıklama
- [x] `scripts/seed_demo.py` örnek veri
- [x] `docker-compose` `araba-iq-db` + kök `.env.example` + README

### Review

- `from app.main import app` ile import doğrulandı (Python 3.9 + psycopg 3).
- Tam uçtan uca test: Docker’da `araba-iq-db` açıkken `alembic upgrade head`, `PYTHONPATH=. python scripts/seed_demo.py`, `uvicorn app.main:app --port 8100` — bu ortamda Docker daemon kapalı olduğu için çalıştırılamadı.

---

## Archive

_(Önceki boş şablon kaldırıldı.)_
