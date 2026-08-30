# SupportFlow — AI-Assisted Customer Support Desk

**SupportFlow** is an enterprise-grade AI-assisted customer support desk application designed for high-efficiency ticketing, real-time customer-agent communication, automated ticket triage powered by **OpenAI & Google Gemini AI**, and human agent review workflows.

Unlike generic chatbot widgets, SupportFlow provides a complete support ticketing platform featuring state-machine ticket workflows (`New` → `Assigned` → `In Progress` → `Resolved`), atomic ticket numbering (`SF-000001`), database persistence, real-time Socket.IO synchronization, and a dedicated **3-Tier Role Architecture** (`Customer`, `Support Agent`, `Super Admin`).

---

## 🐳 Docker Multi-Container Architecture

SupportFlow is fully containerized into 3 distinct, professional Docker services managed by Docker Compose:

```text
+-------------------------------------------------------------------------+
|                        DOCKER COMPOSE NETWORK                           |
|                                                                         |
|  +------------------------+  Port 80   +-----------------------------+  |
|  | supportflow-frontend   | <--------> | Client Browser / User       |  |
|  | (Nginx Alpine + React) |            +-----------------------------+  |
|  +-----------+------------+                                             |
|              | Reverse Proxy (/api, /socket.io)                         |
|              v                                                          |
|  +------------------------+  Port 5000                                  |
|  | supportflow-backend    |                                             |
|  | (Node.js 20 Express)   |                                             |
|  +-----------+------------+                                             |
|              | Mongoose Connection                                      |
|              v                                                          |
|  +------------------------+  Port 27017                                 |
|  | supportflow-mongodb    |                                             |
|  | (MongoDB 7.0 + Volume) |                                             |
|  +------------------------+                                             |
+-------------------------------------------------------------------------+
```

### Quick One-Command Docker Launch

```bash
# Clone & build all 3 containers in background mode
docker-compose up --build -d
```

### Docker Service Endpoints
- **Frontend App (Nginx + React)**: `http://localhost/` (Port 80)
- **Backend REST API**: `http://localhost:5000/api`
- **MongoDB Database**: `mongodb://localhost:27017/supportflow`

---

## Key Features

- **Automated AI Ticket Triage (OpenAI & Gemini)**: Automatically analyzes submitted tickets and classifies Category, Priority, and Summary without exposing API keys to the client.
- **Human-in-the-Loop Triage Review**: AI suggestions are advisory. Support agents review, edit, and explicitly confirm triage data before it becomes authoritative (`triageReviewed = true`).
- **3-Tier Role Architecture (`Customer`, `Support Agent`, `Super Admin`)**:
  - **Customer Portal**: Create tickets, view history, real-time chat with support agents.
  - **Agent Workbench**: Manage assigned ticket queue, review AI triage recommendations, update status, and resolve tickets.
  - **Super Admin Control Center**: Provision Customer and Agent accounts, monitor global system analytics, and inspect all system tickets.
- **Atomic Ticket Numbering**: Concurrency-safe sequence counter (`SF-000001`, `SF-000002`) using MongoDB `$inc` operations.
- **Real-Time Socket.IO Synchronization**: Broadcasts conversation messages, status changes, and triage reviews live to connected participants **after** MongoDB database persistence.
- **Required Resolution Notes & Ticket Locking**: Tickets cannot be marked `Resolved` without a non-empty resolution note. Resolved tickets are strictly locked against further edits.
- **Real Database Statistics**: Dashboards calculate live counts from MongoDB (`$count` & `$in` aggregations) without hardcoded values.

---

## Full Tech Stack

### Frontend (`/client`)
- **Framework & Build**: React 18, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (Protected Routes & Role Guards)
- **HTTP Client**: Axios with request/response interceptors for JWT bearer tokens
- **Real-time Client**: `socket.io-client`
- **Container Server**: Nginx Alpine with Gzip compression and WebSocket reverse proxying

### Backend (`/server`)
- **Runtime & Framework**: Node.js 20, Express.js
- **Database & ORM**: MongoDB 7.0, Mongoose 8
- **AI Triage Engines**: **OpenAI API** (`gpt-4o-mini`) & **Google Gemini API** (`gemini-1.5-flash`)
- **Authentication**: JWT (JSON Web Tokens), `bcryptjs` password hashing
- **Validation**: Zod schema validation
- **Real-time Gateway**: Socket.IO 4
- **Security**: Helmet, CORS, Body size limits
- **Testing**: Supertest, `mongodb-memory-server`

---

## Complete API Documentation

| Method | Endpoint | Access / Role | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server & Database health status |
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate email/password and return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user session profile |
| `POST` | `/api/tickets` | Customer | Create ticket, trigger AI triage, auto-assign agent |
| `GET` | `/api/tickets/my` | Customer | List authenticated customer's tickets |
| `GET` | `/api/tickets/:id` | Owner / Agent / Admin | Get ticket details |
| `GET` | `/api/agent/tickets` | Agent / Admin | List tickets assigned to agent |
| `PATCH` | `/api/agent/tickets/:id/status` | Agent / Admin | Update status (`New` → `Assigned` → `In Progress` → `Resolved`) |
| `POST` | `/api/agent/tickets/:id/resolve` | Agent / Admin | Resolve ticket with required `resolutionNote` |
| `PATCH` | `/api/agent/tickets/:id/triage` | Agent / Admin | Confirm/edit AI triage suggestion (`triageReviewed = true`) |
| `POST` | `/api/admin/users/create` | Super Admin | Provision Customer or Support Agent account |
| `GET` | `/api/admin/stats` | Super Admin | Fetch global system analytics |
| `GET` | `/api/admin/users` | Super Admin | List all system accounts with role filter |
| `GET` | `/api/admin/tickets` | Super Admin | List all system tickets across all agents |

---

## Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/supportflow
JWT_SECRET=supportflow_super_secret_jwt_key_phase1
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

---

## Pre-Seeded Demo Credentials

- **Super Admin Account**:
  - Email: `admin@supportflow.demo`
  - Password: `Admin123!`
- **Support Agent Account**:
  - Email: `agent@supportflow.demo`
  - Password: `Agent123!`
- **Customer Account**:
  - Email: `customer@supportflow.demo`
  - Password: `Customer123!`

---

## Local Non-Docker Development

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Seed database
cd ../server
npm run seed

# 3. Start development servers
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

---

## Declaration
This project integrates **OpenAI API** (`gpt-4o-mini`) and **Google Gemini API** as core AI triage engines.
