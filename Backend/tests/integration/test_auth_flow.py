import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.main import app
from app.models.user import User

client = TestClient(app)


@pytest.fixture()
def test_email():
    """A unique email per test run, so repeated runs never collide
    with a leftover user from a previous run."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    yield email

    # Cleanup: since we're using the real dev database, remove
    # whatever this test created so it doesn't pile up.
    db = SessionLocal()
    db.query(User).filter(User.email == email).delete()
    db.commit()
    db.close()


def test_register_creates_user_and_persists_to_database(test_email):
    response = client.post(
        "/api/v1/auth/register",
        json={"fullname": "Ali Khan", "email": test_email, "password": "mypassword123"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == test_email
    assert "password" not in body
    assert "password_hash" not in body

    # Confirm it actually landed in Postgres, not just returned in the response
    db = SessionLocal()
    saved_user = db.query(User).filter(User.email == test_email).first()
    db.close()
    assert saved_user is not None
    assert saved_user.fullname == "Ali Khan"


def test_register_rejects_duplicate_email(test_email):
    payload = {"fullname": "Ali Khan", "email": test_email, "password": "mypassword123"}

    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


def test_login_succeeds_with_correct_credentials(test_email):
    client.post(
        "/api/v1/auth/register",
        json={"fullname": "Ali Khan", "email": test_email, "password": "mypassword123"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": "mypassword123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_rejects_wrong_password(test_email):
    client.post(
        "/api/v1/auth/register",
        json={"fullname": "Ali Khan", "email": test_email, "password": "mypassword123"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": "wrongpassword"},
    )

    assert response.status_code == 401


def test_login_rejects_nonexistent_email():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody_at_all@example.com", "password": "whatever123"},
    )

    assert response.status_code == 401


# command to run this test file:
# pytest tests/integration/test_auth_flow.py -v