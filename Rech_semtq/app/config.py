
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # OpenAI
    OPENAI_API_KEY: str = "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"  # Remplacez par votre clé
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "Azeroual@Ftah5"
    DB_NAME: str = "GestionVente"
    
    # Search Model
    SEARCH_MODEL: str = "all-MiniLM-L6-v2"
    
    # Redis (optional)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()