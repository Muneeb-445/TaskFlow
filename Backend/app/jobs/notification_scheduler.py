from datetime import date, timedelta

from app.core.database import SessionLocal
from app.models.task import Task, TaskStatus
from app.repositories.notification_repository import NotificationRepository
from app.services.notification_service import NotificationService


def check_task_due_dates() -> None:
    """Runs periodically (every 12 hours). Scans every user's incomplete
    tasks and sends due-today / due-tomorrow / overdue notifications,
    exactly once per task per condition — never repeated."""
    db = SessionLocal()
    try:
        today = date.today()
        tomorrow = today + timedelta(days=1)

        notification_repository = NotificationRepository(db)
        notification_service = NotificationService(db)

        incomplete_tasks = (
            db.query(Task)
            .filter(Task.status != TaskStatus.COMPLETED, Task.due_date.isnot(None))
            .all()
        )

        for task in incomplete_tasks:
            if task.due_date == today:
                _notify_once(
                    notification_repository, notification_service,
                    task, "TASK_DUE_TODAY", notification_service.notify_task_due_today,
                )
            elif task.due_date == tomorrow:
                _notify_once(
                    notification_repository, notification_service,
                    task, "TASK_DUE_TOMORROW", notification_service.notify_task_due_tomorrow,
                )
            elif task.due_date < today:
                _notify_once(
                    notification_repository, notification_service,
                    task, "TASK_OVERDUE", notification_service.notify_task_overdue,
                )
    finally:
        db.close()


def _notify_once(notification_repository, notification_service, task, type_name, notify_fn) -> None:
    from app.models.notification import NotificationType

    notification_type = NotificationType[type_name]
    if notification_repository.exists_for_task(task.id, notification_type):
        return
    notify_fn(task.user_id, task.id, task.title)