from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field,field_validator


class UserCreate(BaseModel):
    fullname: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    
    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
            return value.lower()


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fullname: str
    email: EmailStr
    bio: str | None
    avatar_url: str | None
    is_active: bool
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()