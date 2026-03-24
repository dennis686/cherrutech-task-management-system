# Django Task Management Backend

A Django REST API backend for the Task Management System.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```
   python manage.py migrate
   ```

4. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

5. Run the server:
   ```
   python manage.py runserver 0.0.0.0:8000
   ```

## API Endpoints

- `GET /api/tasks/` - Get all tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{id}/` - Get a specific task
- `PUT /api/tasks/{id}/` - Update a task
- `PATCH /api/tasks/{id}/` - Partial update
- `DELETE /api/tasks/{id}/` - Delete a task

## Custom Endpoints

- `GET /api/tasks/completed/` - Get completed tasks
- `GET /api/tasks/pending/` - Get pending tasks
- `GET /api/tasks/high_priority/` - Get high priority tasks
- `GET /api/tasks/statistics/` - Get task statistics

## Admin Panel

Access the admin panel at: http://localhost:8000/admin/
