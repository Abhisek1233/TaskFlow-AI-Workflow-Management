import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.utils.password import hash_password
from app.auth.jwt_handler import create_access_token

# Use in-memory SQLite database for isolated, lightning-fast test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Creates fresh database tables per test function, yielding a clean session."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency pointing to the test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    """Creates a sample authenticated test user."""
    user = User(
        name="Alex Engineer",
        email="alex@taskflow.dev",
        password_hash=hash_password("securepassword123")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    """Returns Bearer Authorization headers for test_user."""
    token = create_access_token({"sub": str(test_user.id), "email": test_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def second_user(db_session):
    """Creates a second test user to verify multi-tenant isolation and security."""
    user = User(
        name="Jordan Colleague",
        email="jordan@taskflow.dev",
        password_hash=hash_password("secondpassword123")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def second_user_headers(second_user):
    """Returns Bearer Authorization headers for second_user."""
    token = create_access_token({"sub": str(second_user.id), "email": second_user.email})
    return {"Authorization": f"Bearer {token}"}
