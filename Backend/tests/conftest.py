import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.user import User  # noqa: F401 — must import so Base "knows" about this table
from app.models.category import Category  # noqa: F401 — must import so Base "knows" about this table
from app.models.task import Task


@pytest.fixture()
def db_session():
    # Create an in-memory SQLite database for testing
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        engine.dispose()