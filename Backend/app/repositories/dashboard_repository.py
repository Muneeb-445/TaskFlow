from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import and_, case, func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.task import Task, TaskPriority, TaskStatus


class DashboardRepository:
    """Read-only aggregate queries specific to the dashboard.
    Status counts and category stats are intentionally NOT duplicated
    here — the service reuses TaskRepository/CategoryRepository directly,
    so overdue/completion logic has exactly one definition, not two."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def get_total_tasks(self, user_id: int) -> int:
        return (
            self._db.query(func.count(Task.id))
            .filter(Task.user_id == user_id)
            .scalar()
        ) or 0

    def _priority_rank(self):
        return case(
            (Task.priority == TaskPriority.HIGH, 1),
            (Task.priority == TaskPriority.MEDIUM, 2),
            (Task.priority == TaskPriority.LOW, 3),
        )

    def get_due_today(self, user_id: int) -> list[tuple[Task, str | None]]:
        today = date.today()
        start = datetime.combine(today, time.min, tzinfo=timezone.utc)
        end = datetime.combine(today, time.max, tzinfo=timezone.utc)

        return (
            self._db.query(Task, Category.name)
            .outerjoin(Category, Task.category_id == Category.id)
            .filter(
                Task.user_id == user_id,
                Task.due_date >= start,
                Task.due_date <= end,
                Task.status != TaskStatus.COMPLETED,
            )
            .order_by(self._priority_rank().asc(), Task.created_at.asc())
            .all()
        )

    def get_upcoming(self, user_id: int, limit: int = 4) -> list[tuple[Task, str | None]]:
        tomorrow_start = datetime.combine(
            date.today() + timedelta(days=1), time.min, tzinfo=timezone.utc
        )

        return (
            self._db.query(Task, Category.name)
            .outerjoin(Category, Task.category_id == Category.id)
            .filter(
                Task.user_id == user_id,
                Task.due_date.isnot(None),
                Task.due_date >= tomorrow_start,
                Task.status != TaskStatus.COMPLETED,
            )
            .order_by(Task.due_date.asc())
            .limit(limit)
            .all()
        )

    def get_overdue_list(self, user_id: int) -> list[tuple[Task, str | None]]:
        now = datetime.now(timezone.utc)

        return (
            self._db.query(Task, Category.name)
            .outerjoin(Category, Task.category_id == Category.id)
            .filter(
                Task.user_id == user_id,
                Task.due_date.isnot(None),
                Task.due_date < now,
                Task.status != TaskStatus.COMPLETED,
            )
            .order_by(Task.due_date.asc(), self._priority_rank().asc())
            .all()
        )

    def get_weekly_productivity(self, user_id: int) -> list[dict]:
        today = date.today()
        monday = today - timedelta(days=today.weekday())
        days = [monday + timedelta(days=i) for i in range(7)]

        select_columns = []
        for day in days:
            day_start = datetime.combine(day, time.min, tzinfo=timezone.utc)
            day_end = datetime.combine(day, time.max, tzinfo=timezone.utc)

            created_expr = func.sum(
                case((and_(Task.created_at >= day_start, Task.created_at <= day_end), 1), else_=0)
            )
            completed_expr = func.sum(
                case(
                    (and_(Task.completed_at >= day_start, Task.completed_at <= day_end), 1),
                    else_=0,
                )
            )
            select_columns.extend([created_expr, completed_expr])

        row = self._db.query(*select_columns).filter(Task.user_id == user_id).first()

        results = []
        for i, day in enumerate(days):
            created = row[i * 2] or 0
            completed = row[i * 2 + 1] or 0
            results.append(
                {
                    "day": day.strftime("%a"),
                    "date": day,
                    "completed": completed,
                    "created": created,
                }
            )
        return results