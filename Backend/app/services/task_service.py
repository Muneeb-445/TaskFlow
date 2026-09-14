from datetime import date, datetime, time, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.category import Category
from app.models.task import Task, TaskStatus
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskListResponse, TaskResponse, TaskUpdate


class TaskService:
    """Business logic for a user's own tasks."""

    def __init__(self, db: Session) -> None:
        self._db = db
        self._repository = TaskRepository(db)

    def _get_owned_task(self, task_id: int, user_id: int) -> Task:
        task = self._repository.get_owned(task_id, user_id)
        if task is None:
            raise NotFoundError("Task not found.")
        return task

    def _validate_category_ownership(self, category_id: int | None, user_id: int) -> None:
        if category_id is None:
            return
        category = self._db.get(Category, category_id)
        if category is None or category.user_id != user_id:
            raise NotFoundError("Category not found.")

    def _to_end_of_day(self, due_date: date | None) -> datetime | None:
        if due_date is None:
            return None
        return datetime.combine(due_date, time(23, 59, 59, tzinfo=timezone.utc))

    def _category_name(self, task: Task) -> str | None:
        return task.category.name if task.category else None

    def _to_response(self, task: Task, category_name: str | None) -> TaskResponse:
        is_overdue = (
            task.due_date is not None
            and task.due_date < datetime.now(timezone.utc)
            and task.status != TaskStatus.COMPLETED
        )

        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            created_at=task.created_at,
            completed_at=task.completed_at,
            category_id=task.category_id,
            category_name=category_name,
            is_overdue=is_overdue,
        )

    def get_tasks(
        self,
        user_id: int,
        *,
        search: str | None = None,
        status: TaskStatus | None = None,
        priority=None,
        category_id: int | None = None,
        due_date: date | None = None,
        sort_by: str = "due_date",
        sort_order: str = "asc",
        page: int = 1,
        page_size: int = 20,
    ) -> TaskListResponse:
        rows, total = self._repository.get_filtered(
            user_id,
            search=search,
            status=status,
            priority=priority,
            category_id=category_id,
            due_date=due_date,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size,
        )
        counts = self._repository.get_status_counts(user_id)

        return TaskListResponse(
            items=[self._to_response(task, name) for task, name in rows],
            total=total,
            page=page,
            page_size=page_size,
            pending_count=counts["pending_count"],
            in_progress_count=counts["in_progress_count"],
            completed_count=counts["completed_count"],
            overdue_count=counts["overdue_count"],
        )

    def get_task(self, task_id: int, user_id: int) -> TaskResponse:
        task = self._get_owned_task(task_id, user_id)
        return self._to_response(task, self._category_name(task))

    def create_task(self, user_id: int, data: TaskCreate) -> TaskResponse:
        self._validate_category_ownership(data.category_id, user_id)

        task = self._repository.create(
            user_id=user_id,
            title=data.title,
            description=data.description,
            category_id=data.category_id,
            priority=data.priority,
            due_date=self._to_end_of_day(data.due_date),
        )
        return self._to_response(task, self._category_name(task))

    def update_task(self, task_id: int, user_id: int, data: TaskUpdate) -> TaskResponse:
        task = self._get_owned_task(task_id, user_id)

        provided_fields = data.model_dump(exclude_unset=True)

        if "category_id" in provided_fields and provided_fields["category_id"] is not None:
            self._validate_category_ownership(provided_fields["category_id"], user_id)

        if "due_date" in provided_fields and provided_fields["due_date"] is not None:
            provided_fields["due_date"] = self._to_end_of_day(provided_fields["due_date"])

        task = self._repository.update(task, **provided_fields)
        return self._to_response(task, self._category_name(task))

    def delete_task(self, task_id: int, user_id: int) -> None:
        task = self._get_owned_task(task_id, user_id)
        self._repository.delete(task)

    def start_task(self, task_id: int, user_id: int) -> TaskResponse:
        task = self._get_owned_task(task_id, user_id)
        if task.status == TaskStatus.TODO:
            task.status = TaskStatus.IN_PROGRESS
            task = self._repository.save(task)
        return self._to_response(task, self._category_name(task))

    def complete_task(self, task_id: int, user_id: int) -> TaskResponse:
        task = self._get_owned_task(task_id, user_id)
        if task.status != TaskStatus.COMPLETED:
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now(timezone.utc)
            task = self._repository.save(task)
        return self._to_response(task, self._category_name(task))

    def reopen_task(self, task_id: int, user_id: int) -> TaskResponse:
        task = self._get_owned_task(task_id, user_id)
        if task.status == TaskStatus.COMPLETED:
            task.status = TaskStatus.TODO
            task.completed_at = None
            task = self._repository.save(task)
        return self._to_response(task, self._category_name(task))