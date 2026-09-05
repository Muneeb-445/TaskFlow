import pytest
from sqlalchemy.exc import IntegrityError

from app.models.user import User


def test_create_user_with_required_fields(db_session):
    user = User(
        fullname="Ali Khan",
        email="ali@example.com",
        password_hash="hashed_value",
    )
    db_session.add(user)
    db_session.commit()

    assert user.id is not None
    assert user.is_active is True
    assert user.created_at is not None
    assert user.updated_at is not None


def test_email_is_required(db_session):
    user = User(fullname="No Email", password_hash="hashed_value")
    db_session.add(user)

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_email_must_be_unique(db_session):
    user1 = User(fullname="User One", email="dup@example.com", password_hash="hash1")
    db_session.add(user1)
    db_session.commit()

    user2 = User(fullname="User Two", email="dup@example.com", password_hash="hash2")
    db_session.add(user2)

    with pytest.raises(IntegrityError):
        db_session.commit()
        


# Command to run the tests:
# pytest tests/unit/test_user_model.py -v
# run from backend directory