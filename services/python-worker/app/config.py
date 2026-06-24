from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parents[3] / ".env",
            Path(__file__).resolve().parents[1] / ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    port: int = 8000
    mongodb_uri: str = "mongodb://localhost:27017/knowflow"
    llm_provider: str = "gemini"
    llm_api_key: str = ""


settings = Settings()
