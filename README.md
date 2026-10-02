🚀 TaskFlow

A modern, production-style task management application built with
FastAPI, PostgreSQL, SQLAlchemy, Alembic, React, and JWT
authentication.

TaskFlow is a full-stack productivity application designed to help users
organize tasks, manage categories, monitor productivity, and securely
manage their accounts.

The project was built with a strong focus on clean architecture,
RESTful API design, authentication, database relationships, validation,
maintainability, and a practical frontend/backend separation.

✨ Overview

TaskFlow allows each authenticated user to manage their own productivity
workspace.

Users can:

🔐 Create an account and securely log in

🔑 Reset forgotten passwords through email

👤 View and update their profile

🖼️ Upload and remove a profile avatar

📝 Create, update, view, and delete tasks

📂 Create and manage task categories

▶️ Start tasks

✅ Complete tasks

🔄 Reopen completed tasks

⏰ Track overdue tasks using due dates

📊 View dashboard statistics and productivity analytics

🔒 Access only their own tasks and categories

The application uses a FastAPI REST API as the backend and a React
frontend as the client.

🎯 Project Goals

TaskFlow was created to demonstrate how a real-world full-stack
application can be structured beyond basic CRUD.

The main goals were to practice and implement:

REST API development

JWT-based authentication

Password hashing and secure authentication flows

Password reset using expiring stateless tokens

PostgreSQL relational database design

SQLAlchemy ORM

Alembic database migrations

Pydantic validation

Layered backend architecture

Repository and service patterns

React component-based development

React Router navigation

Axios API integration

Protected frontend routes

Form validation and error handling

Responsive UI development

Dashboard analytics

Separation of frontend and backend responsibilities

🛠️ Tech Stack

Backend

Technology            Purpose

🐍 Python             Backend programming language
⚡ FastAPI            REST API framework
🗄️ PostgreSQL         Relational database
🔗 SQLAlchemy         ORM and database interaction
🔄 Alembic            Database migrations
📦 Pydantic           Request/response validation
🔐 JWT                Authentication
🔒 Password Hashing   Secure password storage
📧 Email Service      Password reset emails

Frontend

Technology            Purpose

⚛️ React              Frontend UI
⚡ Vite               Frontend build tool
🟨 JavaScript / JSX   Frontend development
🌐 Axios              API communication
🧭 React Router       Client-side routing
🎨 CSS                Styling
🎯 Lucide React       UI icons
📊 Recharts           Dashboard charts

🏗️ Architecture

TaskFlow follows a layered architecture on the backend to keep
responsibilities separated.

                         ┌──────────────────────┐
                         │      React UI        │
                         │   JavaScript / JSX   │
                         └──────────┬───────────┘
                                    │
                                    │ Axios / HTTP
                                    ▼
                         ┌──────────────────────┐
                         │    FastAPI Router    │
                         │   REST API Layer     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Services       │
                         │   Business Logic     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Repositories      │
                         │  Database Operations │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      SQLAlchemy      │
                         │         ORM          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │      Database        │
                         └──────────────────────┘

Backend responsibility flow

Request
   ↓
Router
   ↓
Schema Validation
   ↓
Service
   ↓
Repository
   ↓
SQLAlchemy
   ↓
PostgreSQL
   ↓
Response

This structure keeps API routing, business logic, and database
operations from becoming tightly coupled.

📁 Project Structure

The exact structure may evolve as the project grows, but the application
follows a feature-oriented frontend and layered backend approach.

Frontend

Frontend/
└── src/
    ├── features/
    │   ├── auth/
    │   │   ├── api/
    │   │   ├── pages/
    │   │   └── ...
    │   │
    │   ├── categories/
    │   │   ├── api/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   └── ...
    │   │
    │   ├── dashboard/
    │   ├── tasks/
    │   ├── users/
    │   └── ...
    │
    ├── shared/
    │   └── api/
    │       └── client.js
    │
    ├── components/
    ├── App.jsx
    ├── AppRoutes.jsx
    ├── main.jsx
    └── index.css

Backend

