Task Manager Web Application

A full-stack, enterprise-grade multi-tenant task management web application built with **React 18**, **Node.js Express**, **Sequelize ORM**, and **PostgreSQL** following the **Model-View-Controller (MVC)** architectural pattern.

---

## 🔑 Example Test Credentials

Use these pre-configured test credentials to evaluate the different Role-Based Access Control (RBAC) tiers:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@taskmanager.com` | `SuperAdmin123!` | Global access across all departments & full analytics. |
| **Department Admin** | `admin.it@taskmanager.com` | `Admin123!` | Scoped strictly to IT Department tasks & staff management. |
| **Employee** | `employee.it@taskmanager.com` | `Employee123!` | Scoped to assigned tasks, status updates & file uploads. |

---

## 🏗️ System Architecture & MVC Pattern

The application follows the classic **Model-View-Controller (MVC)** architectural pattern adapted for modern full-stack web applications:

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                           MVC ARCHITECTURE DESIGN                              │
│                                                                                │
│   VIEW (Client Side)            CONTROLLER (API Layer)           MODEL (DB)    │
│ ┌────────────────────┐   HTTP  ┌─────────────────────┐  Sequelize ┌──────────┐ │
│ │ React 18 UI        │────────>│ Express API         │─────────>  │ Postgre  │ │
│ │ Pages & Components │<────────│ Controllers & Auth  │<─────────  │ Models   │ │
│ └────────────────────┘   JSON  └─────────────────────┘ Data Objs  └──────────┘ │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 🧩 MVC Component Breakdown

1. **Model (Data & Schema Layer — `backend/src/models/`)**:
   - Defined using **Sequelize ORM v6** (`User.js`, `Department.js`, `Task.js`, `FileAttachment.js`).
   - Manages relational database schemas, data validation, and associations (`User.belongsTo(Department)`).

2. **View (Presentation Layer — `frontend/src/`)**:
   - Built with **React 18** Single Page Application (`pages/` and `components/`).
   - Renders responsive interactive UI, Chart.js analytical dashboards, and task management workflows.

3. **Controller (Business Logic Layer — `backend/src/controllers/`)**:
   - Express controller modules (`authController.js`, `taskController.js`, `adminController.js`, `departmentController.js`).
   - Processes API endpoints, validates inputs, executes business logic, and interacts with Models to return JSON responses.

---

## 💡 Key Design Choices & Rationale

1. **Decoupled MVC Web Architecture**:
   - Cleanly isolates UI presentation (`View`) from request handling (`Controller`) and persistence logic (`Model`).

2. **Stateless JWT Authentication & Bcrypt Hashing**:
   - Eliminates server session state. Passwords are hashed using Bcrypt salt rounds (`10`). JWT Bearer tokens carry claims for instantaneous request authorization.

3. **Relational Integrity & Sequelize ORM**:
   - Parameterized queries prevent SQL injection attacks while maintaining structural data integrity across users and departments.

4. **Multi-Tier Role-Based Access Control (RBAC)**:
   - Enforces strict data scoping at both database query level and UI navigation level (`Super Admin` global view vs `Department Admin` and `Employee` scoped views).

---

## ⚡ Setup & Installation Instructions

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v14+

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file (.env)
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
EOF

# Synchronize database tables & seed data
node src/config/database.js

# Start backend server
node server.js
```

Backend server will run at `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend application will run at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run the backend unit and API integration test suite:

```bash
cd backend
npm test
```

### Test Coverage Summary:
- **Unit Tests**: JWT token signing/verification (`utils/jwt.js`) and Bcrypt password hashing (`models/User.js`).
- **API Integration Tests**: `GET /api/health` (`200 OK`), login validation (`400 Bad Request`), missing token handling (`401 Unauthorized`), and RBAC protection checks.

---

## 📂 Project Directory Structure (MVC Layout)

```text
Task-Manager/
├── backend/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # [CONTROLLER] API Request & Business Logic
│   │   ├── middleware/       # Auth & RBAC Security Middleware
│   │   ├── models/           # [MODEL] Sequelize Schemas & Data Models
│   │   ├── routes/           # REST API Endpoint Mappings
│   │   └── utils/            # JWT & Date Utilities
│   ├── tests/
│   │   └── system.test.js    # Jest & Supertest Integration Suite
│   ├── server.js             # Express App Entry Point
│   └── package.json
├── frontend/
│   ├── src/                  # [VIEW] React UI Presentation Layer
│   │   ├── api/              # Axios API Client
│   │   ├── components/       # UI Components & Navigation
│   │   ├── pages/            # View Pages (Dashboard, Tasks, Details)
│   │   └── utils/            # Formatting Helpers
│   └── package.json
└── README.md
```
