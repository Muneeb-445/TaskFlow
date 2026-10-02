import re
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.core.config import settings
from app.core.database import SessionLocal
from app.main import app
from app.models.user import User

client = TestClient(app)


# ---------- Helpers & fixtures ----------

def _register(email: str, password: str = "mypassword123"):
    return client.post(
        "/api/v1/auth/register",
        json={"fullname": "Test User", "email": email, "password": password},
    )


def _login(email: str, password: str):
    return client.post("/api/v1/auth/login", json={"email": email, "password": password})


def _cleanup(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user:
        db.delete(user)
        db.commit()
    db.close()


@pytest.fixture()
def registered_user():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "mypassword123"
    _register(email, password)
    yield {"email": email, "password": password}
    _cleanup(email)


@pytest.fixture()
def mock_email(monkeypatch):
    """Replace the real email_service.send_email with a fake one that
    records every call, so tests never hit real Gmail."""
    mock = MagicMock()
    monkeypatch.setattr("app.services.auth_service.email_service.send_email", mock)
    return mock


def _extract_token_from_email_body(mock_email: MagicMock) -> str:
    body = mock_email.call_args.kwargs["body"]
    match = re.search(r"token=([^\s]+)", body)
    assert match is not None, "No reset token found in email body"
    return match.group(1)


def _build_token(subject: str, purpose: str | None, expires_delta: timedelta) -> str:
    payload = {"sub": subject, "exp": datetime.now(timezone.utc) + expires_delta}
    if purpose is not None:
        payload["purpose"] = purpose
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


# ---------- Forgot password ----------

class TestForgotPassword:
    def test_existing_email_sends_reset_email(self, registered_user, mock_email):
        response = client.post(
            "/api/v1/auth/forgot-password", json={"email": registered_user["email"]}
        )

        assert response.status_code == 200
        mock_email.assert_called_once()
        assert mock_email.call_args.kwargs["recipient_email"] == registered_user["email"]

    def test_nonexistent_email_returns_same_response_but_sends_nothing(self, mock_email):
        existing_response = None  # placeholder for clarity below

        response = client.post(
            "/api/v1/auth/forgot-password", json={"email": "nobody_at_all@example.com"}
        )

        assert response.status_code == 200
        mock_email.assert_not_called()

    def test_existing_and_nonexistent_email_produce_identical_response_bodies(
        self, registered_user, mock_email
    ):
        real_response = client.post(
            "/api/v1/auth/forgot-password", json={"email": registered_user["email"]}
        )
        fake_response = client.post(
            "/api/v1/auth/forgot-password", json={"email": "nobody_at_all@example.com"}
        )

        assert real_response.status_code == fake_response.status_code == 200
        assert real_response.json() == fake_response.json()

    def test_email_send_failure_still_returns_generic_success(self, registered_user, mock_email):
        """Directly tests the enumeration-leak bug we found and fixed:
        an SMTP failure must not produce a different response than success."""
        mock_email.side_effect = Exception("SMTP server unreachable")

        response = client.post(
            "/api/v1/auth/forgot-password", json={"email": registered_user["email"]}
        )

        assert response.status_code == 200
        assert "password reset link has been sent" in response.json()["message"]

    def test_invalid_email_format_rejected(self, mock_email):
        response = client.post("/api/v1/auth/forgot-password", json={"email": "not-an-email"})
        assert response.status_code == 422
        mock_email.assert_not_called()


# ---------- Reset password: happy path ----------

class TestResetPasswordSuccess:
    def test_reset_with_valid_token_changes_password(self, registered_user, mock_email):
        client.post("/api/v1/auth/forgot-password", json={"email": registered_user["email"]})
        token = _extract_token_from_email_body(mock_email)

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "brandnewpassword456"},
        )
        assert response.status_code == 200

        old_login = _login(registered_user["email"], registered_user["password"])
        assert old_login.status_code == 401

        new_login = _login(registered_user["email"], "brandnewpassword456")
        assert new_login.status_code == 200


# ---------- Reset password: rejections ----------

class TestResetPasswordRejections:
    def test_new_password_too_short_rejected(self, registered_user, mock_email):
        client.post("/api/v1/auth/forgot-password", json={"email": registered_user["email"]})
        token = _extract_token_from_email_body(mock_email)

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "short"},
        )
        assert response.status_code == 422

    def test_garbage_token_rejected(self):
        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": "not.a.real.token", "new_password": "newpassword123"},
        )
        assert response.status_code == 401

    def test_expired_token_rejected(self, registered_user):
        user = SessionLocal().query(User).filter(User.email == registered_user["email"]).first()
        expired_token = _build_token(
            subject=str(user.id), purpose="password_reset", expires_delta=timedelta(minutes=-1)
        )

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": expired_token, "new_password": "newpassword123"},
        )
        assert response.status_code == 401

    def test_token_for_nonexistent_user_rejected(self):
        fake_token = _build_token(
            subject="999999999", purpose="password_reset", expires_delta=timedelta(minutes=10)
        )

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": fake_token, "new_password": "newpassword123"},
        )
        assert response.status_code == 401

    def test_normal_access_token_rejected_as_reset_token(self, registered_user):
        """A login access token must NOT work as a password reset token,
        even though both are valid JWTs signed with the same key."""
        login = _login(registered_user["email"], registered_user["password"])
        access_token = login.json()["access_token"]

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"token": access_token, "new_password": "newpassword123"},
        )
        assert response.status_code == 401


# ---------- Cross-use protection ----------

class TestResetTokenCannotAuthenticate:
    def test_reset_token_cannot_be_used_as_bearer_token(self, registered_user, mock_email):
        """A password reset token must NOT grant access to protected routes."""
        client.post("/api/v1/auth/forgot-password", json={"email": registered_user["email"]})
        reset_token = _extract_token_from_email_body(mock_email)

        response = client.get(
            "/api/v1/users/me", headers={"Authorization": f"Bearer {reset_token}"}
        )
        assert response.status_code == 401
        
        
# Command to run this test file:
# pytest tests/integration/test_password_reset.py -v