Backend/
└── app/
    ├── core/
    │   ├── config.py
    │   ├── security.py
    │   ├── exceptions.py
    │   └── email.py
    │
    ├── dependencies/
    │   └── database.py
    │
    ├── models/
    │   ├── user.py
    │   ├── task.py
    │   └── category.py
    │
    ├── repositories/
    │   ├── user_repository.py
    │   ├── task_repository.py
    │   └── category_repository.py
    │
    ├── schemas/
    │   ├── auth.py
    │   ├── user.py
    │   ├── task.py
    │   └── category.py
    │
    ├── services/
    │   ├── auth_service.py
    │   ├── task_service.py
    │   ├── category_service.py
    │   └── ...
    │
    └── routers/
        ├── auth.py
        ├── users.py
        ├── tasks.py
        ├── categories.py
        └── dashboard.py

🔐 Authentication & Security

Security is an important part of TaskFlow.

Registration

User
 ↓
Registration Form
 ↓
POST /api/v1/auth/register
 ↓
Validate user data
 ↓
Check existing email
 ↓
Hash password
 ↓
Create user
 ↓
Return user response

Passwords are not stored as plain text.

Login

Email + Password
       ↓
POST /api/v1/auth/login
       ↓
Find user
       ↓
Verify password
       ↓
Check account status
       ↓
Create JWT access token
       ↓
Return access token

The frontend stores the access token and Axios automatically attaches it
to authenticated API requests.

Axios Authentication

The shared Axios client uses an interceptor:

Request
   ↓
Read access_token
   ↓
Add Authorization header
   ↓
Bearer <token>
   ↓
FastAPI

This keeps authentication logic centralized instead of duplicating it
throughout every API function.

🔑 Forgot Password & Reset Password

TaskFlow includes a complete password recovery flow.

User forgets password
        ↓
Forgot Password page
        ↓
Enter email
        ↓
POST /api/v1/auth/forgot-password
        ↓
Backend generates reset token
        ↓
Reset link sent by email
        ↓
User opens reset page
        ↓
Token read from URL
        ↓
User creates new password
        ↓
POST /api/v1/auth/reset-password
        ↓
Backend validates token
        ↓
Password is hashed
        ↓
Password updated
        ↓
User returns to Login

Stateless reset token

The password reset token is designed as a stateless expiring token.

The backend does not need a reset-token database table for the token
itself.

The token contains the required information and an expiration time.

For example:

Reset Token
 ├── User ID
 ├── Token metadata
 └── Expiration

The configured reset-token lifetime is 10 minutes.

After expiration:

Valid token
   ↓
Password reset allowed

or:

Expired token
   ↓
Password reset rejected

👤 User Management

Authenticated users can manage their own account.

Available operations

View current profile

Update profile information

Change password

Upload avatar

Delete avatar

Users are isolated from other users' private data.

📝 Task Management

TaskFlow provides complete task lifecycle management.

Task fields

A task can contain:

Title

Description

Status

Priority

Due date

Category

Creation timestamp

Completion timestamp

Task statuses

TODO
  ↓
IN_PROGRESS
  ↓
COMPLETED

Completed tasks can also be reopened:

COMPLETED
    ↓
REOPEN
    ↓
TODO

Overdue tasks

Overdue is handled independently from the task status.

Due Date < Current Time
        ↓
is_overdue = true

This means a task can remain logically TODO or IN_PROGRESS while
also being overdue.

📂 Category Management

Users can organize their tasks using categories.

Example:

Work
Personal
Health
Finance
Learning

Each category belongs to a user.

Available operations:

Create category

List categories

Get category

Update category

Delete category

Tasks can optionally belong to a category.

📊 Dashboard

The dashboard provides productivity information instead of showing only
raw task data.

It can display:

Total tasks

Completed tasks

Pending tasks

In-progress tasks

Overdue tasks

Category statistics

Weekly productivity

Example conceptual flow:

                    Dashboard
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
   Task Summary    Category Stats   Productivity
        │               │               │
        ↓               ↓               ↓
     Counts         Distribution      Weekly Data

The frontend uses Recharts where graphical visualization is
required.

🌐 REST API

All main API endpoints use the /api/v1 prefix.

Health

GET /health

Checks whether the backend service is running.

🔐 Authentication

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

👤 Users

GET   /api/v1/users/me
PATCH /api/v1/users/me
PATCH /api/v1/users/me/password
POST  /api/v1/users/me/avatar
DELETE /api/v1/users/me/avatar

📂 Categories

POST   /api/v1/categories
GET    /api/v1/categories
GET    /api/v1/categories/{category_id}
PATCH  /api/v1/categories/{category_id}
DELETE /api/v1/categories/{category_id}

