import uuid
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.jobs.notification_scheduler import check_task_due_dates
from app.main import app
from app.models.category import Category
from app.models.notification import Notification
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
        db.query(Notification).filter(Notification.user_id == user.id).delete()
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


def _create_task(headers, **overrides):
    payload = {"title": "Sample task"}
    payload.update(overrides)
    return client.post("/api/v1/tasks", headers=headers, json=payload).json()


def _create_category(headers, name="Work"):
    return client.post("/api/v1/categories", headers=headers, json={"name": name}).json()


def _get_notifications(headers, **params):
    return client.get("/api/v1/notifications", headers=headers, params=params)


def _notification_types(response_json) -> list[str]:
    return [n["notification_type"] for n in response_json["items"]]


# ---------- Action-triggered: task lifecycle ----------

class TestTaskTriggeredNotifications:
    def test_starting_a_task_creates_notification(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/start", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"]).json()
        assert "TASK_STARTED" in _notification_types(body)

    def test_starting_already_started_task_does_not_duplicate_notification(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/start", headers=user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/start", headers=user_a["headers"])  # no-op

        body = _get_notifications(user_a["headers"]).json()
        started_count = _notification_types(body).count("TASK_STARTED")
        assert started_count == 1

    def test_completing_a_task_creates_notification(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"]).json()
        assert "TASK_COMPLETED" in _notification_types(body)

    def test_completing_already_completed_task_does_not_duplicate_notification(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])  # no-op

        body = _get_notifications(user_a["headers"]).json()
        completed_count = _notification_types(body).count("TASK_COMPLETED")
        assert completed_count == 1

    def test_deleting_a_task_creates_notification(self, user_a):
        task = _create_task(user_a["headers"], title="Doomed task")
        client.delete(f"/api/v1/tasks/{task['id']}", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"]).json()
        assert "TASK_DELETED" in _notification_types(body)
        deleted_notification = next(
            n for n in body["items"] if n["notification_type"] == "TASK_DELETED"
        )
        assert "Doomed task" in deleted_notification["message"]
        assert deleted_notification["task_id"] is None  # task no longer exists


# ---------- Action-triggered: category & account ----------

class TestOtherTriggeredNotifications:
    def test_deleting_category_creates_notification_with_task_count(self, user_a):
        category = _create_category(user_a["headers"], "Work")
        _create_task(user_a["headers"], category_id=category["id"])
        _create_task(user_a["headers"], category_id=category["id"])

        client.delete(f"/api/v1/categories/{category['id']}", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"]).json()
        notification = next(
            n for n in body["items"] if n["notification_type"] == "CATEGORY_DELETED"
        )
        assert "2 tasks" in notification["message"]

    def test_changing_password_creates_notification(self, user_a):
        client.patch(
            "/api/v1/users/me/password",
            headers=user_a["headers"],
            json={"current_password": "mypassword123", "new_password": "newpassword456"},
        )

        body = _get_notifications(user_a["headers"]).json()
        assert "PASSWORD_CHANGED" in _notification_types(body)

    def test_resetting_password_creates_notification(self, user_a, monkeypatch):
        mock_send = []
        monkeypatch.setattr(
            "app.services.auth_service.email_service.send_email",
            lambda **kwargs: mock_send.append(kwargs),
        )

        client.post("/api/v1/auth/forgot-password", json={"email": user_a["email"]})
        import re
        token = re.search(r"token=([^\s]+)", mock_send[0]["body"]).group(1)

        client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "resetpassword789"},
        )

        body = _get_notifications(user_a["headers"]).json()
        assert "PASSWORD_CHANGED" in _notification_types(body)


# ---------- Ownership & isolation ----------

class TestNotificationOwnership:
    def test_notifications_requires_auth(self):
        response = client.get("/api/v1/notifications")
        assert response.status_code == 401

    def test_users_only_see_their_own_notifications(self, user_a, user_b):
        task_a = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task_a['id']}/complete", headers=user_a["headers"])

        body_b = _get_notifications(user_b["headers"]).json()
        assert body_b["items"] == []

    def test_mark_read_on_another_users_notification_returns_404(self, user_a, user_b):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])
        notification = _get_notifications(user_a["headers"]).json()["items"][0]

        response = client.patch(
            f"/api/v1/notifications/{notification['id']}/read", headers=user_b["headers"]
        )
        assert response.status_code == 404

    def test_delete_another_users_notification_returns_404(self, user_a, user_b):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])
        notification = _get_notifications(user_a["headers"]).json()["items"][0]

        response = client.delete(
            f"/api/v1/notifications/{notification['id']}", headers=user_b["headers"]
        )
        assert response.status_code == 404


