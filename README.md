🚀 TaskFlow

A modern, production-style task management application built with
FastAPI, PostgreSQL, SQLAlchemy, Alembic, React, and JWT
authentication.

TaskFlow is a full-stack productivity application designed to help users
organize tasks, manage categories, monitor productivity, and securely
manage their accounts.

RESTful API design, authentication, database relationships, validation,
maintainability, and a practical frontend/backend separation**.

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

frontend** as the client.

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
🗄️ PostgreSQL R e     lational database
🔗 SQLAlchemy         ORM and database interaction
🔄 Alembic            Database migrations
📦 Pydantic           Request/response validation
🔐 JWT                Authentication
🔒 Password Hashing   Secure password storage
📧 Email Service      Password reset emails

Frontend

Technology            Purpose

⚛️ React F r          ontend UI
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

operations from becoming tightly coupled.

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
