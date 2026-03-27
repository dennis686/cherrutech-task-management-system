# CherruTech Task Management System

CherruTech is a full-stack task management system with a public landing page, OTP-based registration, protected workspace routes, task analytics, a task board, and a calendar view.

## Stack

- Frontend: React + Vite + React Router
- Backend: Django + Django REST Framework
- Database: SQLite
- Auth flow: Email OTP for registration, username/password for login

## Languages Used

- JavaScript
- Python
- HTML
- CSS
- SQL (via SQLite)

## Tools Used

- React
- Vite
- React Router
- Django
- Django REST Framework
- SQLite
- npm
- Git
- GitHub

## Project Structure

```text
task management system/
|- backend/
|  |- config/
|  |- tasks/
|  |- manage.py
|- frontend/
|  |- task-management-frontend/
|     |- src/
|     |- package.json
```

## Main Features

- Public home page with landing sections, FAQ, and support links
- Protected dashboard with sidebar navigation
- Add-task form on its own route
- Task board grouped by status
- Analytics with active graph and pie chart
- Calendar with real monthly view and task due dates
- OTP registration through user email
- Normal login after registration verification

## Requirements

- Python 3.12 recommended
- Node.js + npm

## Backend Setup

1. Open a terminal and go to the project root:

```powershell
cd "c:\Users\hp\OneDrive\Desktop\task management system"
```

2. Create or activate a Python 3.12 virtual environment:

```powershell
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
```

3. Install backend dependencies:

```powershell
pip install -r ".\backend\requirements.txt"
```

4. Move to the backend folder and run migrations:

```powershell
cd ".\backend"
python manage.py migrate
```

5. Start the backend:

```powershell
python manage.py runserver
```

Backend URL:

- `http://127.0.0.1:8000/`
- API root: `http://127.0.0.1:8000/api/`

## Frontend Setup

1. Open another terminal and go to the frontend app:

```powershell
cd "c:\Users\hp\OneDrive\Desktop\task management system\frontend\task-management-frontend"
```

2. Install frontend dependencies if needed:

```powershell
npm install
```

3. Start the frontend:

```powershell
npm run dev
```

Frontend URL:

- `http://localhost:5173/`

## Authentication Flow

1. User opens the public home page
2. User clicks `Register`
3. User enters username, email, and password
4. Backend sends OTP to the user email
5. User verifies OTP
6. User logs in with username and password
7. User is redirected to the protected dashboard

## Email OTP Setup

By default, OTP emails can use the console backend in development. To send real emails, create:

- [backend/.env.example](C:/Users/hp/OneDrive/Desktop/task%20management%20system/backend/.env.example)

Copy it to `.env` inside `backend/` and fill in your email settings.

Example:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL=your_email@gmail.com
```

## Main Routes

Frontend:

- `/`
- `/dashboard`
- `/board`
- `/tasks`
- `/calendar`
- `/team`
- `/analytics`

Backend API:

- `GET /api/tasks/`
- `POST /api/tasks/`
- `GET /api/tasks/statistics/`
- `POST /api/auth/send-otp/`
- `POST /api/auth/verify-otp/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/support/`

## Notes

- The sidebar is hidden on the public home page and visible inside the workspace pages.
- The dashboard is overview-only.
- The `New Task` route contains the task form only.
- Support contact on the home page is currently `alexcheruuo@gmail.com`.
