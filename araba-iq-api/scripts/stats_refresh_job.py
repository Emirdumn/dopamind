"""
Aktif market_listings kayıtlarından market_stats özetini yeniler.

Cron örneği (her 6 saat):
  0 */6 * * * cd /path/to/araba-iq-api && .venv/bin/python scripts/stats_refresh_job.py
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.services.market_service import refresh_all_market_stats


def main() -> None:
    db = SessionLocal()
    try:
        n = refresh_all_market_stats(db)
        print(f"market_stats güncellendi, işlenen varyant sayısı: {n}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
