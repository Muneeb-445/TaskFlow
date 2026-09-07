from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Handles all direct database access for the User model.
    No business rules here — just persistence."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self._db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        return (
            self._db.query(User)
            .filter(func.lower(User.email) == func.lower(email))
            .first()
        )

    def create(self, *, fullname: str, email: str, password_hash: str) -> User:
        user = User(fullname=fullname, email=email, password_hash=password_hash)
        self._db.add(user)
        self._db.commit()
        self._db.refresh(user)
        return user