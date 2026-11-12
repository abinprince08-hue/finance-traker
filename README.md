# Personal Finance Tracker (Beginner MERN Project)

A simple full-stack personal finance tracker made with React, Node.js, Express, and MongoDB.

## Features
- Signup/login with bcrypt password hashing and JWT authentication
- Dashboard with total balance, income, expenses, and recent transactions
- Add, view, edit, delete income and expense transactions
- Filter transactions by type and category
- Set a monthly budget and view spent/remaining amounts
- Add and delete categories
- Each user's data is protected by JWT and scoped to that user
- Responsive, plain CSS interface

## Requirements
- Node.js (LTS)
- MongoDB Atlas account or local MongoDB

## 1. Configure backend
Open a terminal:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your values:
- `MONGO_URI`: your MongoDB connection string
- `JWT_SECRET`: a long random secret
- `PORT`: 5000

Start backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

## 2. Configure frontend
Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in terminal (usually `http://localhost:5173`).

## Notes
- This is a beginner project scaffold. Read the files and understand them before submission.
- Do not upload `.env` to GitHub. It is ignored by `.gitignore`.
- The backend requires a working MongoDB connection.
- For deployment, set the same environment variables in your hosting provider and update `VITE_API_URL` in the frontend environment.
