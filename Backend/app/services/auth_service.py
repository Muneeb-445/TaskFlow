from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, InvalidCredentialsError
from app.core.security import password_hasher, token_service
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import Token
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