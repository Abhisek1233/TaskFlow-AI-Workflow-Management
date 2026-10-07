# TaskFlow — AI-Assisted Workflow Management Platform

TaskFlow is a practical full-stack web application designed for engineering teams to organize tasks, monitor task lifecycles, and use AI-assisted task triage and next-action recommendations.

Built as a portfolio project for a **Forward Deployed Engineer Intern** role, TaskFlow demonstrates how to combine a high-performance **Python REST backend (FastAPI)**, a relational **PostgreSQL** database, an intuitive **React + Vite** frontend, and **Google Gemini AI API** integration into a clean, maintainable architecture.

---

## 1. Key Features

- **User Authentication**: Secure user registration, password hashing with `bcrypt`, and stateless JWT access tokens (24-hour expiration).
- **Task Management CRUD**: Full Create, Read, Update, and Delete operations for tasks with categories, priorities, statuses, and due dates.
- **User-Level Data Isolation**: Users can only read, update, and delete their own tasks through authenticated API endpoints. User-level authorization ensures authenticated users can only access their own tasks.
- **Search & Multi-Parameter Filtering**: Real-time filtering by status (`Pending`, `In Progress`, `Completed`), priority (`Low`, `Medium`, `High`, `Urgent`), category, and search terms across titles and descriptions.
- **Interactive Dashboard**: Real-time KPI metric cards (Total Tasks, Pending, In Progress, Completed, High/Urgent Priority) and progress tracking.
- **AI-Assisted Task Triage**: Direct integration with the **Google Gemini REST API** via Python `httpx`:
  - Analyzes messy task descriptions and bug reports.
  - Returns structured JSON: suggested priority, category, executive summary, and immediate next action.
  - Allows users to review and apply AI suggestions to task forms.
  - **Graceful Fallback**: A rule-based fallback analyzer provides basic task suggestions when the external AI API is unavailable or not configured.
- **Automated Test Suite**: 21 comprehensive pytest integration tests covering auth, CRUD, authorization boundaries, and AI endpoints.
- **Postman Collection**: Ready-to-import Postman collection with parameterized variables and automated token extraction.

---

## 2. Technology Stack

### Backend
- **Python 3.12+**
- **FastAPI**: Modern, high-performance web framework with automatic OpenAPI documentation.
- **SQLAlchemy 2.0**: Relational ORM with connection pooling.
- **PostgreSQL**: Relational database engine.
- **Pydantic v2**: Strict schema validation and data serialization.
- **Bcrypt**: Industry-standard salted password hashing.
- **PyJWT**: Secure JSON Web Token encoding and decoding.
- **HTTPX**: Async HTTP client for external Google Gemini API communication.
- **Pytest & TestClient**: Automated testing with in-memory SQLite isolation.

### Frontend
- **React 19**
- **Vite**: Next-generation frontend tooling and bundler.
- **Tailwind CSS**: Utility-first responsive styling.
- **Axios**: HTTP client with request and response interceptors.
- **React Router v7**: Client-side SPA navigation and protected route guards.
- **Lucide React**: Clean, accessible iconography.

### External AI Service
- **Google Gemini API** (`gemini-2.0-flash`, free on Google AI Studio) via backend proxy.

---

## 3. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│            (Vite, Tailwind CSS, Axios)                 │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTP Requests (Bearer JWT)
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 FastAPI REST Backend                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes (/api/auth, /api/tasks, /api/ai)          │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ JWT Authentication & User Authorization          │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Pydantic Validation & Normalization              │  │
│  ├──────────────────────────┬───────────────────────┤  │
│  │ SQLAlchemy 2.0 ORM       │ AI Service (httpx)    │  │
│  └────────────┬─────────────┴───────────┬───────────┘  │
└───────────────┼─────────────────────────┼──────────────┘
                │                         │
     SQL Queries (psycopg)         REST POST (JSON)
                │                         │
                ▼                         ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   PostgreSQL Database     │ │     Google Gemini API    │
│    (users, tasks tables)  │ │ (Controlled JSON Schema) │
└───────────────────────────┘ └──────────────────────────┘
```

---

## 4. Database Design

### `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Index | Unique user ID |
| `name` | String(100) | Not Null | User full name |
| `email` | String(255) | Unique, Index, Not Null | Account email address |
| `password_hash` | String(255) | Not Null | Bcrypt password hash |
| `created_at` | Timestamp with TZ | Server Default (now()) | Account creation date |

### `tasks` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Index | Unique task ID |
| `title` | String(255) | Index, Not Null | Task title |
| `description` | Text | Nullable | Context, logs, or details |
| `category` | String(50) | Not Null, Default: 'General' | Category (e.g. Bug Fix, Feature) |
| `priority` | String(20) | Not Null, Default: 'Medium' | Low, Medium, High, Urgent |
| `status` | String(20) | Not Null, Default: 'Pending' | Pending, In Progress, Completed |
| `due_date` | Timestamp with TZ | Nullable | Optional task deadline |
| `user_id` | Integer | Foreign Key (`users.id`), Index | Task owner |
| `created_at` | Timestamp with TZ | Server Default (now()) | Creation timestamp |
| `updated_at` | Timestamp with TZ | Server Default, onupdate | Last modification timestamp |

---

