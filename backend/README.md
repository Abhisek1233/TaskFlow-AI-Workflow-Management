# TaskFlow Backend

FastAPI REST API backend for TaskFlow — AI-Assisted Workflow Management Platform.

## Features
- **FastAPI Framework**: High-performance async Python backend with automatic OpenAPI/Swagger docs (`/docs`).
- **PostgreSQL Database**: Relational schema with SQLAlchemy 2.0 ORM and connection pooling.
- **JWT Authentication**: Password hashing with `bcrypt` and signed JWT access tokens with 24-hour expiration.
- **Task Management CRUD**: Full create, read, update, delete, status toggle, search, and multi-parameter filtering.
- **Strict Authorization**: User-specific database filtering preventing unauthorized access or modification.
- **AI Task Analysis**: Google Gemini API integration using `httpx` with strict JSON schema validation and rule-based fallback.
- **Automated Testing**: pytest test suite covering authentication, authorization, CRUD, and AI endpoints.

## Setup Instructions

1. **Prerequisites**:
   - Python 3.12+
   - PostgreSQL running on `localhost:5432` with database `taskflow_db` created.

2. **Create and Activate Virtual Environment**:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your PostgreSQL credentials and Gemini API Key:
   ```bash
   cp .env.example .env
   ```

5. **Run the Development Server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Interactive Swagger documentation is available at: `http://localhost:8000/docs`

6. **Run Tests**:
   ```bash
   pytest tests/ -v
   ```
