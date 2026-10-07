from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Create engine with connection pooling and pre-ping for health verification
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# Thread-local session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for all ORM models
Base = declarative_base()

def get_db():
    """
    FastAPI dependency that provides a transactional database session per request.
    Ensures session is properly closed after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Creates all database tables defined in the metadata if they do not exist.
    """
    # Import models here so that Base knows about them before create_all
    import app.models.user  # noqa: F401
    import app.models.task  # noqa: F401
    Base.metadata.create_all(bind=engine)
