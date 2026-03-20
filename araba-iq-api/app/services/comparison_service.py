from __future__ import annotations

from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.car_variant import CarVariant
from app.models.vehicle_model import VehicleModel
from app.schemas.compare import (
    CarCompareResponse,
    CompareCarBlock,
    CompareMarketSlice,
)
from app.services.compare_narrative import build_equipment_section, build_narratives


def _fmt(v: Any) -> Any:
    if v is None:
        return None
    if hasattr(v, "quantize"):
        return float(v)
    return v


def build_compare_response(db: Session, car_ids: list[int]) -> CarCompareResponse:
    unique_ids = list(dict.fromkeys(car_ids))
    if len(unique_ids) < 2 or len(unique_ids) > 4:
        raise ValueError("car_ids 2–4 benzersiz araç içermeli")

    stmt = (
        select(CarVariant)
        .where(CarVariant.id.in_(unique_ids))
        .options(
            joinedload(CarVariant.vehicle_model).joinedload(VehicleModel.brand),
            joinedload(CarVariant.vehicle_model).joinedload(VehicleModel.segment),
            joinedload(CarVariant.market_stat),
            joinedload(CarVariant.features),
        )
    )

    cars = list(db.scalars(stmt).unique().all())
    if len(cars) != len(unique_ids):
        raise ValueError("Bazı araç ID’leri bulunamadı")

    by_id = {c.id: c for c in cars}
    ordered_variants = [by_id[i] for i in unique_ids]

    blocks: list[CompareCarBlock] = []
    for c in ordered_variants:
        vm = c.vehicle_model
        brand = vm.brand
        seg = vm.segment
        display = f"{brand.name} {vm.name} {c.trim_name} {c.year}"
        tech = {
            "yakıt": c.fuel_type,
            "vites": c.transmission,
            "motor_cc": c.engine_cc,
            "çekiş": c.drivetrain,
            "koltuk": c.seat_count,
            "bagaj_l": c.luggage_capacity,
            "ağırlık_kg": c.weight_kg,
        }
        perf = {
            "beygir": c.horsepower,
            "tork_nm": c.torque_nm,
            "sıfır_yüz_sn": _fmt(c.zero_to_hundred),
            "maks_hız": c.top_speed,
            "ortalama_tüketim": _fmt(c.combined_fuel_consumption),
        }
        mkt: Optional[CompareMarketSlice] = None
        if c.market_stat is not None:
            ms = c.market_stat
            mkt = CompareMarketSlice(
                sample_size=ms.sample_size,
                avg_price=float(ms.avg_price) if ms.avg_price is not None else None,
                median_price=float(ms.median_price) if ms.median_price is not None else None,
                min_price=ms.min_price,
                max_price=ms.max_price,
                std_dev_price=float(ms.std_dev_price) if ms.std_dev_price is not None else None,
            )
        blocks.append(
            CompareCarBlock(
                car_variant_id=c.id,
                display_name=display,
                brand=brand.name,
                model=vm.name,
                segment=seg.name,
                trim_name=c.trim_name,
                year=c.year,
                technical=tech,
                performance=perf,
                market=mkt,
            )
        )

    keys_tech = list(blocks[0].technical.keys())
    tech_cmp = {k: {str(b.car_variant_id): b.technical.get(k) for b in blocks} for k in keys_tech}
    keys_perf = list(blocks[0].performance.keys())
    perf_cmp = {k: {str(b.car_variant_id): b.performance.get(k) for b in blocks} for k in keys_perf}

    market_cmp: dict[str, dict[str, Optional[Any]]] = {
        "örneklem": {str(b.car_variant_id): (b.market.sample_size if b.market else None) for b in blocks},
        "ortalama_fiyat": {
            str(b.car_variant_id): (b.market.avg_price if b.market else None) for b in blocks
        },
        "medyan": {str(b.car_variant_id): (b.market.median_price if b.market else None) for b in blocks},
        "min_fiyat": {str(b.car_variant_id): (b.market.min_price if b.market else None) for b in blocks},
        "max_fiyat": {str(b.car_variant_id): (b.market.max_price if b.market else None) for b in blocks},
        "std_fiyat": {str(b.car_variant_id): (b.market.std_dev_price if b.market else None) for b in blocks},
    }

    equipment_payload, truthy_counts = build_equipment_section(ordered_variants)
    summary = build_narratives(
        blocks,
        ordered_variants,
        truthy_counts,
        equipment_payload["rows"],
    )

    return CarCompareResponse(
        cars=blocks,
        technical_comparison=tech_cmp,
        performance_comparison=perf_cmp,
        market_comparison=market_cmp,
        equipment_comparison=equipment_payload,
        summary_comments=summary,
    )
