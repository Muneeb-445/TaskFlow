import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.main import app
from app.models.category import Category
from app.models.task import Task, TaskStatus
from app.models.user import User

client = TestClient(app)


def _register_and_login():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "mypassword123"

    client.post(
        "/api/v1/auth/register",
        json={"fullname": "Test User", "email": email, "password": password},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = login.json()["access_token"]

    return {"email": email, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture()
def user_a():
    data = _register_and_login()
    yield data
    _cleanup(data["email"])


@pytest.fixture()
def user_b():
    data = _register_and_login()
    yield data
    _cleanup(data["email"])


def _cleanup(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user:
        db.query(Task).filter(Task.user_id == user.id).delete()
        db.query(Category).filter(Category.user_id == user.id).delete()
        db.delete(user)
        db.commit()
    db.close()


# --- Create ---

def test_create_category_success(user_a):
    response = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Work"
    assert body["task_count"] == 0
    assert body["completed_count"] == 0
    assert body["remaining_count"] == 0
    assert body["progress_percentage"] == 0


def test_create_category_duplicate_name_rejected(user_a):
    client.post("/api/v1/categories", headers=user_a["headers"], json={"name": "Work"})
    response = client.post("/api/v1/categories", headers=user_a["headers"], json={"name": "Work"})

    assert response.status_code == 409


def test_create_category_duplicate_case_insensitive_rejected(user_a):
    client.post("/api/v1/categories", headers=user_a["headers"], json={"name": "Work"})
    response = client.post("/api/v1/categories", headers=user_a["headers"], json={"name": "WORK"})

    assert response.status_code == 409


def test_create_category_same_name_allowed_for_different_users(user_a, user_b):
    first = client.post("/api/v1/categories", headers=user_a["headers"], json={"name": "Work"})
    second = client.post("/api/v1/categories", headers=user_b["headers"], json={"name": "Work"})

    assert first.status_code == 201
    assert second.status_code == 201


def test_create_category_requires_auth():
    response = client.post("/api/v1/categories", json={"name": "Work"})
    assert response.status_code == 401


# --- List ---

def test_get_categories_returns_only_own_categories(user_a, user_b):
    client.post("/api/v1/categories", headers=user_a["headers"], json={"name": "Work"})
    client.post("/api/v1/categories", headers=user_a["headers"], json={"name": "Personal"})
    client.post("/api/v1/categories", headers=user_b["headers"], json={"name": "Should Not Appear"})

    response = client.get("/api/v1/categories", headers=user_a["headers"])

    assert response.status_code == 200
    names = [c["name"] for c in response.json()]
    assert set(names) == {"Work", "Personal"}


# --- Get one ---

def test_get_category_by_id_success(user_a):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    response = client.get(f"/api/v1/categories/{created['id']}", headers=user_a["headers"])

    assert response.status_code == 200
    assert response.json()["name"] == "Work"


def test_get_category_nonexistent_returns_404(user_a):
    response = client.get("/api/v1/categories/999999", headers=user_a["headers"])
    assert response.status_code == 404


def test_get_category_belonging_to_another_user_returns_404(user_a, user_b):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    response = client.get(f"/api/v1/categories/{created['id']}", headers=user_b["headers"])
    assert response.status_code == 404


# --- Update ---

def test_update_category_renames_successfully(user_a):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    response = client.patch(
        f"/api/v1/categories/{created['id']}", headers=user_a["headers"], json={"name": "Office"}
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Office"


def test_update_category_to_existing_name_rejected(user_a):
    client.post("/api/v1/categories", headers=user_a["headers"], json={"name": "Work"})
    personal = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Personal"}
    ).json()

    response = client.patch(
        f"/api/v1/categories/{personal['id']}", headers=user_a["headers"], json={"name": "Work"}
    )
    assert response.status_code == 409


def test_update_category_to_same_name_is_allowed(user_a):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    response = client.patch(
        f"/api/v1/categories/{created['id']}", headers=user_a["headers"], json={"name": "Work"}
    )
    assert response.status_code == 200


def test_update_category_belonging_to_another_user_returns_404(user_a, user_b):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    response = client.patch(
        f"/api/v1/categories/{created['id']}", headers=user_b["headers"], json={"name": "Hacked"}
    )
    assert response.status_code == 404


# --- Delete ---

def test_delete_category_success(user_a):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    response = client.delete(f"/api/v1/categories/{created['id']}", headers=user_a["headers"])
    assert response.status_code == 204

    follow_up = client.get(f"/api/v1/categories/{created['id']}", headers=user_a["headers"])
    assert follow_up.status_code == 404


def test_delete_nonexistent_category_returns_404(user_a):
    response = client.delete("/api/v1/categories/999999", headers=user_a["headers"])
    assert response.status_code == 404


def test_delete_category_belonging_to_another_user_returns_404(user_a, user_b):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    response = client.delete(f"/api/v1/categories/{created['id']}", headers=user_b["headers"])
    assert response.status_code == 404


def test_delete_category_does_not_delete_its_tasks(user_a):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    # No Task API yet — insert a task directly via the DB to set up this scenario.
    db = SessionLocal()
    user = db.query(User).filter(User.email == user_a["email"]).first()
    task = Task(user_id=user.id, category_id=created["id"], title="Survive deletion")
    db.add(task)
    db.commit()
    task_id = task.id
    db.close()

    response = client.delete(f"/api/v1/categories/{created['id']}", headers=user_a["headers"])
    assert response.status_code == 204

    db = SessionLocal()
    survived_task = db.get(Task, task_id)
    db.close()
    assert survived_task is not None
    assert survived_task.category_id is None


# --- Stats calculation ---

def test_category_stats_reflect_task_counts(user_a):
    created = client.post(
        "/api/v1/categories", headers=user_a["headers"], json={"name": "Work"}
    ).json()

    db = SessionLocal()
    user = db.query(User).filter(User.email == user_a["email"]).first()
    db.add_all([
        Task(user_id=user.id, category_id=created["id"], title="Task 1", status=TaskStatus.COMPLETED),
        Task(user_id=user.id, category_id=created["id"], title="Task 2", status=TaskStatus.COMPLETED),
        Task(user_id=user.id, category_id=created["id"], title="Task 3", status=TaskStatus.TODO),
    ])
    db.commit()
    db.close()

    response = client.get(f"/api/v1/categories/{created['id']}", headers=user_a["headers"])

    assert response.status_code == 200
    body = response.json()
    assert body["task_count"] == 3
    assert body["completed_count"] == 2
    assert body["remaining_count"] == 1
    assert body["progress_percentage"] == 67  # round(2/3 * 100)
    
    
    
    
# command to run the tests:
# pytest tests/integration/test_category_flow.py -v