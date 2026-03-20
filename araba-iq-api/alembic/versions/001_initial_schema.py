"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-03-20

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "brands",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("country", sa.String(length=64), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_brands_name"), "brands", ["name"], unique=False)

    op.create_table(
        "segments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("category_type", sa.String(length=32), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_segments_name"), "segments", ["name"], unique=False)

    op.create_table(
        "models",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("brand_id", sa.Integer(), nullable=False),
        sa.Column("segment_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("body_type", sa.String(length=64), nullable=True),
        sa.Column("start_year", sa.Integer(), nullable=True),
        sa.Column("end_year", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["brand_id"], ["brands.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["segment_id"], ["segments.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_models_brand_id"), "models", ["brand_id"], unique=False)
    op.create_index(op.f("ix_models_name"), "models", ["name"], unique=False)
    op.create_index(op.f("ix_models_segment_id"), "models", ["segment_id"], unique=False)

    op.create_table(
        "car_variants",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("model_id", sa.Integer(), nullable=False),
        sa.Column("trim_name", sa.String(length=256), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("fuel_type", sa.String(length=32), nullable=True),
        sa.Column("transmission", sa.String(length=32), nullable=True),
        sa.Column("engine_cc", sa.Integer(), nullable=True),
        sa.Column("horsepower", sa.Integer(), nullable=True),
        sa.Column("torque_nm", sa.Integer(), nullable=True),
        sa.Column("drivetrain", sa.String(length=32), nullable=True),
        sa.Column("combined_fuel_consumption", sa.Numeric(5, 2), nullable=True),
        sa.Column("zero_to_hundred", sa.Numeric(5, 2), nullable=True),
        sa.Column("top_speed", sa.Integer(), nullable=True),
        sa.Column("seat_count", sa.Integer(), nullable=True),
        sa.Column("luggage_capacity", sa.Integer(), nullable=True),
        sa.Column("weight_kg", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["model_id"], ["models.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_car_variants_model_id"), "car_variants", ["model_id"], unique=False)
    op.create_index(op.f("ix_car_variants_year"), "car_variants", ["year"], unique=False)

    op.create_table(
        "market_listings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("car_variant_id", sa.Integer(), nullable=False),
        sa.Column("source_name", sa.String(length=64), nullable=False),
        sa.Column("source_listing_id", sa.String(length=128), nullable=True),
        sa.Column("title", sa.String(length=512), nullable=True),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False),
        sa.Column("model_year", sa.Integer(), nullable=True),
        sa.Column("mileage_km", sa.Integer(), nullable=True),
        sa.Column("city", sa.String(length=64), nullable=True),
        sa.Column("district", sa.String(length=64), nullable=True),
        sa.Column("seller_type", sa.String(length=32), nullable=True),
        sa.Column("painted_parts_count", sa.Integer(), nullable=True),
        sa.Column("changed_parts_count", sa.Integer(), nullable=True),
        sa.Column("accident_record_amount", sa.Integer(), nullable=True),
        sa.Column("first_registration_date", sa.Date(), nullable=True),
        sa.Column("listing_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("url", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["car_variant_id"], ["car_variants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_market_listings_car_variant_id"), "market_listings", ["car_variant_id"], unique=False
    )
    op.create_index(
        op.f("ix_market_listings_source_listing_id"), "market_listings", ["source_listing_id"], unique=False
    )

    op.create_table(
        "market_stats",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("car_variant_id", sa.Integer(), nullable=False),
        sa.Column("sample_size", sa.Integer(), nullable=False),
        sa.Column("avg_price", sa.Numeric(14, 2), nullable=True),
        sa.Column("median_price", sa.Numeric(14, 2), nullable=True),
        sa.Column("min_price", sa.Integer(), nullable=True),
        sa.Column("max_price", sa.Integer(), nullable=True),
        sa.Column("std_dev_price", sa.Numeric(14, 2), nullable=True),
        sa.Column("variance_price", sa.Numeric(20, 2), nullable=True),
        sa.Column("avg_mileage", sa.Numeric(12, 2), nullable=True),
        sa.Column("price_mileage_corr", sa.Numeric(6, 4), nullable=True),
        sa.Column("calculated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["car_variant_id"], ["car_variants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("car_variant_id"),
    )
    op.create_index(op.f("ix_market_stats_car_variant_id"), "market_stats", ["car_variant_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_market_stats_car_variant_id"), table_name="market_stats")
    op.drop_table("market_stats")
    op.drop_index(op.f("ix_market_listings_source_listing_id"), table_name="market_listings")
    op.drop_index(op.f("ix_market_listings_car_variant_id"), table_name="market_listings")
    op.drop_table("market_listings")
    op.drop_index(op.f("ix_car_variants_year"), table_name="car_variants")
    op.drop_index(op.f("ix_car_variants_model_id"), table_name="car_variants")
    op.drop_table("car_variants")
    op.drop_index(op.f("ix_models_segment_id"), table_name="models")
    op.drop_index(op.f("ix_models_name"), table_name="models")
    op.drop_index(op.f("ix_models_brand_id"), table_name="models")
    op.drop_table("models")
    op.drop_index(op.f("ix_segments_name"), table_name="segments")
    op.drop_table("segments")
    op.drop_index(op.f("ix_brands_name"), table_name="brands")
    op.drop_table("brands")
