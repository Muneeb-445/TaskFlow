from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, InvalidCredentialsError
from app.core.security import password_hasher
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import ChangePasswordRequest, UserUpdate


class UserService:
    """Business logic for a logged-in user managing their own account.
    Distinct from AuthService, which only handles register/login."""

    def __init__(self, db: Session) -> None:
        self._repository = UserRepository(db)

    def update_profile(self, current_user: User, data: UserUpdate) -> User:
        return self._repository.update_profile(
            current_user,
            fullname=data.fullname,
            bio=data.bio,
            avatar_url=data.avatar_url,
        )

    def change_password(self, current_user: User, data: ChangePasswordRequest) -> User:
        if not password_hasher.verify(data.current_password, current_user.password_hash):
            raise InvalidCredentialsError("Current password is incorrect.")

        if password_hasher.verify(data.new_password, current_user.password_hash):
            raise ConflictError("New password must be different from the current password.")

        new_password_hash = password_hasher.hash(data.new_password)
        return self._repository.update_password(current_user, new_password_hash=new_password_hash)