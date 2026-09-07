from unittest.mock import MagicMock

import pytest

from app.core.exceptions import ConflictError, InvalidCredentialsError
from app.core.security import password_hasher
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import AuthService


@pytest.fixture()
def mock_repository(monkeypatch):
    """Replace AuthService's real UserRepository with a fake one we fully control."""
    mock_repo = MagicMock()
    monkeypatch.setattr(
        "app.services.auth_service.UserRepository",
        lambda db: mock_repo,
    )
    return mock_repo


def test_register_creates_new_user_when_email_is_free(mock_repository):
    mock_repository.get_by_email.return_value = None
    mock_repository.create.return_value = User(
        id=1, fullname="Ali Khan", email="ali@example.com", password_hash="hashed"
    )

    service = AuthService(db=MagicMock())
    data = UserCreate(fullname="Ali Khan", email="ali@example.com", password="mypassword123")

    result = service.register(data)

    assert result.email == "ali@example.com"
    mock_repository.get_by_email.assert_called_once_with("ali@example.com")
    mock_repository.create.assert_called_once()


def test_register_rejects_duplicate_email(mock_repository):
    mock_repository.get_by_email.return_value = User(
        id=1, fullname="Existing User", email="ali@example.com", password_hash="hashed"
    )

    service = AuthService(db=MagicMock())
    data = UserCreate(fullname="Ali Khan", email="ali@example.com", password="mypassword123")

    with pytest.raises(ConflictError):
        service.register(data)

    mock_repository.create.assert_not_called()


def test_login_succeeds_with_correct_password(mock_repository):
    real_hash = password_hasher.hash("mypassword123")
    mock_repository.get_by_email.return_value = User(
        id=1, fullname="Ali Khan", email="ali@example.com",
        password_hash=real_hash, is_active=True,
    )

    service = AuthService(db=MagicMock())
    data = UserLogin(email="ali@example.com", password="mypassword123")

    result = service.login(data)

    assert isinstance(result, Token)
    assert result.token_type == "bearer"


def test_login_rejects_wrong_password(mock_repository):
    real_hash = password_hasher.hash("mypassword123")
    mock_repository.get_by_email.return_value = User(
        id=1, fullname="Ali Khan", email="ali@example.com",
        password_hash=real_hash, is_active=True,
    )

    service = AuthService(db=MagicMock())
    data = UserLogin(email="ali@example.com", password="wrongpassword")

    with pytest.raises(InvalidCredentialsError):
        service.login(data)


def test_login_rejects_nonexistent_email(mock_repository):
    mock_repository.get_by_email.return_value = None

    service = AuthService(db=MagicMock())
    data = UserLogin(email="nobody@example.com", password="whatever123")

    with pytest.raises(InvalidCredentialsError):
        service.login(data)


def test_login_rejects_inactive_user(mock_repository):
    real_hash = password_hasher.hash("mypassword123")
    mock_repository.get_by_email.return_value = User(
        id=1, fullname="Ali Khan", email="ali@example.com",
        password_hash=real_hash, is_active=False,
    )

    service = AuthService(db=MagicMock())
    data = UserLogin(email="ali@example.com", password="mypassword123")

    with pytest.raises(InvalidCredentialsError):
        service.login(data)
        
    
# Command to run the tests:
# pytest tests/unit/test_auth_services.py -v
# run test from the backend directory