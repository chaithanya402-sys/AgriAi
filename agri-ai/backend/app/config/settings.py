from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AgriAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    DEMO_MODE: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./agriai.db"
    # When switching to Postgres, use:
    # DATABASE_URL=postgresql://user:pass@localhost:5432/agriai

    # JWT Auth
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # External APIs (all proxied through backend, never exposed to frontend)
    OPENWEATHER_API_KEY: Optional[str] = None
    MARKET_API_KEY: Optional[str] = None

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
