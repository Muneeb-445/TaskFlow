from pydantic_settings import BaseSettings, SettingsConfigDict



class Settings(BaseSettings):
    database_url: str
    secret_key: str                       
    algorithm: str                         
    access_token_expire_minutes: int
    
    UPLOAD_DIR: str = "uploads/avatars"
    MAX_AVATAR_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    AVATAR_URL_PREFIX: str = "/static/avatars"
    
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str
    SMTP_FROM_NAME: str = "TaskFlow"
    FRONTEND_RESET_PASSWORD_URL: str = "http://localhost:5173/reset-password"
    RESET_TOKEN_EXPIRE_MINUTES: int = 10
    
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