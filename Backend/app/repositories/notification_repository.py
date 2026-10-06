from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType


class NotificationRepository:
    """Handles all direct database access for the Notification model."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def get_owned(self, notification_id: int, user_id: int) -> Notification | None:
        return (
            self._db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )

    def get_paginated(
        self, user_id: int, *, page: int = 1, page_size: int = 20
    ) -> tuple[list[Notification], int]:
        query = (
            self._db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )

        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def get_unread_count(self, user_id: int) -> int:
        return (
            self._db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read.is_(False))
            .count()
        )

    def create(
        self,
        *,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        task_id: int | None = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            task_id=task_id,
        )
        self._db.add(notification)
        self._db.commit()
        self._db.refresh(notification)
        return notification

    def mark_read(self, notification: Notification) -> Notification:
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.now(timezone.utc)
            self._db.commit()
            self._db.refresh(notification)
        return notification

    def mark_all_read(self, user_id: int) -> int:
        now = datetime.now(timezone.utc)
        result = (
            self._db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read.is_(False))
            .update({"is_read": True, "read_at": now})
        )
        self._db.commit()
        return result

    def delete(self, notification: Notification) -> None:
        self._db.delete(notification)
        self._db.commit()

    def exists_for_task(self, task_id: int, notification_type: NotificationType) -> bool:
        """Used by the scheduler to avoid creating duplicate time-based
        notifications (e.g. don't send 'overdue' twice for the same task)."""
        return (
            self._db.query(Notification)
            .filter(
                Notification.task_id == task_id,
                Notification.notification_type == notification_type,
            )
            .first()
            is not None
        )
    def delete_due_date_notifications_for_task(self, task_id: int) -> None:
        """Removes any existing due-today/due-tomorrow/overdue notifications
        for a task, so editing its due_date lets the scheduler re-evaluate
        it fresh rather than leaving stale or blocking new notifications."""
        self._db.query(Notification).filter(
            Notification.task_id == task_id,
            Notification.notification_type.in_(
                [
                    NotificationType.TASK_DUE_TODAY,
                    NotificationType.TASK_DUE_TOMORROW,
                    NotificationType.TASK_OVERDUE,
                ]
            ),
        ).delete(synchronize_session=False)
        self._db.commit()