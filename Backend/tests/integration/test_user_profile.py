import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.main import app
from app.models.user import User

client = TestClient(app)


@pytest.fixture()
def registered_user():
    """Registers a real user, logs in, and hands back their auth header.
    Cleans up the user afterward, same pattern as test_auth_flow.py."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "mypassword123"

    client.post(
        "/api/v1/auth/register",
        json={"fullname": "Ali Khan", "email": email, "password": password},
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = login_response.json()["access_token"]

    yield {"email": email, "password": password, "headers": {"Authorization": f"Bearer {token}"}}

    db = SessionLocal()
    db.query(User).filter(User.email == email).delete()
    db.commit()
    db.close()


# --- GET /users/me ---

def test_get_profile_without_token_is_rejected():
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_get_profile_with_valid_token_returns_user_data(registered_user):
    response = client.get("/api/v1/users/me", headers=registered_user["headers"])

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == registered_user["email"]
    assert body["fullname"] == "Ali Khan"
    assert "password" not in body
    assert "password_hash" not in body


# --- PATCH /users/me ---

def test_update_profile_changes_requested_fields(registered_user):
    response = client.patch(
        "/api/v1/users/me",
        headers=registered_user["headers"],
        json={"fullname": "Ali Raza Khan", "bio": "Backend developer"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["fullname"] == "Ali Raza Khan"
    assert body["bio"] == "Backend developer"
    assert body["email"] == registered_user["email"]  # unchanged, as expected


def test_update_profile_partial_update_does_not_touch_other_fields(registered_user):
    client.patch(
        "/api/v1/users/me",
        headers=registered_user["headers"],
        json={"fullname": "First Update"},
    )

    response = client.patch(
        "/api/v1/users/me",
        headers=registered_user["headers"],
        json={"bio": "Only updating bio this time"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["fullname"] == "First Update"       # survived the second, unrelated PATCH
    assert body["bio"] == "Only updating bio this time"


def test_update_profile_cannot_change_email(registered_user):
    response = client.patch(
        "/api/v1/users/me",
        headers=registered_user["headers"],
        json={"fullname": "Ali Khan", "email": "hacker@example.com"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == registered_user["email"]  # ignored, not changed


# --- PATCH /users/me/password ---

def test_change_password_with_wrong_current_password_rejected(registered_user):
    response = client.patch(
        "/api/v1/users/me/password",
        headers=registered_user["headers"],
        json={"current_password": "wrongpassword", "new_password": "newpassword123"},
    )

    assert response.status_code == 401


def test_change_password_rejects_same_password(registered_user):
    response = client.patch(
        "/api/v1/users/me/password",
        headers=registered_user["headers"],
        json={
            "current_password": registered_user["password"],
            "new_password": registered_user["password"],
        },
    )

    assert response.status_code == 409


def test_change_password_success_and_old_password_stops_working(registered_user):
    response = client.patch(
        "/api/v1/users/me/password",
        headers=registered_user["headers"],
        json={"current_password": registered_user["password"], "new_password": "newpassword456"},
    )
    assert response.status_code == 204

    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": registered_user["password"]},
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": "newpassword456"},
    )
    assert new_login.status_code == 200
    

# Command to run the tests:
# pytest tests/integration/test_user_profile.py -v