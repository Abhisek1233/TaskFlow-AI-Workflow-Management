from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskStatusUpdate, 
    TaskResponse, TaskListResponse, DashboardStats
)
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated task counts for the current user's dashboard cards.
    """
    return task_service.get_dashboard_stats(db, current_user.id)

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new task linked to the authenticated user.
    """
    return task_service.create_task(db, current_user.id, task_in)

@router.get("", response_model=TaskListResponse)
def list_tasks(
    search: Optional[str] = Query(None, description="Search term in title or description"),
    status: Optional[str] = Query(None, description="Filter by status (Pending, In Progress, Completed)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Low, Medium, High, Urgent)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=200, description="Limit of tasks to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves filtered and paginated tasks strictly belonging to the authenticated user.
    """
    tasks, total = task_service.get_user_tasks(
        db=db,
        user_id=current_user.id,
        search=search,
        status=status,
        priority=priority,
        category=category,
        skip=skip,
        limit=limit
    )
    return {"tasks": tasks, "total": total}

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetches a specific task by ID. Ensures user authorization.
    """
    task = task_service.get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} was not found."
        )
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates fields on a specific task owned by the authenticated user.
    """
    task = task_service.get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} was not found."
        )
    return task_service.update_task(db, task, task_in)

@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_in: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates only the status of an existing task (e.g. from a quick toggle or board).
    """
    task = task_service.get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} was not found."
        )
    return task_service.update_task_status(db, task, status_in.status)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a task owned by the authenticated user.
    """
    task = task_service.get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} was not found."
        )
    task_service.delete_task(db, task)
    return None
