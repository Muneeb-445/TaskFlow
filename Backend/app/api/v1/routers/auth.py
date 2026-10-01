from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest, Token
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return AuthService(db).register(data)


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    return AuthService(db).login(data)

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    AuthService(db).reset_password(data)

    return {
        "message": "Password has been reset successfully."
    }
    
@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    AuthService(db).forgot_password(data.email)

    return {
        "message": (
            "If an account exists with this email, "
            "a password reset link has been sent."
        )
    }