import enum
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum as SqlEnum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class NotificationType(str, enum.Enum):
    TASK_COMPLETED = "TASK_COMPLETED"
    TASK_STARTED = "TASK_STARTED"
    TASK_DELETED = "TASK_DELETED"
    TASK_DUE_TODAY = "TASK_DUE_TODAY"     
    TASK_DUE_TOMORROW = "TASK_DUE_TOMORROW"
    TASK_OVERDUE = "TASK_OVERDUE"
    CATEGORY_DELETED = "CATEGORY_DELETED"
    PASSWORD_CHANGED = "PASSWORD_CHANGED"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    task_id: Mapped[int | None] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True,
    )
    notification_type: Mapped[NotificationType] = mapped_column(
        SqlEnum(NotificationType, name="notification_type", validate_strings=True),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(nullable=False, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="notifications")
    task: Mapped["Task | None"] = relationship()