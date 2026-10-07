from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate

def get_user_tasks(
    db: Session,
    user_id: int,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple[list[Task], int]:
    """
    Retrieves filtered and paginated tasks belonging strictly to the specified user.
    Never returns tasks of another user.
    """
    query = db.query(Task).filter(Task.user_id == user_id)

    # Search by title or description
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    # Filter by status
    if status and status != "All":
        query = query.filter(Task.status == status)

    # Filter by priority
    if priority and priority != "All":
        query = query.filter(Task.priority == priority)

    # Filter by category
    if category and category != "All":
        query = query.filter(Task.category == category)

    total = query.count()
    # Order by updated_at descending so recent tasks appear first
    tasks = query.order_by(Task.updated_at.desc()).offset(skip).limit(limit).all()

    return tasks, total

def get_task_by_id(db: Session, task_id: int, user_id: int) -> Optional[Task]:
    """
    Fetches a single task by ID, enforcing user ownership.
    Returns None if task does not exist or belongs to another user.
    """
    return db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

def create_task(db: Session, user_id: int, task_in: TaskCreate) -> Task:
    """
    Creates a new task associated with the given user_id.
    """
    db_task = Task(
        title=task_in.title,
        description=task_in.description,
        category=task_in.category,
        priority=task_in.priority,
        status=task_in.status,
        due_date=task_in.due_date,
        user_id=user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task: Task, task_in: TaskUpdate) -> Task:
    """
    Updates mutable fields of an existing task owned by the user.
    """
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task

def update_task_status(db: Session, task: Task, new_status: str) -> Task:
    """
    Fast update for task status (e.g. from task board or checkbox).
    """
    task.status = new_status
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task: Task) -> None:
    """
    Deletes a task from the database.
    """
    db.delete(task)
    db.commit()

def get_dashboard_stats(db: Session, user_id: int) -> dict:
    """
    Computes dashboard metrics for the authenticated user.
    """
    total = db.query(Task).filter(Task.user_id == user_id).count()
    pending = db.query(Task).filter(Task.user_id == user_id, Task.status == "Pending").count()
    in_progress = db.query(Task).filter(Task.user_id == user_id, Task.status == "In Progress").count()
    completed = db.query(Task).filter(Task.user_id == user_id, Task.status == "Completed").count()
    high_priority = db.query(
        Task
    ).filter(
        Task.user_id == user_id,
        or_(Task.priority == "High", Task.priority == "Urgent")
    ).count()

    return {
        "total_tasks": total,
        "pending_tasks": pending,
        "in_progress_tasks": in_progress,
        "completed_tasks": completed,
        "high_priority_tasks": high_priority
    }
