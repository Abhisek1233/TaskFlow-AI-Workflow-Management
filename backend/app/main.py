from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.config import settings
from app.database import init_db, engine
from app.routes import auth_router, tasks_router, ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager that initializes the PostgreSQL database tables on startup.
    """
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A complete, practical AI-assisted workflow and task management platform REST API.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS so Vite React frontend can communicate seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.encoders import jsonable_encoder

# Custom validation error handler for friendly JSON error structures
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join([str(x) for x in err.get("loc", []) if x != "body"])
        msg = err.get("msg", "Invalid input")
        errors.append(f"{loc}: {msg}" if loc else msg)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({
            "detail": "; ".join(errors) or "Validation failed for request data.",
            "errors": exc.errors()
        })
    )

# Root status
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs"
    }

# Health check endpoint
@app.get("/api/health", tags=["Health"])
def health_check():
    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(conn.connection.cursor().execute("SELECT 1"))
    except Exception:
        # Fallback query verification
        try:
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if "unhealthy" not in db_status else "degraded",
        "database": db_status,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }

# Register API routers under /api
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(tasks_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