# ---------- Mark read / mark all read / delete ----------

class TestReadAndDelete:
    def test_new_notification_starts_unread(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        notification = _get_notifications(user_a["headers"]).json()["items"][0]
        assert notification["is_read"] is False
        assert notification["read_at"] is None

    def test_mark_read_sets_is_read_and_read_at(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])
        notification = _get_notifications(user_a["headers"]).json()["items"][0]

        response = client.patch(
            f"/api/v1/notifications/{notification['id']}/read", headers=user_a["headers"]
        )

        assert response.status_code == 200
        body = response.json()
        assert body["is_read"] is True
        assert body["read_at"] is not None

    def test_mark_read_is_idempotent(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])
        notification = _get_notifications(user_a["headers"]).json()["items"][0]

        first = client.patch(
            f"/api/v1/notifications/{notification['id']}/read", headers=user_a["headers"]
        ).json()
        second = client.patch(
            f"/api/v1/notifications/{notification['id']}/read", headers=user_a["headers"]
        ).json()

        assert first["read_at"] == second["read_at"]

    def test_unread_count_reflects_only_unread(self, user_a):
        t1 = _create_task(user_a["headers"], title="One")
        t2 = _create_task(user_a["headers"], title="Two")
        client.post(f"/api/v1/tasks/{t1['id']}/complete", headers=user_a["headers"])
        client.post(f"/api/v1/tasks/{t2['id']}/complete", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"]).json()
        first_id = body["items"][0]["id"]
        client.patch(f"/api/v1/notifications/{first_id}/read", headers=user_a["headers"])

        body_after = _get_notifications(user_a["headers"]).json()
        assert body_after["unread_count"] == 1

    def test_mark_all_read_clears_unread_count(self, user_a):
        t1 = _create_task(user_a["headers"], title="One")
        t2 = _create_task(user_a["headers"], title="Two")
        client.post(f"/api/v1/tasks/{t1['id']}/complete", headers=user_a["headers"])
        client.post(f"/api/v1/tasks/{t2['id']}/complete", headers=user_a["headers"])

        response = client.patch("/api/v1/notifications/read-all", headers=user_a["headers"])
        assert response.status_code == 204

        body = _get_notifications(user_a["headers"]).json()
        assert body["unread_count"] == 0
        assert all(n["is_read"] for n in body["items"])

    def test_delete_notification_removes_it(self, user_a):
        task = _create_task(user_a["headers"])
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])
        notification = _get_notifications(user_a["headers"]).json()["items"][0]

        response = client.delete(
            f"/api/v1/notifications/{notification['id']}", headers=user_a["headers"]
        )
        assert response.status_code == 204

        body = _get_notifications(user_a["headers"]).json()
        assert notification["id"] not in [n["id"] for n in body["items"]]

    def test_delete_nonexistent_notification_returns_404(self, user_a):
        response = client.delete("/api/v1/notifications/999999", headers=user_a["headers"])
        assert response.status_code == 404


# ---------- Task deletion detaches notifications (SET NULL) ----------

class TestTaskDeletionDetachesNotification:
    def test_deleting_task_nulls_task_id_on_earlier_notifications(self, user_a):
        task = _create_task(user_a["headers"], title="Will be deleted")
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        body_before = _get_notifications(user_a["headers"]).json()
        completed_notification = next(
            n for n in body_before["items"] if n["notification_type"] == "TASK_COMPLETED"
        )
        assert completed_notification["task_id"] == task["id"]

        client.delete(f"/api/v1/tasks/{task['id']}", headers=user_a["headers"])

        body_after = _get_notifications(user_a["headers"]).json()
        same_notification = next(
            n for n in body_after["items"] if n["id"] == completed_notification["id"]
        )
        assert same_notification["task_id"] is None  # detached, not deleted


# ---------- Scheduler job: time-based notifications ----------