## 5. REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate and issue JWT token | No |
| `GET` | `/api/auth/me` | Get profile of logged-in user | Yes (Bearer JWT) |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/tasks` | Create a new task | Yes |
| `GET` | `/api/tasks` | List user's tasks with search/filters | Yes |
| `GET` | `/api/tasks/dashboard-stats` | Get aggregate task metrics | Yes |
| `GET` | `/api/tasks/{id}` | Get single task by ID | Yes |
| `PUT` | `/api/tasks/{id}` | Update task fields | Yes |
| `PATCH` | `/api/tasks/{id}/status` | Update only status of task | Yes |
| `DELETE` | `/api/tasks/{id}` | Delete task | Yes |

### AI Advisory (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/analyze-task` | Analyze task context with Gemini | Yes |

### Health Check
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Check backend & database health | No |

---

## 6. AI Integration & Security Architecture

### Why Backend-Mediated AI?
1. **API Key Protection**: External AI API keys (like Google Gemini) must NEVER be shipped in frontend client bundles. In TaskFlow, the React app only speaks to the FastAPI backend.
2. **Controlled Prompts**: The backend controls the system prompt, enforcing that Gemini responds with strict JSON schema and low temperature for deterministic classification.
3. **Validation & Normalization**: The backend verifies that the AI's returned priority maps strictly into `["Low", "Medium", "High", "Urgent"]` and that required keys exist before delivering them to the UI.
4. **Graceful Fallback**: If the external AI API is unavailable, rate-limited, or not configured, a rule-based fallback analyzer provides basic task suggestions.

---

## 7. Step-by-Step Setup Guide

### Prerequisites
- Python 3.12+
- Node.js (v18+) and npm
- PostgreSQL 14+ installed and running

### 1. Database Setup
Ensure PostgreSQL is running, then create the database:
```bash
# In psql or PostgreSQL terminal:
CREATE DATABASE taskflow_db;
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env to set your DATABASE_URL, JWT_SECRET_KEY, and GEMINI_API_KEY
```

Run tests to verify the setup:
```bash
pytest tests/ -v
```

Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive Swagger documentation is live at: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 8. Postman Testing Guide

1. Open Postman.
2. Click **Import** and select `postman/TaskFlow_API.postman_collection.json`.
3. The collection includes 15+ automated requests covering:
   - Registration (success and duplicate email error)
   - Login (success automatically stores `token` variable, and bad password error)
   - Profile verification
   - Task CRUD, filtering, search, and dashboard stats
   - Unauthorized access checks
   - AI task analysis (success and validation error)
4. Run the requests sequentially to verify API behavior.

---

## 9. Technical Interview Questions & Answers

### Q1: Why did you choose FastAPI over Flask or Django for this project?
**Answer**: FastAPI provides native asynchronous support, automatic OpenAPI/Swagger documentation, and Pydantic v2 validation out-of-the-box. For a REST API with external HTTP calls (such as calling the Google Gemini API), FastAPI's async capabilities with `httpx` prevent blocking threads during external I/O. Django would have added excessive overhead for a focused API, and Flask lacks native type-hint validation without extra libraries.

### Q2: How does JWT authentication work in TaskFlow, and why is it stateless?
**Answer**: When a user registers or logs in, their password is verified against a bcrypt salt hash. Upon successful authentication, the backend creates a signed JWT containing the user's ID (`sub`) and expiration timestamp (`exp`) signed with a secret key (`HS256`). The client attaches this token in the `Authorization: Bearer <token>` header for subsequent requests. The backend validates the signature cryptographically without querying an in-memory session store or Redis, making authentication stateless and easily horizontally scalable.

### Q3: How do you prevent User A from accessing or modifying User B's tasks?
**Answer**: Every task endpoint is protected by the `get_current_user` FastAPI dependency. When retrieving, updating, or deleting a task, the service layer strictly queries:
`db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()`.
If a task ID belongs to another user, the query returns `None`, and the API responds with a `404 Not Found`. This prevents unauthorized modifications and avoids leaking information about whether a task ID even exists in the system.

### Q4: Why is the Gemini API key kept on the backend instead of calling Gemini directly from React?
**Answer**: Any API key included in a frontend application can be easily inspected and stolen through the browser's Developer Tools or network inspection. Exposing keys leads to unauthorized billing and quota abuse. By routing requests through our FastAPI backend, the key remains securely stored in the server's environment variables (`.env`). In addition, the backend can enforce rate limiting, validate inputs, normalize AI outputs, and provide graceful fallbacks.

### Q5: How do you handle cases where the external AI API is down or slow?
**Answer**: In `ai_service.py`, external calls to Gemini are wrapped with an `httpx` client configured with a 15-second timeout. If the Gemini API returns a non-200 status code, times out, or if the `GEMINI_API_KEY` is not configured, the service falls back to a deterministic rule-based heuristic analyzer (`_rule_based_fallback`). This ensures the user receives triage suggestions and the core application never crashes.

### Q6: How does SQLAlchemy manage database sessions in FastAPI?
**Answer**: We use the dependency injection pattern with `get_db()`. Each HTTP request receives a dedicated `SessionLocal()` instance yielded to the route handler. A `try ... finally` block guarantees that `db.close()` is called as soon as the request lifecycle finishes, returning the connection back to the connection pool and preventing connection leaks.

---

## 10. License & Author
Created as a portfolio demonstration for Forward Deployed Engineering roles. Open-source under the MIT License.
