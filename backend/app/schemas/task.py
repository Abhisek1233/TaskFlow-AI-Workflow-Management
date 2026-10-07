from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict

VALID_PRIORITIES = ("Low", "Medium", "High", "Urgent")
VALID_STATUSES = ("Pending", "In Progress", "Completed")

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Title of the task")
    description: Optional[str] = Field(default=None, description="Detailed description")
    category: str = Field(default="General", max_length=50, description="Task category")
    priority: Literal["Low", "Medium", "High", "Urgent"] = Field(
        default="Medium", 
        description="Priority: Low, Medium, High, or Urgent"
    )
    status: Literal["Pending", "In Progress", "Completed"] = Field(
        default="Pending", 
        description="Status: Pending, In Progress, or Completed"
    )
    due_date: Optional[datetime] = Field(default=None, description="Due date and time (optional)")

    @field_validator("title")
    @classmethod
    def validate_title_non_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Task title cannot be blank or whitespace only")
        return trimmed

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=50)
    priority: Optional[Literal["Low", "Medium", "High", "Urgent"]] = None
    status: Optional[Literal["Pending", "In Progress", "Completed"]] = None
    due_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def validate_title_if_provided(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Task title cannot be blank or whitespace only")
            return trimmed
        return v

class TaskStatusUpdate(BaseModel):
    status: Literal["Pending", "In Progress", "Completed"] = Field(
        ..., 
        description="New task status: Pending, In Progress, or Completed"
    )

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    priority: str
    status: str
    due_date: Optional[datetime] = None
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int

class DashboardStats(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    high_priority_tasks: int
