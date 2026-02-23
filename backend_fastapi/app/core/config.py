import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "CMS Periodico de Upgrade"
    PROJECT_VERSION: str = "2.0.0"
    
    # DATABASE
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+mysqlconnector://root:1234@127.0.0.1:3306/cms_db")
    
    # SECURITY
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tu_super_clave_secreta_aqui")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

settings = Settings()