class TestScheduledNotifications:
    def test_scheduler_creates_due_today_notification(self, user_a):
        _create_task(
            user_a["headers"], title="Due today task", due_date=date.today().isoformat()
        )

        check_task_due_dates()

        body = _get_notifications(user_a["headers"]).json()
        assert "TASK_DUE_TODAY" in _notification_types(body)

    def test_scheduler_creates_due_tomorrow_notification(self, user_a):
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        _create_task(user_a["headers"], title="Due tomorrow task", due_date=tomorrow)

        check_task_due_dates()

        body = _get_notifications(user_a["headers"]).json()
        assert "TASK_DUE_TOMORROW" in _notification_types(body)

    def test_scheduler_creates_overdue_notification(self, user_a):
        past = (date.today() - timedelta(days=2)).isoformat()
        _create_task(user_a["headers"], title="Overdue task", due_date=past)

        check_task_due_dates()

        body = _get_notifications(user_a["headers"]).json()
        assert "TASK_OVERDUE" in _notification_types(body)

    def test_scheduler_does_not_duplicate_on_repeated_runs(self, user_a):
        past = (date.today() - timedelta(days=2)).isoformat()
        _create_task(user_a["headers"], title="Overdue task", due_date=past)

        check_task_due_dates()
        check_task_due_dates()  # simulate the next scheduled run
        check_task_due_dates()

        body = _get_notifications(user_a["headers"]).json()
        overdue_count = _notification_types(body).count("TASK_OVERDUE")
        assert overdue_count == 1

    def test_scheduler_ignores_completed_tasks(self, user_a):
        past = (date.today() - timedelta(days=2)).isoformat()
        task = _create_task(user_a["headers"], title="Overdue but done", due_date=past)
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        check_task_due_dates()

        body = _get_notifications(user_a["headers"]).json()
        assert "TASK_OVERDUE" not in _notification_types(body)

    def test_scheduler_ignores_tasks_with_no_due_date(self, user_a):
        _create_task(user_a["headers"], title="No due date")

        check_task_due_dates()  # should not error, should not create anything

        body = _get_notifications(user_a["headers"]).json()
        assert body["items"] == []

    def test_editing_due_date_clears_stale_notification_and_allows_rescheduling(self, user_a):
        past = (date.today() - timedelta(days=2)).isoformat()
        task = _create_task(user_a["headers"], title="Shifting task", due_date=past)

        check_task_due_dates()
        body = _get_notifications(user_a["headers"]).json()
        assert "TASK_OVERDUE" in _notification_types(body)

        future = (date.today() + timedelta(days=5)).isoformat()
        client.patch(
            f"/api/v1/tasks/{task['id']}", headers=user_a["headers"], json={"due_date": future}
        )

        body_after_edit = _get_notifications(user_a["headers"]).json()
        assert "TASK_OVERDUE" not in _notification_types(body_after_edit)

        check_task_due_dates()  # should not fire anything yet, future date not yet relevant
        body_final = _get_notifications(user_a["headers"]).json()
        assert "TASK_OVERDUE" not in _notification_types(body_final)
        assert "TASK_DUE_TODAY" not in _notification_types(body_final)
        assert "TASK_DUE_TOMORROW" not in _notification_types(body_final)


# ---------- Pagination ----------

