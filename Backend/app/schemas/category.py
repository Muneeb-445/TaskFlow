from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)


class CategoryUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=150)


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    task_count: int
    completed_count: int
    remaining_count: int
    progress_percentage: int