import time
import uuid
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.main import app
from app.models.category import Category
from app.models.task import Task
from app.models.user import User

client = TestClient(app)


# ---------- Helpers & fixtures ----------

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


def _cleanup(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user:
        db.query(Task).filter(Task.user_id == user.id).delete()
        db.query(Category).filter(Category.user_id == user.id).delete()
        db.delete(user)
        db.commit()
    db.close()


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


def _create_category(headers, name="Work"):
    return client.post("/api/v1/categories", headers=headers, json={"name": name}).json()


def _create_task(headers, **overrides):
    payload = {"title": "Sample task"}
    payload.update(overrides)
    return client.post("/api/v1/tasks", headers=headers, json=payload).json()


# ---------- Create ----------

class TestCreateTask:
    def test_create_task_with_only_title_uses_defaults(self, user_a):
        response = client.post("/api/v1/tasks", headers=user_a["headers"], json={"title": "Buy milk"})

        assert response.status_code == 201
        body = response.json()
        assert body["title"] == "Buy milk"
        assert body["status"] == "TODO"
        assert body["priority"] == "MEDIUM"
        assert body["category_id"] is None
        assert body["category_name"] is None
        assert body["completed_at"] is None
        assert body["is_overdue"] is False

    def test_create_task_requires_auth(self):
        response = client.post("/api/v1/tasks", json={"title": "No auth"})
        assert response.status_code == 401

    def test_create_task_requires_title(self, user_a):
        response = client.post("/api/v1/tasks", headers=user_a["headers"], json={})
        assert response.status_code == 422

    def test_create_task_with_own_category_succeeds(self, user_a):
        category = _create_category(user_a["headers"], "Work")

        response = client.post(
            "/api/v1/tasks",
            headers=user_a["headers"],
            json={"title": "Fix bug", "category_id": category["id"]},
        )

        assert response.status_code == 201
        body = response.json()
        assert body["category_id"] == category["id"]
        assert body["category_name"] == "Work"

    def test_create_task_with_another_users_category_returns_404(self, user_a, user_b):
        other_category = _create_category(user_b["headers"], "Personal")

        response = client.post(
            "/api/v1/tasks",
            headers=user_a["headers"],
            json={"title": "Sneaky task", "category_id": other_category["id"]},
        )

        assert response.status_code == 404

    def test_create_task_with_nonexistent_category_returns_404(self, user_a):
        response = client.post(
            "/api/v1/tasks",
            headers=user_a["headers"],
            json={"title": "Bad category", "category_id": 999999},
        )
        assert response.status_code == 404

    def test_create_task_with_past_due_date_is_allowed(self, user_a):
        past_date = (date.today() - timedelta(days=5)).isoformat()
        response = client.post(
            "/api/v1/tasks",
            headers=user_a["headers"],
            json={"title": "Late task", "due_date": past_date},
        )
        assert response.status_code == 201
        assert response.json()["is_overdue"] is True


# ---------- Ownership: get / update / delete ----------

class TestTaskOwnership:
    def test_get_task_belonging_to_another_user_returns_404(self, user_a, user_b):
        task = _create_task(user_a["headers"])
        response = client.get(f"/api/v1/tasks/{task['id']}", headers=user_b["headers"])
        assert response.status_code == 404

    def test_get_nonexistent_task_returns_404(self, user_a):
        response = client.get("/api/v1/tasks/999999", headers=user_a["headers"])
        assert response.status_code == 404

    def test_update_task_belonging_to_another_user_returns_404(self, user_a, user_b):
        task = _create_task(user_a["headers"])
        response = client.patch(
            f"/api/v1/tasks/{task['id']}", headers=user_b["headers"], json={"title": "Hacked"}
        )
        assert response.status_code == 404

    def test_delete_task_belonging_to_another_user_returns_404(self, user_a, user_b):
        task = _create_task(user_a["headers"])
        response = client.delete(f"/api/v1/tasks/{task['id']}", headers=user_b["headers"])
        assert response.status_code == 404

    def test_start_complete_reopen_on_another_users_task_all_return_404(self, user_a, user_b):
        task = _create_task(user_a["headers"])
        tid = task["id"]

        for action in ("start", "complete", "reopen"):
            response = client.post(f"/api/v1/tasks/{tid}/{action}", headers=user_b["headers"])
            assert response.status_code == 404, f"{action} should 404 for another user's task"


# ---------- Update ----------

class TestUpdateTask:
    def test_partial_update_only_changes_given_fields(self, user_a):
        task = _create_task(user_a["headers"], description="Original description")

        response = client.patch(
            f"/api/v1/tasks/{task['id']}", headers=user_a["headers"], json={"title": "New title"}
        )

        assert response.status_code == 200
        body = response.json()
        assert body["title"] == "New title"
        assert body["description"] == "Original description"

    def test_update_cannot_change_status_via_patch(self, user_a):
        task = _create_task(user_a["headers"])

        response = client.patch(
            f"/api/v1/tasks/{task['id']}", headers=user_a["headers"], json={"status": "COMPLETED"}
        )

        assert response.status_code == 200
        assert response.json()["status"] == "TODO"  # ignored, unchanged

    def test_update_task_to_another_users_category_returns_404(self, user_a, user_b):
        task = _create_task(user_a["headers"])
        other_category = _create_category(user_b["headers"], "Personal")

        response = client.patch(
            f"/api/v1/tasks/{task['id']}",
            headers=user_a["headers"],
            json={"category_id": other_category["id"]},
        )
        assert response.status_code == 404

    def test_update_task_can_explicitly_clear_category(self, user_a):
        category = _create_category(user_a["headers"], "Work")
        task = _create_task(user_a["headers"], category_id=category["id"])

        response = client.patch(
            f"/api/v1/tasks/{task['id']}", headers=user_a["headers"], json={"category_id": None}
        )

        assert response.status_code == 200
        body = response.json()
        assert body["category_id"] is None
        assert body["category_name"] is None

    def test_update_task_without_category_field_leaves_it_unchanged(self, user_a):
        category = _create_category(user_a["headers"], "Work")
        task = _create_task(user_a["headers"], category_id=category["id"])

        response = client.patch(
            f"/api/v1/tasks/{task['id']}", headers=user_a["headers"], json={"title": "Renamed"}
        )

        assert response.status_code == 200
        body = response.json()
        assert body["category_id"] == category["id"]  # untouched, since not sent

# ---------- Delete ----------

class TestDeleteTask:
    def test_delete_task_success(self, user_a):
        task = _create_task(user_a["headers"])

        response = client.delete(f"/api/v1/tasks/{task['id']}", headers=user_a["headers"])
        assert response.status_code == 204

        follow_up = client.get(f"/api/v1/tasks/{task['id']}", headers=user_a["headers"])
        assert follow_up.status_code == 404

    def test_delete_nonexistent_task_returns_404(self, user_a):
        response = client.delete("/api/v1/tasks/999999", headers=user_a["headers"])
        assert response.status_code == 404


# ---------- Status transitions ----------

class TestStatusTransitions:
    def test_start_moves_todo_to_in_progress(self, user_a):
        task = _create_task(user_a["headers"])

        response = client.post(f"/api/v1/tasks/{task['id']}/start", headers=user_a["headers"])
        assert response.status_code == 200
        assert response.json()["status"] == "IN_PROGRESS"

    def test_start_is_idempotent_when_already_in_progress(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/start", headers=user_a["headers"])

        response = client.post(f"/api/v1/tasks/{task['id']}/start", headers=user_a["headers"])
        assert response.status_code == 200
        assert response.json()["status"] == "IN_PROGRESS"

    def test_complete_sets_status_and_completed_at(self, user_a):
        task = _create_task(user_a["headers"])

        response = client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "COMPLETED"
        assert body["completed_at"] is not None

    def test_complete_is_idempotent_when_already_completed(self, user_a):
        task = _create_task(user_a["headers"])
        first = client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"]).json()

        second = client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])
        assert second.status_code == 200
        # completed_at should not have been recalculated/changed on the no-op call
        assert second.json()["completed_at"] == first["completed_at"]

    def test_reopen_clears_status_and_completed_at(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        response = client.post(f"/api/v1/tasks/{task['id']}/reopen", headers=user_a["headers"])

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "TODO"
        assert body["completed_at"] is None

    def test_reopen_is_idempotent_when_already_todo(self, user_a):
        task = _create_task(user_a["headers"])

        response = client.post(f"/api/v1/tasks/{task['id']}/reopen", headers=user_a["headers"])
        assert response.status_code == 200
        assert response.json()["status"] == "TODO"

    def test_completing_a_past_due_task_makes_it_not_overdue(self, user_a):
        past_date = (date.today() - timedelta(days=5)).isoformat()
        task = _create_task(user_a["headers"], due_date=past_date)
        assert task["is_overdue"] is True

        response = client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])
        assert response.json()["is_overdue"] is False


