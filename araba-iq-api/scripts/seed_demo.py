"""
Demo verisi: mevcut ArabaIQ tablolarını temizler, marka/model/varyant/ilan/stats yükler.
Tekrar çalıştırılabilir (idempotent reset).
"""

from __future__ import annotations

import os
import sys
from datetime import date, datetime, timezone
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text

from app.core.database import SessionLocal
from app.models.brand import Brand
from app.models.car_feature import CarFeature
from app.models.car_variant import CarVariant
from app.models.market_listing import MarketListing
from app.models.market_stat import MarketStat
from app.models.segment import Segment
from app.models.vehicle_model import VehicleModel


def reset_and_seed() -> None:
    db = SessionLocal()
    try:
        # SERIAL id’leri 1’den başlat (curl örnekleri için)
        db.execute(
            text(
                "TRUNCATE market_stats, market_listings, car_features, car_variants, models, "
                "segments, brands RESTART IDENTITY CASCADE"
            )
        )
        db.commit()

        toyota = Brand(name="Toyota", country="Japan", is_active=True)
        nissan = Brand(name="Nissan", country="Japan", is_active=True)
        hyundai = Brand(name="Hyundai", country="South Korea", is_active=True)
        bmw = Brand(name="BMW", country="Germany", is_active=True)
        db.add_all([toyota, nissan, hyundai, bmw])
        db.flush()

        c_suv = Segment(
            name="C-SUV",
            category_type="technical",
            description="Compact SUV",
        )
        premium_sedan = Segment(
            name="Premium Sedan",
            category_type="technical",
            description="Premium sedan class",
        )
        db.add_all([c_suv, premium_sedan])
        db.flush()

        m_cc = VehicleModel(
            brand_id=toyota.id,
            segment_id=c_suv.id,
            name="Corolla Cross",
            body_type="SUV",
            start_year=2020,
            end_year=None,
        )
        m_qa = VehicleModel(
            brand_id=nissan.id,
            segment_id=c_suv.id,
            name="Qashqai",
            body_type="SUV",
            start_year=2021,
            end_year=None,
        )
        m_tu = VehicleModel(
            brand_id=hyundai.id,
            segment_id=c_suv.id,
            name="Tucson",
            body_type="SUV",
            start_year=2021,
            end_year=None,
        )
        m_320 = VehicleModel(
            brand_id=bmw.id,
            segment_id=premium_sedan.id,
            name="320i",
            body_type="Sedan",
            start_year=2020,
            end_year=None,
        )
        db.add_all([m_cc, m_qa, m_tu, m_320])
        db.flush()

        corolla_cross = CarVariant(
            model_id=m_cc.id,
            trim_name="1.8 Hybrid Flame e-CVT",
            year=2024,
            fuel_type="Hybrid",
            transmission="e-CVT",
            horsepower=140,
            combined_fuel_consumption=Decimal("5.1"),
            luggage_capacity=436,
            seat_count=5,
            zero_to_hundred=Decimal("9.9"),
        )
        qashqai = CarVariant(
            model_id=m_qa.id,
            trim_name="1.3 DIG-T Xtronic",
            year=2024,
            fuel_type="Benzin",
            transmission="CVT",
            horsepower=158,
            combined_fuel_consumption=Decimal("6.7"),
            luggage_capacity=504,
            seat_count=5,
            zero_to_hundred=Decimal("9.2"),
        )
        tucson = CarVariant(
            model_id=m_tu.id,
            trim_name="1.6 T-GDI Comfort",
            year=2024,
            fuel_type="Benzin",
            transmission="Automatic",
            horsepower=180,
            combined_fuel_consumption=Decimal("7.2"),
            luggage_capacity=558,
            seat_count=5,
            zero_to_hundred=Decimal("8.8"),
        )
        bmw_320i = CarVariant(
            model_id=m_320.id,
            trim_name="M Sport",
            year=2024,
            fuel_type="Benzin",
            transmission="Automatic",
            horsepower=170,
            combined_fuel_consumption=Decimal("6.4"),
            luggage_capacity=480,
            seat_count=5,
            zero_to_hundred=Decimal("7.6"),
        )
        db.add_all([corolla_cross, qashqai, tucson, bmw_320i])
        db.flush()

        def feat(
            variant: CarVariant,
            category: str,
            name: str,
            value: str = "true",
        ) -> CarFeature:
            return CarFeature(
                car_variant_id=variant.id,
                feature_category=category,
                feature_name=name,
                feature_value=value,
            )

        # Aynı feature_name tüm varyantlarda kıyas için tekrarlanır
        feature_specs: list[tuple[CarVariant, str, str, str]] = []
        for v, specs in (
            (
                corolla_cross,
                (
                    ("multimedya", "Apple CarPlay", "true"),
                    ("multimedya", "Android Auto", "true"),
                    ("güvenlik", "Adaptif hız sabitleyici", "true"),
                    ("güvenlik", "Şerit takip asistanı", "true"),
                    ("güvenlik", "Kör nokta uyarısı", "false"),
                    ("konfor", "Sunroof", "false"),
                    ("konfor", "Panoramik cam tavan", "false"),
                    ("güvenlik", "Geri görüş kamerası", "true"),
                    ("konfor", "Head-up display", "false"),
                    ("güvenlik", "Otomatik park asistanı", "false"),
                ),
            ),
            (
                qashqai,
                (
                    ("multimedya", "Apple CarPlay", "true"),
                    ("multimedya", "Android Auto", "true"),
                    ("güvenlik", "Adaptif hız sabitleyici", "true"),
                    ("güvenlik", "Şerit takip asistanı", "true"),
                    ("güvenlik", "Kör nokta uyarısı", "true"),
                    ("konfor", "Sunroof", "true"),
                    ("konfor", "Panoramik cam tavan", "false"),
                    ("güvenlik", "Geri görüş kamerası", "true"),
                    ("konfor", "Head-up display", "false"),
                    ("güvenlik", "Otomatik park asistanı", "false"),
                ),
            ),
            (
                tucson,
                (
                    ("multimedya", "Apple CarPlay", "true"),
                    ("multimedya", "Android Auto", "true"),
                    ("güvenlik", "Adaptif hız sabitleyici", "true"),
                    ("güvenlik", "Şerit takip asistanı", "true"),
                    ("güvenlik", "Kör nokta uyarısı", "true"),
                    ("konfor", "Sunroof", "false"),
                    ("konfor", "Panoramik cam tavan", "true"),
                    ("güvenlik", "Geri görüş kamerası", "true"),
                    ("konfor", "Head-up display", "false"),
                    ("güvenlik", "Otomatik park asistanı", "false"),
                ),
            ),
            (
                bmw_320i,
                (
                    ("multimedya", "Apple CarPlay", "true"),
                    ("multimedya", "Android Auto", "true"),
                    ("güvenlik", "Adaptif hız sabitleyici", "true"),
                    ("güvenlik", "Şerit takip asistanı", "true"),
                    ("güvenlik", "Kör nokta uyarısı", "true"),
                    ("konfor", "Sunroof", "true"),
                    ("konfor", "Panoramik cam tavan", "false"),
                    ("güvenlik", "Geri görüş kamerası", "true"),
                    ("konfor", "Head-up display", "true"),
                    ("güvenlik", "Otomatik park asistanı", "true"),
                ),
            ),
        ):
            for cat, name, val in specs:
                feature_specs.append((v, cat, name, val))

        db.add_all([feat(v, c, n, val) for v, c, n, val in feature_specs])
        db.flush()

        now = datetime.now(timezone.utc)
        listings = [
            MarketListing(
                car_variant_id=corolla_cross.id,
                source_name="demo",
                source_listing_id="cc-1",
                title="2024 Toyota Corolla Cross Hybrid Flame",
                price=1_825_000,
                currency="TRY",
                mileage_km=12_000,
                city="Istanbul",
                seller_type="dealer",
                listing_date=date(2026, 3, 1),
                url="https://example.com/cc-1",
                is_active=True,
            ),
            MarketListing(
                car_variant_id=corolla_cross.id,
                source_name="demo",
                source_listing_id="cc-2",
                title="2024 Toyota Corolla Cross Hybrid Flame",
                price=1_860_000,
                currency="TRY",
                mileage_km=8000,
                city="Istanbul",
                seller_type="owner",
                listing_date=date(2026, 3, 5),
                url="https://example.com/cc-2",
                is_active=True,
            ),
            MarketListing(
                car_variant_id=corolla_cross.id,
                source_name="demo",
                source_listing_id="cc-3",
                title="2024 Toyota Corolla Cross Hybrid Flame",
                price=1_785_000,
                currency="TRY",
                mileage_km=15_000,
                city="Ankara",
                seller_type="dealer",
                listing_date=date(2026, 3, 10),
                url="https://example.com/cc-3",
                is_active=True,
            ),
            MarketListing(
                car_variant_id=qashqai.id,
                source_name="demo",
                source_listing_id="qa-1",
                title="2024 Nissan Qashqai 1.3 DIG-T",
                price=1_910_000,
                currency="TRY",
                mileage_km=14_000,
                city="Istanbul",
                seller_type="dealer",
                listing_date=date(2026, 3, 7),
                url="https://example.com/qa-1",
                is_active=True,
            ),
            MarketListing(
                car_variant_id=qashqai.id,
                source_name="demo",
                source_listing_id="qa-2",
                title="2024 Nissan Qashqai 1.3 DIG-T",
                price=1_945_000,
                currency="TRY",
                mileage_km=9000,
                city="Izmir",
                seller_type="owner",
                listing_date=date(2026, 3, 9),
                url="https://example.com/qa-2",
                is_active=True,
            ),
            MarketListing(
                car_variant_id=tucson.id,
                source_name="demo",
                source_listing_id="tu-1",
                title="2024 Hyundai Tucson 1.6 T-GDI",
                price=2_050_000,
                currency="TRY",
                mileage_km=11_000,
                city="Istanbul",
                seller_type="dealer",
                listing_date=date(2026, 3, 4),
                url="https://example.com/tu-1",
                is_active=True,
            ),
            MarketListing(
                car_variant_id=tucson.id,
                source_name="demo",
                source_listing_id="tu-2",
                title="2024 Hyundai Tucson 1.6 T-GDI",
                price=2_090_000,
                currency="TRY",
                mileage_km=7000,
                city="Bursa",
                seller_type="owner",
                listing_date=date(2026, 3, 11),
                url="https://example.com/tu-2",
                is_active=True,
            ),
            MarketListing(
                car_variant_id=bmw_320i.id,
                source_name="demo",
                source_listing_id="bm-1",
                title="2024 BMW 320i M Sport",
                price=3_125_000,
                currency="TRY",
                mileage_km=10_000,
                city="Istanbul",
                seller_type="dealer",
                listing_date=date(2026, 3, 2),
                url="https://example.com/bm-1",
                is_active=True,
            ),
            MarketListing(
                car_variant_id=bmw_320i.id,
                source_name="demo",
                source_listing_id="bm-2",
                title="2024 BMW 320i M Sport",
                price=3_180_000,
                currency="TRY",
                mileage_km=6000,
                city="Ankara",
                seller_type="owner",
                listing_date=date(2026, 3, 12),
                url="https://example.com/bm-2",
                is_active=True,
            ),
        ]
        db.add_all(listings)
        db.flush()

        stats_rows = [
            MarketStat(
                car_variant_id=corolla_cross.id,
                sample_size=3,
                avg_price=1_823_333.33,
                median_price=1_825_000.0,
                min_price=1_785_000,
                max_price=1_860_000,
                std_dev_price=30_641.0,
                variance_price=938_888_881.0,
                avg_mileage=11_666.67,
                price_mileage_corr=Decimal("-0.71"),
                calculated_at=now,
            ),
            MarketStat(
                car_variant_id=qashqai.id,
                sample_size=2,
                avg_price=1_927_500.0,
                median_price=1_927_500.0,
                min_price=1_910_000,
                max_price=1_945_000,
                std_dev_price=17_500.0,
                variance_price=306_250_000.0,
                avg_mileage=11_500.0,
                price_mileage_corr=Decimal("-0.62"),
                calculated_at=now,
            ),
            MarketStat(
                car_variant_id=tucson.id,
                sample_size=2,
                avg_price=2_070_000.0,
                median_price=2_070_000.0,
                min_price=2_050_000,
                max_price=2_090_000,
                std_dev_price=20_000.0,
                variance_price=400_000_000.0,
                avg_mileage=9000.0,
                price_mileage_corr=Decimal("-0.55"),
                calculated_at=now,
            ),
            MarketStat(
                car_variant_id=bmw_320i.id,
                sample_size=2,
                avg_price=3_152_500.0,
                median_price=3_152_500.0,
                min_price=3_125_000,
                max_price=3_180_000,
                std_dev_price=27_500.0,
                variance_price=756_250_000.0,
                avg_mileage=8000.0,
                price_mileage_corr=Decimal("-0.60"),
                calculated_at=now,
            ),
        ]
        db.add_all(stats_rows)
        db.commit()
        print(
            "Seed tamam: 4 varyant, donanım özellikleri (car_features), 9 ilan, 4 market_stats. "
            "İstatistikleri ilanlardan yeniden üretmek için: python scripts/stats_refresh_job.py"
        )
    finally:
        db.close()


def main() -> None:
    reset_and_seed()


if __name__ == "__main__":
    main()
