# ArabaIQ

**ArabaIQ** is a standalone product for **AI-assisted car recommendations** and **side-by-side comparison**, backed by a dedicated **FastAPI** service and a **Next.js** web app.

| Layer | Path | Stack |
|--------|------|--------|
| API | [`araba-iq-api/`](araba-iq-api/README.md) | FastAPI, PostgreSQL, SQLAlchemy 2, Alembic |
| Web | [`frontend/`](frontend/README.md) | Next.js 14, Tailwind CSS |
| Docs | [`docs/`](docs/) | Product notes, pipeline, UI/i18n |

## Quick start (local)

### 1. Database

```bash
cp .env.example .env   # optional; defaults work for local
docker compose up -d araba-iq-db
```

### 2. API

```bash
cd araba-iq-api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
PYTHONPATH=. python scripts/seed_demo.py   # demo data
uvicorn app.main:app --reload --host 0.0.0.0 --port 8100
```

- OpenAPI: [http://localhost:8100/docs](http://localhost:8100/docs)

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000) (redirects to `/tr` or `/en`)

Set `NEXT_PUBLIC_ARABAIQ_API_URL` in `frontend/.env.local` to your API base (default `http://localhost:8100/api/v1`). Configure `CORS_ORIGINS` in `araba-iq-api/.env` for your web origin.

## Repository layout

```
araba-iq-api/     # REST API (segments, cars, recommendations, compare, market)
frontend/         # Next.js UI (recommendations, compare, landing)
docs/             # Roadmap, pipeline, UI notes
docker-compose.yml
```

## License

Specify your license in the repository settings or add a `LICENSE` file when you publish.

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md).
