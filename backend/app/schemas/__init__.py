from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.schemas.task import (
    TaskBase, TaskCreate, TaskUpdate, TaskStatusUpdate,
    TaskResponse, TaskListResponse, DashboardStats
)
from app.schemas.ai import AITaskAnalyzeRequest, AITaskAnalyzeResponse

__all__ = [
    "UserRegister", "UserLogin", "UserResponse", "TokenResponse",
    "TaskBase", "TaskCreate", "TaskUpdate", "TaskStatusUpdate",
    "TaskResponse", "TaskListResponse", "DashboardStats",
    "AITaskAnalyzeRequest", "AITaskAnalyzeResponse"
]
