# CampusFind 2.0 - Local Setup & Execution Guide

## System Prerequisites
1. **Node.js**: v18.0.0 or later (v24.19.0 verified)
2. **npm**: v9.0.0 or later (v11.17.0 verified)
3. **MySQL**: v8.0 or XAMPP MySQL

## Step 1: Backend Setup
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Check environment variables
# Copy .env.example to .env if not present
cp .env.example .env
```
Ensure your MySQL database credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) in `.env` match your local environment.

## Step 2: Initialize & Seed Database
```bash
# Automatically creates campusfind_db and seeds demonstration data
npm run db:setup
```

## Step 3: Start the Backend Server
```bash
# Production mode
npm start

# Or development mode with auto-reload
npm run dev
```
The server will bind to `http://localhost:5000`.
Test health endpoint: `http://localhost:5000/api/health`

## Step 4: Frontend Execution
The frontend is built with vanilla HTML5, CSS3, and JavaScript, requiring no build tools or bundling steps.

### Option A: Directly through Backend
Open `http://localhost:5000` in your web browser (the Express server serves the static frontend).

### Option B: Dedicated Static Server
From the project root:
```bash
npx serve frontend -p 5500 --no-clipboard
```
Then visit `http://localhost:5500` in any modern web browser.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Student** | `alex.patel@campus.edu` | `Password123!` |
| **Admin** | `admin@campusfind.edu` | `AdminMaster2026!` |

