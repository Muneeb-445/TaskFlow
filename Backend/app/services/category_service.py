from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate


class CategoryService:
    """Business logic for managing a user's own categories."""

    def __init__(self, db: Session) -> None:
        self._repository = CategoryRepository(db)

    def _to_response(self, category: Category, task_count: int, completed_count: int) -> CategoryResponse:
        task_count = task_count or 0
        completed_count = completed_count or 0
        remaining_count = task_count - completed_count
        progress_percentage = round((completed_count / task_count) * 100) if task_count > 0 else 0

        return CategoryResponse(
            id=category.id,
            name=category.name,
            created_at=category.created_at,
            updated_at=category.updated_at,
            task_count=task_count,
            completed_count=completed_count,
            remaining_count=remaining_count,
            progress_percentage=progress_percentage,
        )

    def get_all_categories(self, user_id: int) -> list[CategoryResponse]:
        rows = self._repository.get_all_with_stats(user_id)
        return [self._to_response(category, count, completed) for category, count, completed in rows]

    def get_category(self, category_id: int, user_id: int) -> CategoryResponse:
        row = self._repository.get_one_with_stats(category_id, user_id)
        if row is None:
            raise NotFoundError("Category not found.")

        category, task_count, completed_count = row
        return self._to_response(category, task_count, completed_count)

    def create_category(self, user_id: int, data: CategoryCreate) -> CategoryResponse:
        existing = self._repository.get_by_name(user_id, data.name)
        if existing is not None:
            raise ConflictError("A category with this name already exists.")

        category = self._repository.create(user_id=user_id, name=data.name)
        return self._to_response(category, task_count=0, completed_count=0)

    def update_category(self, category_id: int, user_id: int, data: CategoryUpdate) -> CategoryResponse:
        category = self._repository.get_by_id(category_id)
        if category is None or category.user_id != user_id:
            raise NotFoundError("Category not found.")

        existing = self._repository.get_by_name(user_id, data.name)
        if existing is not None and existing.id != category.id:
            raise ConflictError("A category with this name already exists.")

        self._repository.update(category, name=data.name)

        # Re-fetch with stats, since this category may already own tasks
        # (renaming doesn't touch task_count/completed_count at all).
        row = self._repository.get_one_with_stats(category_id, user_id)
        category, task_count, completed_count = row
        return self._to_response(category, task_count, completed_count)

    def delete_category(self, category_id: int, user_id: int) -> None:
        category = self._repository.get_by_id(category_id)
        if category is None or category.user_id != user_id:
            raise NotFoundError("Category not found.")

        self._repository.delete(category)