from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.notification import Notification, NotificationType
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationListResponse, NotificationResponse


class NotificationService:
    """Business logic for notifications. Also exposes create_* helper
    methods that other services call as a side effect of their own
    actions (e.g. TaskService calls notify_task_completed)."""

    def __init__(self, db: Session) -> None:
        self._repository = NotificationRepository(db)

    def _get_owned_notification(self, notification_id: int, user_id: int) -> Notification:
        notification = self._repository.get_owned(notification_id, user_id)
        if notification is None:
            raise NotFoundError("Notification not found.")
        return notification

    def get_notifications(
        self, user_id: int, *, page: int = 1, page_size: int = 20
    ) -> NotificationListResponse:
        items, total = self._repository.get_paginated(user_id, page=page, page_size=page_size)
        unread_count = self._repository.get_unread_count(user_id)

        return NotificationListResponse(
            items=[NotificationResponse.model_validate(n) for n in items],
            total=total,
            unread_count=unread_count,
            page=page,
            page_size=page_size,
        )

    def mark_read(self, notification_id: int, user_id: int) -> NotificationResponse:
        notification = self._get_owned_notification(notification_id, user_id)
        notification = self._repository.mark_read(notification)
        return NotificationResponse.model_validate(notification)

    def mark_all_read(self, user_id: int) -> int:
        return self._repository.mark_all_read(user_id)

    def delete_notification(self, notification_id: int, user_id: int) -> None:
        notification = self._get_owned_notification(notification_id, user_id)
        self._repository.delete(notification)

    # ---------- Creation helpers, called by other services ----------

    def notify_task_completed(self, user_id: int, task_id: int, task_title: str) -> None:
        self._repository.create(
            user_id=user_id,
            notification_type=NotificationType.TASK_COMPLETED,
            title="Task completed",
            message=f'You completed "{task_title}".',
            task_id=task_id,
        )

    def notify_task_started(self, user_id: int, task_id: int, task_title: str) -> None:
        self._repository.create(
            user_id=user_id,
            notification_type=NotificationType.TASK_STARTED,
            title="Task started",
            message=f'You started working on "{task_title}".',
            task_id=task_id,
        )

    def notify_task_deleted(self, user_id: int, task_title: str) -> None:
        self._repository.create(
            user_id=user_id,
            notification_type=NotificationType.TASK_DELETED,
            title="Task deleted",
            message=f'"{task_title}" was deleted.',
            task_id=None,  # the task no longer exists, nothing to link to
        )

    def notify_category_deleted(self, user_id: int, category_name: str, task_count: int) -> None:
        if task_count > 0:
            message = (
                f'Category "{category_name}" was deleted. '
                f'{task_count} task{"s" if task_count != 1 else ""} became uncategorized.'
            )
        else:
            message = f'Category "{category_name}" was deleted.'

        self._repository.create(
            user_id=user_id,
            notification_type=NotificationType.CATEGORY_DELETED,
            title="Category deleted",
            message=message,
        )

    def notify_password_changed(self, user_id: int) -> None:
        self._repository.create(
            user_id=user_id,
            notification_type=NotificationType.PASSWORD_CHANGED,
            title="Password changed",
            message="Your password was changed successfully. If this wasn't you, please contact support.",
        )

    def notify_task_due_today(self, user_id: int, task_id: int, task_title: str) -> None:
        self._repository.create(
            user_id=user_id,
            notification_type=NotificationType.TASK_DUE_TODAY,
            title="Due today",
            message=f'"{task_title}" is due today.',
            task_id=task_id,
        )

    def notify_task_due_tomorrow(self, user_id: int, task_id: int, task_title: str) -> None:
        self._repository.create(
            user_id=user_id,
            notification_type=NotificationType.TASK_DUE_TOMORROW,
            title="Due tomorrow",
            message=f'"{task_title}" is due tomorrow.',
            task_id=task_id,
        )

    def notify_task_overdue(self, user_id: int, task_id: int, task_title: str) -> None:
        self._repository.create(
            user_id=user_id,
            notification_type=NotificationType.TASK_OVERDUE,
            title="Task overdue",
            message=f'"{task_title}" is overdue.',
            task_id=task_id,
        )
    def clear_due_date_notifications(self, task_id: int) -> None:
        self._repository.delete_due_date_notifications_for_task(task_id)


notification_service_factory = NotificationService