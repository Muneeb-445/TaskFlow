from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


class PasswordHasher:
    """Wraps password hashing/verification. No knowledge of users, DB, or HTTP."""

    def __init__(self) -> None:
        self._context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash(self, plain_password: str) -> str:
        return self._context.hash(plain_password)

    def verify(self, plain_password: str, hashed_password: str) -> bool:
        return self._context.verify(plain_password, hashed_password)


class TokenService:
    """Creates and decodes JWTs. No knowledge of users, DB, or HTTP."""

    def __init__(self) -> None:
        self._secret_key = settings.secret_key
        self._algorithm = settings.algorithm
        self._expire_minutes = settings.access_token_expire_minutes

    def create_access_token(self, subject: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=self._expire_minutes)
        payload = {"sub": subject, "exp": expire}
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def decode_access_token(self, token: str) -> str | None:
        try:
            payload = jwt.decode(token, self._secret_key, algorithms=[self._algorithm])
            return payload.get("sub")
        except JWTError:
            return None


password_hasher = PasswordHasher()
token_service = TokenService()