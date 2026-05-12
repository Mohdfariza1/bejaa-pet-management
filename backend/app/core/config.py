from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./bejaa_pet.db"
    APP_NAME: str = "Bejaa Pet Management"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
