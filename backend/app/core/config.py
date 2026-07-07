from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Debug / logging
    DEBUG: bool = False

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Rewards Program API"

    # Prefixo externo quando servido atrás de um proxy com path-based routing
    # (ex: Nginx Proxy Manager encaminhando api.strokes.dev.br/rewards/ -> este container)
    ROOT_PATH: str = ""

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Push Notifications (VAPID)
    VAPID_PRIVATE_KEY: str = ""
    VAPID_PUBLIC_KEY: str = ""
    VAPID_ADMIN_EMAIL: str = "admin@strokes.dev.br"
    PUSH_ADMIN_SECRET: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Alias de compatibilidade para módulos que ainda importam `settings` diretamente
# em vez de usar `Depends(get_settings)` (ex: core/security.py, core/push.py).
settings = get_settings()
