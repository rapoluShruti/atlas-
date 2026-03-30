# Atlas MERN Auth Starter

Basic MERN stack starter with:

- Landing page
- Login page
- Register page
- Protected dashboard
- Express + MongoDB backend
- One environment file only in `backend/.env`
- Frontend API base URL and endpoint paths centralized in one file
- Frontend page routing centralized in one file

## Folder Structure

```text
atlas/
  backend/
    .env
    package.json
    src/
  frontend/
    package.json
    src/
  package.json
```

## Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Update `backend/.env` with your MongoDB connection string and JWT secret.

3. Start both apps:

```bash
npm run dev
```

## Default URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