📝 Tasks

POST   /api/v1/tasks
GET    /api/v1/tasks
GET    /api/v1/tasks/{task_id}
PATCH  /api/v1/tasks/{task_id}
DELETE /api/v1/tasks/{task_id}

Task actions

POST /api/v1/tasks/{task_id}/start
POST /api/v1/tasks/{task_id}/complete
POST /api/v1/tasks/{task_id}/reopen

📊 Dashboard

GET /api/v1/dashboard

🔄 Frontend ↔ Backend Data Mapping

The frontend uses JavaScript-friendly naming while the backend uses
API/database naming conventions.

Backend           Frontend

category_id     categoryId
category_name   categoryName
due_date        dueDate
created_at      createdAt
completed_at    completedAt
is_overdue      isOverdue

Status values are also normalized between the API and UI.

Backend:
TODO
IN_PROGRESS
COMPLETED

Frontend:
todo
in_progress
completed

Overdue is intentionally kept separate from status.

🧭 Frontend Routing

TaskFlow uses React Router for client-side navigation.

Main routes include:

/login
/reset-password

/dashboard
/tasks
/categories
/profile
/settings

/tasks/new
/tasks/:taskId
/tasks/:taskId/edit

Protected routes require authentication.

Unauthenticated
      ↓
Protected Route
      ↓
Redirect → /login

Authenticated users can access the application workspace.

🎨 UI & UX

The frontend follows a clean productivity-focused design.

Main UI areas

Login

Registration

Forgot Password

Reset Password

Dashboard

My Tasks

Task Details

Create/Edit Task

Categories

Profile

Settings

Sidebar navigation

Bottom navigation

Header

Toast notifications

Loading states

Error states

Empty states

Visual system

TaskFlow uses a purple-based brand identity.

Primary:      #7C3AED
Hover:        #6D28D9
Brand Light:  #F5F3FF
Brand Soft:   #EDE9FE
Background:   #FAFAFA
Text:         #0F0F14
Muted:        #6B7280
Border:       #ECECEF
Card:         #FFFFFF

⚠️ Error Handling

The frontend handles common API and application states including:

400-level validation errors

Unauthorized requests

Forbidden requests

Not found errors

Server errors

Network errors

Empty task states

Empty category states

The application displays user-friendly messages rather than exposing raw
technical errors wherever possible.

🔄 API Integration Pattern

Frontend API functions are kept separate from UI components.

Example:

Component
   ↓
Feature API function
   ↓
Shared Axios client
   ↓
FastAPI endpoint

For example:

Create Category
      ↓
handleCreateCategory()
      ↓
createCategory()
      ↓
api.post("/categories")
      ↓
FastAPI

This keeps components focused on UI and interaction while API modules
handle HTTP communication.

🧪 Testing & Verification

TaskFlow was tested through functional user flows rather than relying
only on individual API calls.

Important verification areas include:

Authentication

Registration with valid data

Duplicate email handling

Login with valid credentials

Invalid login credentials

Protected route access

Logout

Password change

Password Recovery

Forgot password request

Email delivery

Correct reset URL

Valid reset token

Invalid reset token

Expired reset token

Password validation

Password confirmation

Login using the new password

Rejection of the old password

Tasks

Create task

View task

Edit task

Delete task

Start task

Complete task

Reopen task

Due date handling

Overdue detection

Categories

Create category

Edit category

Delete category

Load categories

Category/task relationship

Dashboard

Task statistics

Category statistics

Completion statistics

Overdue statistics

Statistics refresh after task changes

Navigation

Direct route access

Protected routes

Browser refresh

Browser back/forward

Public route behavior

Reset-password URL handling

⚙️ Environment Variables

The backend uses environment variables for configuration.

Example:

DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
FRONTEND_RESET_PASSWORD_URL=http://localhost:5173/reset-password
RESET_TOKEN_EXPIRE_MINUTES=10

Do not commit real credentials, secrets, database passwords, or email
credentials to Git.

Use a .env file locally and keep it out of version control.

🚀 Running the Project Locally

1. Clone the repository

git clone <your-repository-url>
cd TaskFlow

🐍 Backend Setup

Move into the backend directory:

cd Backend

Create a virtual environment:

Windows

python -m venv venv
venv\Scripts\activate

macOS / Linux

python3 -m venv venv
source venv/bin/activate

Install backend dependencies:

