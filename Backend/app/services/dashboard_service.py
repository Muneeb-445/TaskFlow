from sqlalchemy.orm import Session

from app.repositories.category_repository import CategoryRepository
from app.repositories.dashboard_repository import DashboardRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.dashboard import CategoryStat, DailyProductivity, DashboardResponse
from app.services.category_service import compute_category_stats
from app.services.task_service import build_task_response


class DashboardService:
    """Read-only aggregation for the dashboard. Reuses TaskRepository,
    CategoryRepository, build_task_response, and compute_category_stats
    directly — no calculation is ever redefined here."""

    def __init__(self, db: Session) -> None:
        self._task_repository = TaskRepository(db)
        self._category_repository = CategoryRepository(db)
        self._dashboard_repository = DashboardRepository(db)

    def get_dashboard(self, user_id: int) -> DashboardResponse:
        counts = self._task_repository.get_status_counts(user_id)
        total_tasks = self._dashboard_repository.get_total_tasks(user_id)

        completed = counts["completed_count"]
        completion_percentage = round((completed / total_tasks) * 100) if total_tasks > 0 else 0

        due_today_rows = self._dashboard_repository.get_due_today(user_id)
        upcoming_rows = self._dashboard_repository.get_upcoming(user_id)
        overdue_rows = self._dashboard_repository.get_overdue_list(user_id)

        category_rows = self._category_repository.get_all_with_stats(user_id)
        category_statistics = [
            CategoryStat(id=category.id, name=category.name, **compute_category_stats(task_count, completed_count))
            for category, task_count, completed_count in category_rows
        ]

        weekly_rows = self._dashboard_repository.get_weekly_productivity(user_id)
        weekly_productivity = [DailyProductivity(**row) for row in weekly_rows]

        return DashboardResponse(
            total_tasks=total_tasks,
            completed_tasks=counts["completed_count"],
            in_progress_tasks=counts["in_progress_count"],
            pending_tasks=counts["pending_count"],
            overdue_tasks=counts["overdue_count"],
            completion_percentage=completion_percentage,
            due_today=[build_task_response(t, name) for t, name in due_today_rows],
            upcoming_tasks=[build_task_response(t, name) for t, name in upcoming_rows],
            overdue_tasks_list=[build_task_response(t, name) for t, name in overdue_rows],
            category_statistics=category_statistics,
            weekly_productivity=weekly_productivity,
        )