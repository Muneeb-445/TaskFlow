import uuid
from datetime import date, datetime, timedelta, timezone

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


def _get_dashboard(headers):
    return client.get("/api/v1/dashboard", headers=headers)


# ---------- Auth ----------

class TestDashboardAuth:
    def test_dashboard_requires_auth(self):
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 401


# ---------- Empty state ----------

class TestDashboardEmptyState:
    def test_dashboard_with_no_tasks_returns_all_zeros(self, user_a):
        response = _get_dashboard(user_a["headers"])
        body = response.json()

        assert response.status_code == 200
        assert body["total_tasks"] == 0
        assert body["completed_tasks"] == 0
        assert body["in_progress_tasks"] == 0
        assert body["pending_tasks"] == 0
        assert body["overdue_tasks"] == 0
        assert body["completion_percentage"] == 0
        assert body["due_today"] == []
        assert body["upcoming_tasks"] == []
        assert body["overdue_tasks_list"] == []
        assert body["category_statistics"] == []

    def test_weekly_productivity_always_has_seven_days_even_with_no_tasks(self, user_a):
        response = _get_dashboard(user_a["headers"])
        body = response.json()

        assert len(body["weekly_productivity"]) == 7
        for day in body["weekly_productivity"]:
            assert day["completed"] == 0
            assert day["created"] == 0


# ---------- Status counts & completion percentage ----------

class TestDashboardCounts:
    def test_total_and_status_counts_match_created_tasks(self, user_a):
        t1 = _create_task(user_a["headers"], title="Stays todo")
        t2 = _create_task(user_a["headers"], title="Goes in progress")
        t3 = _create_task(user_a["headers"], title="Gets completed")
        client.post(f"/api/v1/tasks/{t2['id']}/start", headers=user_a["headers"])
        client.post(f"/api/v1/tasks/{t3['id']}/complete", headers=user_a["headers"])

        body = _get_dashboard(user_a["headers"]).json()

        assert body["total_tasks"] == 3
        assert body["pending_tasks"] == 1
        assert body["in_progress_tasks"] == 1
        assert body["completed_tasks"] == 1

    def test_completion_percentage_rounds_correctly(self, user_a):
        t1 = _create_task(user_a["headers"], title="One")
        t2 = _create_task(user_a["headers"], title="Two")
        t3 = _create_task(user_a["headers"], title="Three")
        client.post(f"/api/v1/tasks/{t1['id']}/complete", headers=user_a["headers"])

        body = _get_dashboard(user_a["headers"]).json()

        # 1 of 3 completed = 33.33...% -> rounds to 33
        assert body["completion_percentage"] == 33

    def test_overdue_count_matches_overdue_list_length(self, user_a):
        past_date = (date.today() - timedelta(days=3)).isoformat()
        _create_task(user_a["headers"], title="Overdue one", due_date=past_date)
        _create_task(user_a["headers"], title="Overdue two", due_date=past_date)

        body = _get_dashboard(user_a["headers"]).json()

        # Same overdue definition must produce a consistent count and list length
        assert body["overdue_tasks"] == 2
        assert len(body["overdue_tasks_list"]) == 2

    def test_completed_overdue_task_excluded_from_overdue_count_and_list(self, user_a):
        past_date = (date.today() - timedelta(days=3)).isoformat()
        task = _create_task(user_a["headers"], title="Late but done", due_date=past_date)
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        body = _get_dashboard(user_a["headers"]).json()

        assert body["overdue_tasks"] == 0
        assert body["overdue_tasks_list"] == []


# ---------- Due Today ----------

