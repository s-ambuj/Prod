from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "healthcare_db"
    SECRET_KEY: str = "healthcare"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REDIS_URL: str = "redis://localhost:6379/0"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
