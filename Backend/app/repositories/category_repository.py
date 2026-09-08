from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.task import Task, TaskStatus


class CategoryRepository:
    """Handles all direct database access for the Category model.
    No business rules here — just persistence and aggregation."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_id(self, category_id: int) -> Category | None:
        return self._db.get(Category, category_id)

    def get_by_name(self, user_id: int, name: str) -> Category | None:
        return (
            self._db.query(Category)
            .filter(Category.user_id == user_id, func.lower(Category.name) == func.lower(name))
            .first()
        )

    def get_all_with_stats(self, user_id: int) -> list[tuple[Category, int, int]]:
        completed_expr = func.sum(case((Task.status == TaskStatus.COMPLETED, 1), else_=0))
        task_count_expr = func.count(Task.id)

        return (
            self._db.query(Category, task_count_expr, completed_expr)
            .outerjoin(Task, Task.category_id == Category.id)
            .filter(Category.user_id == user_id)
            .group_by(Category.id)
            .order_by(Category.created_at)
            .all()
        )

    def get_one_with_stats(self, category_id: int, user_id: int) -> tuple[Category, int, int] | None:
        completed_expr = func.sum(case((Task.status == TaskStatus.COMPLETED, 1), else_=0))
        task_count_expr = func.count(Task.id)

        return (
            self._db.query(Category, task_count_expr, completed_expr)
            .outerjoin(Task, Task.category_id == Category.id)
            .filter(Category.id == category_id, Category.user_id == user_id)
            .group_by(Category.id)
            .first()
        )

    def create(self, *, user_id: int, name: str) -> Category:
        category = Category(user_id=user_id, name=name)
        self._db.add(category)
        self._db.commit()
        self._db.refresh(category)
        return category

    def update(self, category: Category, *, name: str) -> Category:
        category.name = name
        self._db.commit()
        self._db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        self._db.delete(category)
        self._db.commit()