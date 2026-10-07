from app.routes.auth import router as auth_router
from app.routes.tasks import router as tasks_router
from app.routes.ai import router as ai_router

__all__ = ["auth_router", "tasks_router", "ai_router"]
