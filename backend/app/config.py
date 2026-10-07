import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file explicitly if present
load_dotenv()

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TaskFlow — AI-Assisted Workflow Management Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database Settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:root@localhost:5432/taskflow_db"
    )
    
    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", 
        "taskflow-insecure-dev-secret-key-change-in-production-2026"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Google Gemini AI Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
