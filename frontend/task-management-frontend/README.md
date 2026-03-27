# CherruTech Frontend

This folder contains the Vite frontend for the CherruTech Task Management System.

## Important Note

The backend is **not** inside this folder.

The full project structure is:

```text
task management system/
|- backend/
|- frontend/
|  |- task-management-frontend/
```

So this folder only contains the frontend app.

## Frontend Stack

- React
- Vite
- React Router
- CSS

## Main Frontend Features

- Public home page
- Login form
- OTP registration flow
- Protected dashboard
- Task board
- Analytics page
- Calendar page
- Team page
- New task page

## Local Run

Open a terminal in this folder:

```powershell
cd "c:\Users\hp\OneDrive\Desktop\task management system\frontend\task-management-frontend"
```

Install dependencies:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Default dev URL:

```text
http://localhost:5173/
```

## Backend Connection

This frontend connects to the Django backend using:

```env
VITE_API_URL
```

If `VITE_API_URL` is not set, the frontend falls back to:

```text
http://127.0.0.1:8000/api
```

## Build

```powershell
npm run build
```

Build output:

```text
dist/
```

## Deployment

If deploying only the frontend, use this folder as the project root:

```text
frontend/task-management-frontend
```

Recommended settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

## Related Files

- [App.jsx](C:/Users/hp/OneDrive/Desktop/task%20management%20system/frontend/task-management-frontend/src/App.jsx)
- [main.jsx](C:/Users/hp/OneDrive/Desktop/task%20management%20system/frontend/task-management-frontend/src/main.jsx)
- [taskflowApi.js](C:/Users/hp/OneDrive/Desktop/task%20management%20system/frontend/task-management-frontend/src/api/taskflowApi.js)
- [Root README](C:/Users/hp/OneDrive/Desktop/task%20management%20system/README.md)
