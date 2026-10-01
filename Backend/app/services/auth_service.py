from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, InvalidCredentialsError
from app.core.security import password_hasher, token_service
from app.core.config import settings
from app.core.email import email_service
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import Token,ResetPasswordRequest
from app.schemas.user import UserCreate, UserLogin


class AuthService:
    """Business logic for registration and login. No HTTP knowledge here."""

    def __init__(self, db: Session) -> None:
        self._repository = UserRepository(db)

    def register(self, data: UserCreate) -> User:
        existing_user = self._repository.get_by_email(data.email)
        if existing_user is not None:
            raise ConflictError("A user with this email already exists.")

        hashed_password = password_hasher.hash(data.password)

        return self._repository.create(
            fullname=data.fullname,
            email=data.email,
            password_hash=hashed_password,
        )

    def login(self, data: UserLogin) -> Token:
        user = self._repository.get_by_email(data.email)

        if user is None or not password_hasher.verify(data.password, user.password_hash):
            raise InvalidCredentialsError("Incorrect email or password.")

        if not user.is_active:
            raise InvalidCredentialsError("This account is inactive.")

        access_token = token_service.create_access_token(subject=str(user.id))
        return Token(access_token=access_token)
    
    def forgot_password(self, email: str) -> None:
        user = self._repository.get_by_email(email)

        if user is None:
            return

        reset_token = token_service.create_password_reset_token(
            subject=str(user.id)
        )

        reset_url = (
            f"{settings.FRONTEND_RESET_PASSWORD_URL}"
            f"?token={reset_token}"
        )

        email_service.send_email(
            recipient_email=user.email,
            subject="Reset your TaskFlow password",
            body=(
                "You requested to reset your TaskFlow password.\n\n"
                f"Reset your password here:\n{reset_url}\n\n"
                f"This link will expire in "
                f"{settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.\n\n"
                "If you did not request this, you can ignore this email."
            ),
    )
    
    def reset_password(self, data: ResetPasswordRequest) -> None:
        user_id = token_service.decode_password_reset_token(data.token)

        if user_id is None:
            raise InvalidCredentialsError("Invalid or expired reset token.")

        user = self._repository.get_by_id(int(user_id))

        if user is None:
            raise InvalidCredentialsError("Invalid or expired reset token.")

        hashed_password = password_hasher.hash(data.new_password)

        self._repository.update_password(
            user,
            new_password_hash=hashed_password,
    )
    
    