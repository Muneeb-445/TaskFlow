from datetime import date, datetime, time, timezone

from sqlalchemy import and_, case, func, or_
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.task import Task, TaskPriority, TaskStatus


class TaskRepository:
    """Handles all direct database access for the Task model.
    No business rules here — just persistence, filtering, and aggregation."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def get_owned(self, task_id: int, user_id: int) -> Task | None:
        return (
            self._db.query(Task)
            .filter(Task.id == task_id, Task.user_id == user_id)
            .first()
        )

    def create(
        self,
        *,
        user_id: int,
        title: str,
        description: str | None = None,
        category_id: int | None = None,
        priority: TaskPriority = TaskPriority.MEDIUM,
        due_date: datetime | None = None,
    ) -> Task:
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            category_id=category_id,
            priority=priority,
            due_date=due_date,
        )
        self._db.add(task)
        self._db.commit()
        self._db.refresh(task)
        return task

    def update(self, task: Task, **kwargs) -> Task:
        for key, value in kwargs.items():
            setattr(task, key, value)
        self._db.commit()
        self._db.refresh(task)
        return task

    def save(self, task: Task) -> Task:
        """Persist changes already made to a Task object in memory.
        Used by actions like start/complete/reopen that mutate fields
        directly rather than going through update()'s partial-update logic."""
        self._db.commit()
        self._db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self._db.delete(task)
        self._db.commit()

    def get_status_counts(self, user_id: int) -> dict:
        now = datetime.now(timezone.utc)

        pending = func.sum(case((Task.status == TaskStatus.TODO, 1), else_=0))
        in_progress = func.sum(case((Task.status == TaskStatus.IN_PROGRESS, 1), else_=0))
        completed = func.sum(case((Task.status == TaskStatus.COMPLETED, 1), else_=0))
        overdue = func.sum(
            case(
                (and_(Task.due_date < now, Task.status != TaskStatus.COMPLETED), 1),
                else_=0,
            )
        )

        row = (
            self._db.query(pending, in_progress, completed, overdue)
            .filter(Task.user_id == user_id)
            .first()
        )

        return {
            "pending_count": row[0] or 0,
            "in_progress_count": row[1] or 0,
            "completed_count": row[2] or 0,
            "overdue_count": row[3] or 0,
        }

    def get_filtered(
        self,
        user_id: int,
        *,
        search: str | None = None,
        status: TaskStatus | None = None,
        priority: TaskPriority | None = None,
        category_id: int | None = None,
        due_date: date | None = None,
        sort_by: str = "due_date",
        sort_order: str = "asc",
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[tuple[Task, str | None]], int]:
        query = (
            self._db.query(Task, Category.name)
            .outerjoin(Category, Task.category_id == Category.id)
            .filter(Task.user_id == user_id)
        )

        if search:
            like_pattern = f"%{search}%"
            query = query.filter(
                or_(Task.title.ilike(like_pattern), Task.description.ilike(like_pattern))
            )
        if status is not None:
            query = query.filter(Task.status == status)
        if priority is not None:
            query = query.filter(Task.priority == priority)
        if category_id is not None:
            query = query.filter(Task.category_id == category_id)
        if due_date is not None:
            start_of_day = datetime.combine(due_date, time.min, tzinfo=timezone.utc)
            end_of_day = datetime.combine(due_date, time.max, tzinfo=timezone.utc)
            query = query.filter(Task.due_date >= start_of_day, Task.due_date <= end_of_day)

        total = query.count()

        query = query.order_by(*self._build_sort(sort_by, sort_order))
        query = query.offset((page - 1) * page_size).limit(page_size)

        return query.all(), total

    def _build_sort(self, sort_by: str, sort_order: str):
        descending = sort_order == "desc"

        if sort_by == "priority":
            priority_rank = case(
                (Task.priority == TaskPriority.HIGH, 1),
                (Task.priority == TaskPriority.MEDIUM, 2),
                (Task.priority == TaskPriority.LOW, 3),
            )
            return [priority_rank.desc()] if descending else [priority_rank.asc()]

        if sort_by == "title":
            return [Task.title.desc()] if descending else [Task.title.asc()]

        if sort_by == "newest":
            return [Task.created_at.desc()]

        if descending:
            return [Task.due_date.is_(None).asc(), Task.due_date.desc()]
        return [Task.due_date.is_(None).asc(), Task.due_date.asc()]