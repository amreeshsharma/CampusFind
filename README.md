# CampusFind 🎓
### Smart Campus Lost & Found Management Platform
> **Enterprise Full-Stack Web Application for University Campuses**  
> Streamlined Item Recovery, Transparent Multi-Factor Matching, and QR Code Custody Verification

---

## 🌟 Overview

**CampusFind** is an enterprise-grade, responsive full-stack platform designed to eliminate the chaos of lost and misplaced belongings across college campuses. It bridges the gap between students who lose items and good Samaritans or security staff who find them.

### Key Innovations
- 🧠 **Rule-Based Smart Item Matching**: An automated scoring engine that computes weighted similarity (category, keywords, color, location, date proximity) to proactively suggest potential matches between lost and found items.
- 📱 **QR-Code Item Tagging & Verification**: Generates tamper-resistant QR codes for found items deposited at campus security/desks, allowing verified ownership claims without publicly exposing sensitive item identifiers.
- 🛡️ **Role-Based Governance (RBAC)**: Secure separation between Student and Administrative workflows, complete with audit remarks, claim reviews, and platform analytics.

---

## 🎨 Brand & Design System

CampusFind adheres to a modern, human-centric SaaS dashboard aesthetic:
- **Primary Brand Color**: `#004953` (Deep Teal) — Navbar, primary buttons, headings
- **Secondary Brand Color**: `#EFDECD` (Warm Beige) — Badges, accents, highlights
- **Canvas / Background**: `#FAF8F5` (Light Pearl)
- **Text Primary**: `#183438` (Deep Charcoal Slate)
- **Text Muted**: `#687B7D` (Slate Grey)
- **Success / Warning / Error**: `#23865B` / `#D99A36` / `#C84B4B`

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3 (Modern Flexbox & CSS Grid, Custom Variables), Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js (Modular Controllers, Routes, Middleware, Services) |
| **Database** | MySQL 8.0, `mysql2` connection pool |
| **Authentication** | JSON Web Tokens (JWT), `bcryptjs` password hashing |
| **File Storage** | `multer` for secure item photograph uploads |
| **QR Code Engine** | `qrcode` for unique claim tokens and item tagging |
| **Analytics & Visuals** | Chart.js for admin metrics and reporting trends |

---

## 📁 Project Architecture

```
CampusFind/
│
├── frontend/                     # Pure HTML5, CSS3, and Vanilla JavaScript UI
│   ├── index.html                # Public Landing Page
│   ├── pages/                    # Multi-page Student & Admin views
│   ├── css/                      # Modular CSS with variables & responsive styles
│   ├── js/                       # Modular client scripts, auth, and API handlers
│   └── assets/                   # Logos, icons, and illustrations
│
├── backend/                      # Node.js & Express.js REST API Server
│   ├── server.js                 # Server entry point
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment variable template
│   ├── config/                   # MySQL connection pool
│   ├── controllers/              # Route business logic handlers
│   ├── routes/                   # RESTful API route definitions
│   ├── middleware/               # Auth, role check, and upload middlewares
│   ├── services/                 # Rule-based matching, QR generator, notifications
│   └── uploads/                  # Uploaded item photographs
│
├── database/                     # MySQL Relational Schema & Seed Data
│   ├── schema.sql                # Complete DDL schema with constraints & indexes
│   ├── seed.sql                  # Realistic college campus sample dataset
│   └── README.md                 # Database setup and execution instructions
│
├── docs/                         # Comprehensive Academic & Technical Docs
│   ├── project-overview.md       # High-level architecture and PBL relevance
│   ├── api-documentation.md      # Full REST API endpoints specification
│   ├── database-design.md        # ER diagram, schema relations & normalization
│   └── setup-guide.md            # Step-by-step local setup guide
│
├── .gitignore                    # Ignored files (node_modules, .env, uploads)
└── README.md                     # Project documentation root
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MySQL Server** (v8.0 or XAMPP / MariaDB)

---

### 1. Configure Environment Variables
Navigate to the `backend/` directory and configure the environment:
```bash
cd backend
cp .env.example .env
```
Ensure your MySQL credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) match your local MySQL configuration in `backend/.env`.

---

### 2. Install Dependencies
Inside the `backend/` directory:
```bash
npm install
```

---

### 3. Initialize & Seed Database
Run the automated initialization script to create the database (`campusfind_db`), apply schema DDL, and populate demonstration seed data:
```bash
npm run db:setup
```
*(Alternatively, import manually via MySQL client: `mysql -u root -p < ../database/schema.sql && mysql -u root -p < ../database/seed.sql`)*

---

### 4. Start Backend Server
From the `backend/` directory:
```bash
# Production start
npm start

# Or development mode with auto-reload (nodemon)
npm run dev
```
The backend server runs at **`http://localhost:5000`**.
- Health Check: `http://localhost:5000/api/health`
- API Overview: `http://localhost:5000/api`

---

### 5. Launch Frontend Application
You can access the frontend in either of two ways:

#### Option A: Directly via Backend (Recommended & Easiest)
Since Express serves the static `frontend/` files out of the box, simply open:
👉 **`http://localhost:5000`** in your browser.

#### Option B: Standalone Static Server (Port 5500)
From the project root directory:
```bash
# Using npx serve
npx serve frontend -p 5500 --no-clipboard

# Or using Python 3
python3 -m http.server 5500 --directory frontend
```
👉 Open **`http://localhost:5500`** in your browser.

---

### 🔑 Demo Login Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Student** | Alex Patel | `alex.patel@campus.edu` | `Password123!` |
| **Student** | Priya Sharma | `priya.sharma@campus.edu` | `Password123!` |
| **Admin** | Campus Security | `admin@campusfind.edu` | `AdminMaster2026!` |

---

## 📅 Development Roadmap (10 Phases)

- [x] **Phase 1**: Project Setup, Folder Architecture, Brand Variables, Express Server Baseline
- [x] **Phase 2**: UI/UX & Frontend Foundation (Landing, Auth, Responsive Design)
- [x] **Phase 3**: MySQL Database Schema, Connection Pool, and Seed Dataset
- [x] **Phase 4**: JWT Authentication, Role-based Middleware & Profile APIs
- [x] **Phase 5**: Lost and Found Item Management with Multer Uploads
- [x] **Phase 6**: Rule-Based Smart Item Matching Engine
- [x] **Phase 7**: Ownership Claims Workflow & QR Code Verification System
- [x] **Phase 8**: Student & Admin Dashboards with Chart.js Analytics
- [x] **Phase 9**: Full End-to-End Integration, Validation & Security Audit
- [x] **Phase 10**: Polishing, Demonstration Readiness & Academic Presentation Pack (`CampusFind_PBL_Report.docx`, `CampusFind_PBL_Presentation.pptx`)

---

## 👨‍💻 Academic Information
- **Course**: B.Tech Computer Science & Engineering
- **Subject**: Web Technology Project-Based Learning (PBL)
- **Year / Semester**: 2nd Year / 4th Semester

