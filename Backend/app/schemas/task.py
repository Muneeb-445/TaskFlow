from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskPriority, TaskStatus

from enum import Enum

class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    category_id: int | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    category_id: int | None = None
    priority: TaskPriority | None = None
    due_date: date | None = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime | None
    created_at: datetime
    completed_at: datetime | None
    category_id: int | None
    category_name: str | None
    is_overdue: bool


class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int
    pending_count: int
    in_progress_count: int
    completed_count: int
    overdue_count: int
    
class TaskSortBy(str, Enum):
    DUE_DATE = "due_date"
    PRIORITY = "priority"
    TITLE = "title"
    NEWEST = "newest"


class TaskSortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"