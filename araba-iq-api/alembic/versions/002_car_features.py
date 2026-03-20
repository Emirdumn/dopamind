"""car_features

Revision ID: 002
Revises: 001
Create Date: 2026-03-20

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "car_features",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("car_variant_id", sa.Integer(), nullable=False),
        sa.Column("feature_category", sa.String(length=64), nullable=False),
        sa.Column("feature_name", sa.String(length=128), nullable=False),
        sa.Column("feature_value", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["car_variant_id"], ["car_variants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("car_variant_id", "feature_name", name="uq_car_features_variant_name"),
    )
    op.create_index(op.f("ix_car_features_car_variant_id"), "car_features", ["car_variant_id"], unique=False)
    op.create_index(op.f("ix_car_features_feature_category"), "car_features", ["feature_category"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_car_features_feature_category"), table_name="car_features")
    op.drop_index(op.f("ix_car_features_car_variant_id"), table_name="car_features")
    op.drop_table("car_features")
