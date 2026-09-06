import pytest
from sqlalchemy.exc import IntegrityError,StatementError

from app.models.category import Category
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User


@pytest.fixture()
def existing_user(db_session):
    user = User(fullname="Ali Khan", email="ali@example.com", password_hash="hashed")
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture()
def existing_category(db_session, existing_user):
    category = Category(user_id=existing_user.id, name="Work")
    db_session.add(category)
    db_session.commit()
    return category


def test_create_task_with_required_fields_only(db_session, existing_user):
    task = Task(user_id=existing_user.id, title="Learn SQLAlchemy")
    db_session.add(task)
    db_session.commit()

    assert task.id is not None
    assert task.status == TaskStatus.TODO
    assert task.priority == TaskPriority.MEDIUM
    assert task.category_id is None
    assert task.completed_at is None
    assert task.created_at is not None
    assert task.updated_at is not None


def test_task_requires_user_id(db_session):
    task = Task(title="No owner")
    db_session.add(task)

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_task_requires_title(db_session, existing_user):
    task = Task(user_id=existing_user.id, title=None)
    db_session.add(task)

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_task_can_belong_to_a_category(db_session, existing_user, existing_category):
    task = Task(
        user_id=existing_user.id,
        category_id=existing_category.id,
        title="Study relationships",
    )
    db_session.add(task)
    db_session.commit()

    assert task.category_id == existing_category.id
    assert task.category.name == "Work"


def test_task_can_be_uncategorized(db_session, existing_user):
    task = Task(user_id=existing_user.id, title="Buy groceries")
    db_session.add(task)
    db_session.commit()

    assert task.category_id is None
    assert task.category is None


def test_invalid_status_value_rejected(db_session, existing_user):
    task = Task(user_id=existing_user.id, title="Bad status", status="NOT_A_REAL_STATUS")
    db_session.add(task)

    with pytest.raises(StatementError):
        db_session.commit()


def test_deleting_category_does_not_delete_task(db_session, existing_user, existing_category):
    task = Task(
        user_id=existing_user.id,
        category_id=existing_category.id,
        title="Should survive",
    )
    db_session.add(task)
    db_session.commit()
    task_id = task.id

    db_session.delete(existing_category)
    db_session.commit()

    task.category_id = None  # manual, since no service layer exists yet — see note below
    db_session.commit()

    survived = db_session.get(Task, task_id)
    assert survived is not None
    assert survived.title == "Should survive"