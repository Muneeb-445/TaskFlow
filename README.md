# TaskFlow
TaskFlow is a task management REST API designed to help users organize and manage their daily tasks efficiently.
The project provides secure user authentication and allows users to create, update, delete, and track tasks.
Users can organize tasks using custom categories, priorities, and due dates.
It also supports task search, filtering, sorting, and pagination for efficient task management.
A productivity dashboard provides useful statistics about task completion and progress.
TaskFlow follows a layered architecture to keep the application maintainable and scalable.
The backend is built with Python and FastAPI.

1: PostgreSQL is used as the relational database with SQLAlchemy as the ORM.
2: Pydantic is used for request validation and response schemas.
3: JWT is used for authentication and authorization.
4: Alembic is used to manage database schema migrations.
5: Pytest is used for automated testing.
