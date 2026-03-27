# TaskFlow Backend

This backend powers the current TaskFlow project.

## What It Includes

- Task CRUD API
- Task statistics endpoint
- Registration with OTP verification
- Login with OTP verification
- Console-backed email and SMS OTP delivery for local development
- Support request endpoint

## Main Endpoints

- `GET /api/tasks/`
- `POST /api/tasks/`
- `GET /api/tasks/statistics/`
- `POST /api/auth/send-otp/`
- `POST /api/auth/verify-otp/`
- `POST /api/auth/request-login-otp/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/support/`

## Local Run

```powershell
cd backend
python manage.py migrate
python manage.py runserver
```

## Local OTP Behavior

In local development:

- email OTPs are printed in the backend terminal
- SMS OTPs are also printed in the backend terminal

That is controlled by:

- `EMAIL_BACKEND = django.core.mail.backends.console.EmailBackend`
- `SMS_BACKEND = console`
