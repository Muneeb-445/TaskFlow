"""convert task due_date to date

Revision ID: b9a0efd81cb9
Revises: 304360a93666
Create Date: 2026-09-28 11:45:08.795125

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b9a0efd81cb9'
down_revision: Union[str, Sequence[str], None] = '304360a93666'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "tasks",
        "due_date",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.Date(),
        existing_nullable=True,
        postgresql_using="(due_date AT TIME ZONE 'UTC')::date",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "tasks",
        "due_date",
        existing_type=sa.Date(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
        postgresql_using="(due_date + time '23:59:59') AT TIME ZONE 'UTC'",
    )