"""
Application configuration using Pydantic Settings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "Super-Learning"
    app_version: str = "2.0.0"
    debug: bool = False
    
    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: Optional[str] = None
    
    # Google Gemini AI
    genai_api_key: str = ""
    gemini_model: str = "gemini-2.5-pro"
    
    # API Configuration
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