pip install -r requirements.txt

Configure your environment variables.

Then run database migrations:

alembic upgrade head

Start FastAPI:

uvicorn app.main:app --reload

The API should be available at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs

⚛️ Frontend Setup

Move into the frontend directory:

cd Frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The Vite application should normally be available at:

http://localhost:5173

🔗 Frontend API Configuration

The frontend uses a shared Axios client.

Example:

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

The client also attaches the JWT automatically when an access token
exists.

🗃️ Database

TaskFlow uses PostgreSQL as its primary relational database.

The database contains relationships between core entities such as:

User
 │
 ├── Tasks
 │     │
 │     └── Category
 │
 └── Categories

A user owns their tasks and categories, and authorization rules ensure
that users cannot manage another user's private records.

Database schema changes are managed through Alembic migrations.

🔄 Database Migration Workflow

When the SQLAlchemy models change:

alembic revision --autogenerate -m "describe change"

Then apply the migration:

alembic upgrade head

This keeps database changes version-controlled and reproducible.

🧠 Design Principles

TaskFlow follows several practical software engineering principles.

Separation of concerns

Each layer has a focused responsibility.

Router       → HTTP/API handling
Schema       → Validation
Service      → Business logic
Repository   → Database operations
Model        → Database structure

Reusability

Shared infrastructure such as Axios configuration and authentication
handling is centralized.

Maintainability

Features are organized into logical areas instead of putting all
application logic into a single file.

Security

Authentication, password hashing, token validation, user ownership, and
protected routes are treated as core application concerns.

Scalability

The architecture provides clear places to add future features without
putting all logic into the router or UI component.

📌 Key Features at a Glance

Feature                   Status

User Registration           ✅
JWT Login                   ✅
Protected Routes            ✅
Forgot Password             ✅
Email Reset Link            ✅
Expiring Reset Token        ✅
Password Validation         ✅
Profile Management          ✅
Avatar Upload               ✅
Task CRUD                   ✅
Task Lifecycle              ✅
Category CRUD               ✅
Dashboard Statistics        ✅
Productivity Analytics      ✅
PostgreSQL                  ✅
SQLAlchemy ORM              ✅
Alembic Migrations          ✅
React Frontend              ✅
Axios API Integration       ✅
React Router                ✅
Responsive Navigation       ✅
Error & Empty States        ✅

🛣️ Possible Future Improvements

TaskFlow currently provides the core productivity experience. Potential
future enhancements could include:

🔔 Real-time notifications

📅 Calendar integration

🔎 Advanced task filtering

🔃 Task sorting and pagination

🏷️ Multiple tags per task

👥 Task collaboration

📎 File attachments

🔔 Scheduled reminders

🌙 Dark mode

📱 Progressive Web App support

🧪 Automated frontend and backend test suites

🚀 Docker-based deployment

☁️ Production cloud deployment

📈 More advanced productivity analytics

These are potential extensions rather than requirements of the current
version.

🤝 Development Workflow

A typical feature follows this flow:

Requirement
    ↓
Backend Schema
    ↓
Database Model
    ↓
Repository
    ↓
Service
    ↓
Router / Endpoint
    ↓
API Testing
    ↓
Frontend API Function
    ↓
React Hook / State
    ↓
UI Component
    ↓
Functional Testing

This approach makes it easier to verify each part before moving to the
next.

🔒 Security Notes

For production deployment:

Use HTTPS.

Store secrets outside the repository.

Use a strong SECRET_KEY.

Restrict CORS to trusted frontend origins.

Use secure email credentials.

Never commit .env files containing secrets.

Validate input on the backend even when frontend validation exists.

Use secure production database credentials.

Configure appropriate token expiration policies.

Review file-upload validation and storage configuration.

📜 License

This project is intended as a full-stack development project and
portfolio application.

Add your preferred license here if the repository is being distributed
publicly.

👨‍💻 Project Summary

TaskFlow demonstrates a complete full-stack workflow from database
design and REST API development to frontend routing, authentication, API
integration, and user-facing productivity features.

The project focuses on building software with clear responsibilities
rather than simply implementing CRUD operations.

Core technologies

Python
FastAPI
PostgreSQL
SQLAlchemy
Alembic
JWT
React
JavaScript
Vite
Axios
React Router
Recharts
CSS

TaskFlow --- Plan tasks. Track progress. Stay productive. 🚀