class TestDueToday:
    def test_due_today_includes_incomplete_tasks_due_today(self, user_a):
        today = date.today().isoformat()
        _create_task(user_a["headers"], title="Due today", due_date=today)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["due_today"]]

        assert titles == ["Due today"]

    def test_due_today_excludes_completed_tasks(self, user_a):
        today = date.today().isoformat()
        task = _create_task(user_a["headers"], title="Done today", due_date=today)
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        body = _get_dashboard(user_a["headers"]).json()
        assert body["due_today"] == []

    def test_due_today_excludes_other_dates(self, user_a):
        today = date.today().isoformat()
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        _create_task(user_a["headers"], title="Today task", due_date=today)
        _create_task(user_a["headers"], title="Tomorrow task", due_date=tomorrow)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["due_today"]]

        assert titles == ["Today task"]

    def test_due_today_has_no_cap(self, user_a):
        today = date.today().isoformat()
        for i in range(6):
            _create_task(user_a["headers"], title=f"Task {i}", due_date=today)

        body = _get_dashboard(user_a["headers"]).json()
        assert len(body["due_today"]) == 6

    def test_due_today_sorted_by_priority_then_created_at(self, user_a):
        today = date.today().isoformat()
        _create_task(user_a["headers"], title="Low", priority="LOW", due_date=today)
        _create_task(user_a["headers"], title="High", priority="HIGH", due_date=today)
        _create_task(user_a["headers"], title="Medium", priority="MEDIUM", due_date=today)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["due_today"]]

        assert titles == ["High", "Medium", "Low"]


# ---------- Upcoming ----------

class TestUpcoming:
    def test_upcoming_excludes_today_and_past(self, user_a):
        today = date.today().isoformat()
        past = (date.today() - timedelta(days=1)).isoformat()
        future = (date.today() + timedelta(days=5)).isoformat()
        _create_task(user_a["headers"], title="Today task", due_date=today)
        _create_task(user_a["headers"], title="Past task", due_date=past)
        _create_task(user_a["headers"], title="Future task", due_date=future)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["upcoming_tasks"]]

        assert titles == ["Future task"]

    def test_upcoming_excludes_tasks_with_no_due_date(self, user_a):
        _create_task(user_a["headers"], title="No due date")
        future = (date.today() + timedelta(days=5)).isoformat()
        _create_task(user_a["headers"], title="Has due date", due_date=future)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["upcoming_tasks"]]

        assert titles == ["Has due date"]

    def test_upcoming_excludes_completed_tasks(self, user_a):
        future = (date.today() + timedelta(days=5)).isoformat()
        task = _create_task(user_a["headers"], title="Completed future", due_date=future)
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        body = _get_dashboard(user_a["headers"]).json()
        assert body["upcoming_tasks"] == []

    def test_upcoming_capped_at_four_nearest(self, user_a):
        for i in range(6):
            future = (date.today() + timedelta(days=i + 1)).isoformat()
            _create_task(user_a["headers"], title=f"Day+{i + 1}", due_date=future)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["upcoming_tasks"]]

        assert len(titles) == 4
        assert titles == ["Day+1", "Day+2", "Day+3", "Day+4"]

    def test_upcoming_returns_fewer_than_four_when_fewer_exist(self, user_a):
        future = (date.today() + timedelta(days=3)).isoformat()
        _create_task(user_a["headers"], title="Only one", due_date=future)

        body = _get_dashboard(user_a["headers"]).json()
        assert len(body["upcoming_tasks"]) == 1

    def test_upcoming_sorted_by_due_date_ascending(self, user_a):
        far = (date.today() + timedelta(days=20)).isoformat()
        near = (date.today() + timedelta(days=2)).isoformat()
        mid = (date.today() + timedelta(days=10)).isoformat()
        _create_task(user_a["headers"], title="Far", due_date=far)
        _create_task(user_a["headers"], title="Near", due_date=near)
        _create_task(user_a["headers"], title="Mid", due_date=mid)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["upcoming_tasks"]]

        assert titles == ["Near", "Mid", "Far"]


# ---------- Overdue list ----------

class TestOverdueList:
    def test_overdue_list_no_cap(self, user_a):
        past = (date.today() - timedelta(days=1)).isoformat()
        for i in range(6):
            _create_task(user_a["headers"], title=f"Overdue {i}", due_date=past)

        body = _get_dashboard(user_a["headers"]).json()
        assert len(body["overdue_tasks_list"]) == 6

    def test_overdue_list_sorted_oldest_first(self, user_a):
        three_days_ago = (date.today() - timedelta(days=3)).isoformat()
        one_day_ago = (date.today() - timedelta(days=1)).isoformat()
        _create_task(user_a["headers"], title="Recent", due_date=one_day_ago)
        _create_task(user_a["headers"], title="Oldest", due_date=three_days_ago)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["overdue_tasks_list"]]

        assert titles == ["Oldest", "Recent"]

    def test_overdue_list_tie_broken_by_priority(self, user_a):
        same_date = (date.today() - timedelta(days=2)).isoformat()
        _create_task(user_a["headers"], title="Low prio", priority="LOW", due_date=same_date)
        _create_task(user_a["headers"], title="High prio", priority="HIGH", due_date=same_date)
        _create_task(user_a["headers"], title="Medium prio", priority="MEDIUM", due_date=same_date)

        body = _get_dashboard(user_a["headers"]).json()
        titles = [t["title"] for t in body["overdue_tasks_list"]]

        assert titles == ["High prio", "Medium prio", "Low prio"]

    def test_overdue_list_excludes_future_and_no_due_date(self, user_a):
        future = (date.today() + timedelta(days=5)).isoformat()
        _create_task(user_a["headers"], title="No due date")
        _create_task(user_a["headers"], title="Future task", due_date=future)

        body = _get_dashboard(user_a["headers"]).json()
        assert body["overdue_tasks_list"] == []


