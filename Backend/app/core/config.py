from pydantic_settings import BaseSettings, SettingsConfigDict



class Settings(BaseSettings):
    database_url: str
    secret_key: str                       
    algorithm: str                         
    access_token_expire_minutes: int  
    
    project_name: str = "TaskFlow"                    
    api_v1_prefix: str = "/api/v1"                     
    backend_cors_origins: list[str] = [] 
         
    model_config = SettingsConfigDict(
        env_file=".env"
    )

settings = Settings()