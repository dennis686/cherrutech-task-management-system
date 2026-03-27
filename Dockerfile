FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend/task-management-frontend

COPY frontend/task-management-frontend/package*.json ./
RUN npm ci

COPY frontend/task-management-frontend ./
RUN npm run build

FROM python:3.12-slim AS backend-runtime
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
COPY --from=frontend-builder /app/frontend/task-management-frontend/dist /app/frontend/task-management-frontend/dist
COPY README.md /app/README.md

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