# ---------- Filtering ----------

class TestFiltering:
    def test_search_matches_title(self, user_a):
        _create_task(user_a["headers"], title="Fix authentication bug")
        _create_task(user_a["headers"], title="Buy groceries")

        response = client.get("/api/v1/tasks?search=authentication", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["Fix authentication bug"]

    def test_search_matches_description(self, user_a):
        _create_task(user_a["headers"], title="Task one", description="mentions keyword here")
        _create_task(user_a["headers"], title="Task two", description="unrelated")

        response = client.get("/api/v1/tasks?search=keyword", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["Task one"]

    def test_filter_by_status(self, user_a):
        t1 = _create_task(user_a["headers"], title="Stays todo")
        t2 = _create_task(user_a["headers"], title="Gets completed")
        client.post(f"/api/v1/tasks/{t2['id']}/complete", headers=user_a["headers"])

        response = client.get("/api/v1/tasks?status=COMPLETED", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["Gets completed"]

    def test_filter_by_priority(self, user_a):
        _create_task(user_a["headers"], title="High one", priority="HIGH")
        _create_task(user_a["headers"], title="Low one", priority="LOW")

        response = client.get("/api/v1/tasks?priority=HIGH", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["High one"]

    def test_filter_by_category(self, user_a):
        work = _create_category(user_a["headers"], "Work")
        personal = _create_category(user_a["headers"], "Personal")
        _create_task(user_a["headers"], title="Work task", category_id=work["id"])
        _create_task(user_a["headers"], title="Personal task", category_id=personal["id"])

        response = client.get(f"/api/v1/tasks?category_id={work['id']}", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["Work task"]

    def test_filter_by_another_users_category_returns_empty_not_error(self, user_a, user_b):
        other_category = _create_category(user_b["headers"], "Personal")
        _create_task(user_a["headers"], title="My task")

        response = client.get(
            f"/api/v1/tasks?category_id={other_category['id']}", headers=user_a["headers"]
        )
        assert response.status_code == 200
        assert response.json()["items"] == []

    def test_filter_by_due_date(self, user_a):
        target = date.today() + timedelta(days=10)
        _create_task(user_a["headers"], title="On target date", due_date=target.isoformat())
        _create_task(user_a["headers"], title="Different date",
                     due_date=(target + timedelta(days=1)).isoformat())

        response = client.get(f"/api/v1/tasks?due_date={target.isoformat()}", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["On target date"]

    def test_combined_filters(self, user_a):
        work = _create_category(user_a["headers"], "Work")
        _create_task(user_a["headers"], title="Match", priority="HIGH", category_id=work["id"])
        _create_task(user_a["headers"], title="Wrong priority", priority="LOW", category_id=work["id"])

        response = client.get(
            f"/api/v1/tasks?priority=HIGH&category_id={work['id']}", headers=user_a["headers"]
        )
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["Match"]


# ---------- Sorting ----------

class TestSorting:
    def test_sort_by_priority_high_to_low(self, user_a):
        _create_task(user_a["headers"], title="Low", priority="LOW")
        _create_task(user_a["headers"], title="High", priority="HIGH")
        _create_task(user_a["headers"], title="Medium", priority="MEDIUM")

        response = client.get("/api/v1/tasks?sort_by=priority", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["High", "Medium", "Low"]

    def test_sort_by_due_date_puts_nulls_last(self, user_a):
        _create_task(user_a["headers"], title="No date")
        _create_task(user_a["headers"], title="Has date",
                     due_date=(date.today() + timedelta(days=5)).isoformat())

        response = client.get("/api/v1/tasks?sort_by=due_date", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["Has date", "No date"]

    def test_sort_by_title_alphabetical(self, user_a):
        _create_task(user_a["headers"], title="Zebra")
        _create_task(user_a["headers"], title="Apple")

        response = client.get("/api/v1/tasks?sort_by=title", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["Apple", "Zebra"]

    def test_sort_by_newest(self, user_a):
        _create_task(user_a["headers"], title="First")
        time.sleep(0.01)
        _create_task(user_a["headers"], title="Second")

        response = client.get("/api/v1/tasks?sort_by=newest", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles[0] == "Second"


# ---------- Pagination ----------

class TestPagination:
    def test_pagination_limits_items_and_reports_total(self, user_a):
        for i in range(5):
            _create_task(user_a["headers"], title=f"Task {i}")

        response = client.get("/api/v1/tasks?page=1&page_size=2", headers=user_a["headers"])
        body = response.json()

        assert len(body["items"]) == 2
        assert body["total"] == 5
        assert body["page"] == 1
        assert body["page_size"] == 2

    def test_page_zero_is_rejected(self, user_a):
        response = client.get("/api/v1/tasks?page=0", headers=user_a["headers"])
        assert response.status_code == 422

    def test_page_size_over_limit_is_rejected(self, user_a):
        response = client.get("/api/v1/tasks?page_size=101", headers=user_a["headers"])
        assert response.status_code == 422


# ---------- Status counts ----------

class TestStatusCounts:
    def test_counts_reflect_all_tasks_regardless_of_current_filter(self, user_a):
        t1 = _create_task(user_a["headers"], title="Todo one")
        t2 = _create_task(user_a["headers"], title="In progress one")
        t3 = _create_task(user_a["headers"], title="Completed one")
        client.post(f"/api/v1/tasks/{t2['id']}/start", headers=user_a["headers"])
        client.post(f"/api/v1/tasks/{t3['id']}/complete", headers=user_a["headers"])

        # Even while viewing only the "completed" filter, counts describe ALL tasks
        response = client.get("/api/v1/tasks?status=COMPLETED", headers=user_a["headers"])
        body = response.json()

        assert len(body["items"]) == 1
        assert body["pending_count"] == 1
        assert body["in_progress_count"] == 1
        assert body["completed_count"] == 1
        assert body["overdue_count"] == 0

    def test_overdue_count_excludes_completed_tasks(self, user_a):
        past_date = (date.today() - timedelta(days=1)).isoformat()
        overdue_task = _create_task(user_a["headers"], title="Overdue", due_date=past_date)
        completed_past = _create_task(user_a["headers"], title="Late but done", due_date=past_date)
        client.post(f"/api/v1/tasks/{completed_past['id']}/complete", headers=user_a["headers"])

        response = client.get("/api/v1/tasks", headers=user_a["headers"])
        assert response.json()["overdue_count"] == 1


# ---------- Cross-user isolation on the list endpoint ----------

class TestListIsolation:
    def test_get_tasks_returns_only_own_tasks(self, user_a, user_b):
        _create_task(user_a["headers"], title="Mine")
        _create_task(user_b["headers"], title="Not mine")

        response = client.get("/api/v1/tasks", headers=user_a["headers"])
        titles = [t["title"] for t in response.json()["items"]]
        assert titles == ["Mine"]

# ---------- Sort validation ----------

class TestSortValidation:
    def test_invalid_sort_by_rejected(self, user_a):
        response = client.get("/api/v1/tasks?sort_by=banana", headers=user_a["headers"])
        assert response.status_code == 422

    def test_invalid_sort_order_rejected(self, user_a):
        response = client.get("/api/v1/tasks?sort_order=upsidedown", headers=user_a["headers"])
        assert response.status_code == 422

# command to run this test file:
# pytest tests/integration/test_task_flow.py -v