# ---------- Category statistics ----------

class TestCategoryStatistics:
    def test_category_statistics_reflect_task_counts(self, user_a):
        work = _create_category(user_a["headers"], "Work")
        t1 = _create_task(user_a["headers"], title="Task 1", category_id=work["id"])
        t2 = _create_task(user_a["headers"], title="Task 2", category_id=work["id"])
        client.post(f"/api/v1/tasks/{t1['id']}/complete", headers=user_a["headers"])

        body = _get_dashboard(user_a["headers"]).json()
        work_stat = next(c for c in body["category_statistics"] if c["name"] == "Work")

        assert work_stat["task_count"] == 2
        assert work_stat["completed_count"] == 1
        assert work_stat["remaining_count"] == 1
        assert work_stat["progress_percentage"] == 50

    def test_category_with_zero_tasks_still_appears(self, user_a):
        _create_category(user_a["headers"], "Empty Category")

        body = _get_dashboard(user_a["headers"]).json()
        names = [c["name"] for c in body["category_statistics"]]

        assert "Empty Category" in names

    def test_category_statistics_trimmed_shape_no_timestamps(self, user_a):
        _create_category(user_a["headers"], "Work")

        body = _get_dashboard(user_a["headers"]).json()
        stat = body["category_statistics"][0]

        assert "created_at" not in stat
        assert "updated_at" not in stat


# ---------- Weekly productivity ----------

class TestWeeklyProductivity:
    def test_weekly_productivity_has_monday_to_sunday_labels(self, user_a):
        body = _get_dashboard(user_a["headers"]).json()
        days = [d["day"] for d in body["weekly_productivity"]]

        assert days == ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    def test_weekly_productivity_dates_are_consecutive_and_start_on_monday(self, user_a):
        body = _get_dashboard(user_a["headers"]).json()
        dates = [datetime.strptime(d["date"], "%Y-%m-%d").date() for d in body["weekly_productivity"]]

        assert dates[0].weekday() == 0  # Monday
        for i in range(1, 7):
            assert dates[i] == dates[0] + timedelta(days=i)

    def test_weekly_productivity_reflects_todays_activity(self, user_a):
        task = _create_task(user_a["headers"], title="Created and completed today")
        client.post(f"/api/v1/tasks/{task['id']}/complete", headers=user_a["headers"])

        body = _get_dashboard(user_a["headers"]).json()
        today_str = date.today().isoformat()
        today_entry = next(d for d in body["weekly_productivity"] if d["date"] == today_str)

        assert today_entry["created"] >= 1
        assert today_entry["completed"] >= 1


# ---------- Cross-user isolation ----------

class TestDashboardIsolation:
    def test_dashboard_only_reflects_own_data(self, user_a, user_b):
        _create_task(user_a["headers"], title="Mine")
        _create_task(user_b["headers"], title="Not mine")
        _create_task(user_b["headers"], title="Also not mine")

        body = _get_dashboard(user_a["headers"]).json()

        assert body["total_tasks"] == 1

    def test_dashboard_category_stats_only_own_categories(self, user_a, user_b):
        _create_category(user_a["headers"], "Mine")
        _create_category(user_b["headers"], "Not mine")

        body = _get_dashboard(user_a["headers"]).json()
        names = [c["name"] for c in body["category_statistics"]]

        assert names == ["Mine"]
        
        

# command to run this test file:
# pytest tests/integration/test_dashboard.py -v