from pydantic_settings import BaseSettings, SettingsConfigDict



class Settings(BaseSettings):
    database_url: str
    secret_key: str                       
    algorithm: str                         
    access_token_expire_minutes: int
    
    UPLOAD_DIR: str = "uploads/avatars"
    MAX_AVATAR_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    AVATAR_URL_PREFIX: str = "/static/avatars"
    
    project_name: str = "TaskFlow"                    
    api_v1_prefix: str = "/api/v1"                     
    backend_cors_origins: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ] 
         
    model_config = SettingsConfigDict(
        env_file=".env"
    )

settings = Settings()