from datetime import date

from pydantic import BaseModel

from app.schemas.task import TaskResponse


class CategoryStat(BaseModel):
    id: int
    name: str
    task_count: int
    completed_count: int
    remaining_count: int
    progress_percentage: int


class DailyProductivity(BaseModel):
    day: str
    date: date
    completed: int
    created: int


class DashboardResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    overdue_tasks: int
    completion_percentage: int
    due_today: list[TaskResponse]
    upcoming_tasks: list[TaskResponse]
    overdue_tasks_list: list[TaskResponse]
    category_statistics: list[CategoryStat]
    weekly_productivity: list[DailyProductivity]