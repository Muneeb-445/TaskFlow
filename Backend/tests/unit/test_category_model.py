import pytest
from sqlalchemy.exc import IntegrityError

from app.models.category import Category
from app.models.user import User


@pytest.fixture()
def existing_user(db_session):
    user = User(fullname="Ali Khan", email="ali@example.com", password_hash="hashed")
    db_session.add(user)
    db_session.commit()
    return user


def test_create_category_with_valid_user(db_session, existing_user):
    category = Category(user_id=existing_user.id, name="Work")
    db_session.add(category)
    db_session.commit()

    assert category.id is not None
    assert category.name == "Work"
    assert category.created_at is not None
    assert category.updated_at is not None
    assert category.user_id == existing_user.id


def test_category_name_is_required(db_session, existing_user):
    category = Category(user_id=existing_user.id, name=None)
    db_session.add(category)

    """THIS LINE IS EXPECTED TO RAISE AN INTEGRITY ERROR AND TEST IS PASSED 
    BECAUSE THE NAME FIELD IS REQUIRED 
    AND IF IT DOESTNOT THROW AN ERROR THEN THE TEST SHOULD FAIL"""
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_category_requires_user_id(db_session):
    category = Category(user_id=None, name="Work")
    db_session.add(category)

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_duplicate_category_name_same_user_rejected(db_session, existing_user):
    db_session.add(Category(user_id=existing_user.id, name="Work"))
    db_session.commit()

    db_session.add(Category(user_id=existing_user.id, name="Work"))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_duplicate_category_name_case_insensitive_rejected(db_session, existing_user):
    db_session.add(Category(user_id=existing_user.id, name="Work"))
    db_session.commit()

    db_session.add(Category(user_id=existing_user.id, name="work"))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_same_category_name_allowed_for_different_users(db_session):
    user_a = User(fullname="User A", email="a@example.com", password_hash="hash")
    user_b = User(fullname="User B", email="b@example.com", password_hash="hash")
    db_session.add_all([user_a, user_b])
    db_session.commit()

    db_session.add(Category(user_id=user_a.id, name="Work"))
    db_session.add(Category(user_id=user_b.id, name="Work"))
    db_session.commit()  # should NOT raise — categories are scoped per user

    categories = db_session.query(Category).filter_by(name="Work").all()
    assert len(categories) == 2
    
# command to run the tests:
# pytest tests/unit/test_category_model.py -v
# run it from backend directory