class TestNotificationPagination:
    def test_pagination_limits_and_reports_total(self, user_a):
        for i in range(5):
            task = _create_task(user_a["headers"], title=f"Task {i}")
            client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"], page=1, page_size=2).json()

        assert len(body["items"]) == 2
        assert body["total"] == 5
        assert body["page"] == 1
        assert body["page_size"] == 2

    def test_notifications_sorted_newest_first(self, user_a):
        t1 = _create_task(user_a["headers"], title="First")
        client.post(f"/api/v1/tasks/{t1['id']}/complete", headers=user_a["headers"])
        t2 = _create_task(user_a["headers"], title="Second")
        client.post(f"/api/v1/tasks/{t2['id']}/complete", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"]).json()
        messages = [n["message"] for n in body["items"]]

        assert messages[0] == 'You completed "Second".'
        assert messages[1] == 'You completed "First".'

# ---------- Pagination validation ----------

class TestNotificationPaginationValidation:
    def test_page_zero_is_rejected(self, user_a):
        response = _get_notifications(user_a["headers"], page=0)
        assert response.status_code == 422

    def test_negative_page_is_rejected(self, user_a):
        response = _get_notifications(user_a["headers"], page=-1)
        assert response.status_code == 422

    def test_page_size_over_limit_is_rejected(self, user_a):
        response = _get_notifications(user_a["headers"], page_size=101)
        assert response.status_code == 422

    def test_page_size_zero_is_rejected(self, user_a):
        response = _get_notifications(user_a["headers"], page_size=0)
        assert response.status_code == 422


# ---------- mark_all_read does not disturb already-read timestamps ----------

class TestMarkAllReadPreservesExistingReadState:
    def test_mark_all_read_does_not_change_read_at_of_already_read_notification(self, user_a):
        t1 = _create_task(user_a["headers"], title="Already read")
        client.post(f"/api/v1/tasks/{t1['id']}/complete", headers=user_a["headers"])
        first_notification = _get_notifications(user_a["headers"]).json()["items"][0]

        marked = client.patch(
            f"/api/v1/notifications/{first_notification['id']}/read", headers=user_a["headers"]
        ).json()
        original_read_at = marked["read_at"]

        t2 = _create_task(user_a["headers"], title="Still unread")
        client.post(f"/api/v1/tasks/{t2['id']}/complete", headers=user_a["headers"])

        client.patch("/api/v1/notifications/read-all", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"]).json()
        same_notification = next(n for n in body["items"] if n["id"] == first_notification["id"])
        assert same_notification["read_at"] == original_read_at

    def test_mark_all_read_marks_the_previously_unread_one(self, user_a):
        t1 = _create_task(user_a["headers"], title="Already read")
        client.post(f"/api/v1/tasks/{t1['id']}/complete", headers=user_a["headers"])
        first_notification = _get_notifications(user_a["headers"]).json()["items"][0]
        client.patch(
            f"/api/v1/notifications/{first_notification['id']}/read", headers=user_a["headers"]
        )

        t2 = _create_task(user_a["headers"], title="Still unread")
        client.post(f"/api/v1/tasks/{t2['id']}/complete", headers=user_a["headers"])

        client.patch("/api/v1/notifications/read-all", headers=user_a["headers"])

        body = _get_notifications(user_a["headers"]).json()
        assert all(n["is_read"] for n in body["items"])
        assert body["unread_count"] == 0


# ---------- Scheduler against an empty / minimal database ----------

class TestSchedulerEdgeCases:
    def test_scheduler_runs_cleanly_with_zero_tasks(self, user_a):
        # No tasks created at all for this user
        check_task_due_dates()  # should not raise

        body = _get_notifications(user_a["headers"]).json()
        assert body["items"] == []

    def test_scheduler_handles_mixed_due_date_and_no_due_date_tasks_together(self, user_a):
        _create_task(user_a["headers"], title="No due date")
        _create_task(user_a["headers"], title="Due today", due_date=date.today().isoformat())

        check_task_due_dates()

        body = _get_notifications(user_a["headers"]).json()
        assert len(body["items"]) == 1
        assert body["items"][0]["notification_type"] == "TASK_DUE_TODAY"


# ---------- Scheduler isolation across multiple users ----------

class TestSchedulerCrossUserIsolation:
    def test_scheduler_notifies_each_user_only_for_their_own_tasks(self, user_a, user_b):
        today = date.today().isoformat()
        _create_task(user_a["headers"], title="User A's task", due_date=today)
        _create_task(user_b["headers"], title="User B's task", due_date=today)

        check_task_due_dates()

        body_a = _get_notifications(user_a["headers"]).json()
        body_b = _get_notifications(user_b["headers"]).json()

        assert len(body_a["items"]) == 1
        assert len(body_b["items"]) == 1
        assert "User A's task" in body_a["items"][0]["message"]
        assert "User B's task" in body_b["items"][0]["message"]

    def test_scheduler_does_not_cross_contaminate_overdue_and_due_today(self, user_a, user_b):
        past = (date.today() - timedelta(days=3)).isoformat()
        today = date.today().isoformat()
        _create_task(user_a["headers"], title="A overdue", due_date=past)
        _create_task(user_b["headers"], title="B due today", due_date=today)

        check_task_due_dates()

        body_a = _get_notifications(user_a["headers"]).json()
        body_b = _get_notifications(user_b["headers"]).json()

        assert _notification_types(body_a) == ["TASK_OVERDUE"]
        assert _notification_types(body_b) == ["TASK_DUE_TODAY"]


# to test case use this command from backend 
# pytest tests/integration/test_notifications.py -v