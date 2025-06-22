import os
from pathlib import Path
from dotenv import load_dotenv
from typing import List

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path) # loads .env variables


class Settings:
    WEATHERSTACK_API_KEY: str = os.getenv("WEATHERSTACK_API_KEY", "")
    WEATHERSTACK_BASE_URL: str = os.getenv("WEATHERSTACK_BASE_URL", "http://api.weatherstack.com/current")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    def validate(self):
        if not self.WEATHERSTACK_API_KEY:
            raise ValueError("Missing WEATHERSTACK_API_KEY")

# Create and validate settings
settings = Settings()
settings.validate()