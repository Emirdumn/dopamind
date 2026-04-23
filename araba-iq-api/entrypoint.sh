#!/usr/bin/env sh
set -e

# ── ArabaIQ API container entrypoint ─────────────────────────────────
# Runs each container start:
#   1. Wait for Postgres to accept connections
#   2. Apply Alembic migrations (idempotent — safe to re-run)
#   3. Boot uvicorn on 0.0.0.0:8100
#
# DATABASE_URL is provided by docker compose (.env.production / compose
# service env). We never bake it into the image.

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "▶ Waiting for Postgres to become ready…"
# Poll up to 30 × 1s = 30s before giving up. Using Python so we don't need
# to install pg_isready inside the slim image.
python - <<'PY'
import os, sys, time
from urllib.parse import urlparse
import socket

url = urlparse(os.environ["DATABASE_URL"].replace("postgresql+psycopg://", "postgresql://"))
host, port = url.hostname, url.port or 5432
for i in range(30):
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"  ✓ {host}:{port} reachable")
            sys.exit(0)
    except OSError:
        time.sleep(1)
print(f"  ✗ Postgres at {host}:{port} not reachable after 30s", file=sys.stderr)
sys.exit(1)
PY

echo "▶ Applying Alembic migrations…"
alembic upgrade head

echo "▶ Starting uvicorn on 0.0.0.0:8100"
exec uvicorn app.main:app --host 0.0.0.0 --port 8100 --proxy-headers --forwarded-allow-ips='*'
