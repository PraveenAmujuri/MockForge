# MockForge

<div align="center">

A platform for creating, hosting, and testing mock REST APIs during frontend and integration development. Define response payloads, simulate network latency, inspect real-time request logs, and unblock client development before backend systems are built.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15.0.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![JWT Auth](https://img.shields.io/badge/JWT_Auth-Enabled-orange?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

</div>


---

## Why MockForge?

Frontend development often starts before backend services are available. MockForge provides configurable REST endpoints that can be used during development, integration testing, and API prototyping.

Instead of creating temporary servers or maintaining static JSON files, developers can define endpoints, configure responses, simulate latency, and inspect request logs from a single dashboard.

**MockForge** solves this bottleneck by enabling developers to:
1. Create mock endpoints that mirror planned production API paths.
2. Formulate JSON mock payloads with specific HTTP status codes.
3. Simulate real-world network constraints, database delays, and timeout failures.
4. Integrate the mock endpoints seamlessly using a single project base URL.

---

## 🌟 Core Features

- **Project Environments**: Group endpoints under unique, URL-friendly slugs (e.g. `/mock/ecommerce-api`).
- **Flexible Endpoint CRUD**: Configure mock path, select HTTP methods (GET, POST, PUT, PATCH, DELETE), HTTP status codes (100–599), and custom JSON payloads.
- **Latency Control**: Inject simulated network latency ranging from 0ms to 10000ms.
- **Project Access Modes**:
  - **Public Mode**: Endpoints are accessible directly by URL from any client.
  - **Private Mode**: Restricts incoming queries using API Key authentication via `X-API-Key` headers.
- **Real-Time Request Logger**: Inspect headers, body parameters, caller source IP addresses, and timestamps.
- **Endpoint Duplication**: One-click endpoint copying that resolves route name collision by appending `-copy` automatically.
- **Dashboard Interface**: Project management, endpoint configuration, request logs, and theme persistence.

---

## 🏗️ Architecture Overview

MockForge is split into a frontend dashboard and backend API service.

```
+-------------------------------------------------------------+
|                     Next.js 15 Frontend                     |
|            (React, Zustand Store, Tailwind CSS)             |
+------------------------------+------------------------------+
                               |
                   HTTP API    |   HTTP Mock Request
                 (Port 4000)   |   (X-API-Key Auth)
                               v
+-------------------------------------------------------------+
|                     NestJS API Backend                      |
|                (JWT Guards, Resolver Engine)                |
+------------------------------+------------------------------+
                               |
                        Prisma | ORM Queries
                               v
+-------------------------------------------------------------+
|                     PostgreSQL Database                     |
|                 (Hosted on Neon PostgreSQL)                  |
+-------------------------------------------------------------+
```

### Mock Resolution Flow

```
[ Client Request ] 
       |
       v
GET/POST/PUT/PATCH/DELETE /mock/:projectSlug/*
       |
       v
[ Resolver Module ] -- Finds Project by Slug (404 if missing)
       |
       +---> Project is Private? ---> Check X-API-Key Header (401 if missing/mismatch)
       |
       v
Normalizes Requested Path ---> Matches Endpoint Method & Path in Database (404 if missing)
       |
       v
[ Request Logs ] ------------> Writes detailed IP, Headers, and Body to database
       |
       v
[ Delay Promise ] -----------> If delayMs > 0, waits (setTimeout)
       |
       v
[ HTTP Response ] -----------> Returns configured status code & responseJson payload
```

---

## 🗄️ Database Schema

MockForge uses Prisma ORM to map the PostgreSQL relational database. The schema structure consists of four main tables:

```
+-------------+         +---------------+         +------------------+         +----------------+
|    User     |         |    Project    |         |   MockEndpoint   |         |   RequestLog   |
+-------------+         +---------------+         +------------------+         +----------------+
| id (UUID)   | 1     * | id (UUID)     | 1     * | id (UUID)        | 1     * | id (UUID)      |
| email       +-------->| userId        +-------->| projectId        +-------->| endpointId     |
| password    |         | name          |         | name             |         | method         |
| createdAt   |         | slug (Unique) |         | path (Normalized)|         | headers (Json) |
+-------------+         | apiKey(Unique)|         | method (HTTP)    |         | body (Json)    |
                        | isPublic      |         | responseJson(Json|         | ipAddress      |
                        | createdAt     |         | statusCode       |         | createdAt      |
                        +---------------+         | delayMs          |         +----------------+
                                                  | createdAt        |
                                                  +------------------+
```

---

## 🔐 Authentication Flow

1. **User Sign Up**: Password credentials are hashed via `bcrypt` with 10 salt rounds and stored.
2. **User Login**: Credentials are validated. A signed JSON Web Token (JWT) is returned containing the user ID (`sub`) and email.
3. **Session Persistence**: The frontend client stores the JWT in `localStorage` (`mockforge_token`) along with the serialized user profile details.
4. **Client Requests**: An Axios interceptor automatically attaches the `Authorization: Bearer <token>` header to all outgoing project dashboard calls.
5. **Route Protection**: The backend controllers verify incoming requests using NestJS `AuthGuard`. Unauthorized (401) responses trigger the frontend Zustand store to clear local storage and redirect the user back to `/login`.

---

## 📡 Mock Request Lifecycle

A mock endpoint call goes through the following sequence in the `ResolverService`:

1. **Routing**: NestJS routes requests directed to `/mock/:projectSlug` and `/mock/:projectSlug/*` to the `ResolverController`.
2. **Project Extraction**: Queries database for the `Project` where `slug === projectSlug`.
3. **Access Enforcement**: 
   - If `project.isPublic === false` (Private), the header `X-API-Key` is compared with `project.apiKey`. Mismatch returns a `401 Unauthorized` JSON payload.
4. **Endpoint Matching**: The sub-path following `/mock/:projectSlug` is normalized (leading slash added, trailing slash trimmed) and compared with the `MockEndpoint` database record where `projectId === project.id`, `path === normalizedSubpath`, and `method === req.method`.
5. **Payload Logging**: Creates a new `RequestLog` entry. Client source IP addresses are extracted (taking headers like `x-forwarded-for` into consideration for proxy servers) along with the request headers and parsed request body.
6. **Latency Delay**: An asynchronous timer pauses execution if `endpoint.delayMs > 0`.
7. **Execution Output**: Resolves the request by sending the stored `endpoint.responseJson` payload and custom `endpoint.statusCode`.

---

## 📊 Request Logging System

Every execution of a configured mock route is written to the database:
- **Captured Fields**: Caller IP Address, HTTP Request Method, Full Header JSON, Request Body Payload, and Timestamp.
- **Zustand Stream Integration**: The frontend polls or retrieves project logs, displaying them in a tabular data view.
- **Logs Details Drawer**: Clicking a log row slides a details drawer from the right. This drawer displays syntax-highlighted headers and body payloads for developers to debug request parameters.
- **Log Flushing**: Clear project logs with a single click, which triggers a cascade deletion on database logs associated with that project's endpoints.

---

## 📂 Repository Structure

MockForge is structured as a clear monorepo containing distinct `frontend` and `backend` directories.

```
MockForge/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # SQL migrations history
│   │   └── schema.prisma     # Prisma schema models
│   ├── src/
│   │   ├── auth/             # Sign-up, login, jwt guard, current-user decorator
│   │   ├── projects/         # Project CRUD and slug/apiKey generators
│   │   ├── endpoints/        # Mock endpoints configuration and duplication
│   │   ├── logs/             # Request logging collection and deletion
│   │   ├── resolver/         # Dynamic resolver wildcard controllers & services
│   │   ├── prisma/           # Global PrismaService wrapping pg driver adapter
│   │   ├── app.module.ts     # Main module imports
│   │   └── main.ts           # Bootstraps NestJS app, CORS, prefix exclusions
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── public/               # Static icons and fonts
    ├── src/
    │   ├── app/              # Next.js App Router (Pages, Auth subroutes)
    │   ├── components/       # UI Elements (Theme provider, Modals, Drawer)
    │   ├── lib/              # Axios API client wrapper with request interceptors
    │   └── store/            # Unified Zustand state management store
    ├── package.json
    ├── tailwind.config.ts    # Configures dark/light hsl color extensions
    └── tsconfig.json
```

---

## ⚙️ Installation & Onboarding

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- Access to a PostgreSQL Database (e.g. Neon PostgreSQL, local Postgres, or Supabase)

### Step 1: Clone and Configure Environment Files
Clone the repository and set up environment files in both folders.

---

## 🔑 Environment Variables

### Backend Config
Create `backend/.env` file:
```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<dbname>?sslmode=require"
PORT=4000
JWT_SECRET="your_jwt_signing_secret_here"
```

### Frontend Config
Create `frontend/.env.local` file:
```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:4000/api"
```

---

## 🗃️ Prisma DB Setup

MockForge uses Prisma 7 which leverages native database driver adapters. Initialize, migrate, and generate database schemas:

```bash
cd backend

# Install dependencies if you haven't already
npm install

# Run database migrations to provision tables in PostgreSQL
npx prisma migrate dev --name init

# Generate the Prisma Client
npx prisma generate
```

---

## 🚀 Running Locally

### 1. Run Backend Server (Port 4000)
```bash
cd backend
npm run build
node dist/src/main
```
The console will log: `Backend is running on: http://localhost:4000`.

### 2. Run Frontend Dashboard Client (Port 3000)
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 💻 API Examples

### 1. Fetching a Private Mock Endpoint
**Request:**
```bash
curl -X GET "http://127.0.0.1:4000/mock/ecommerce-api/api/products" \
  -H "X-API-Key: mf_live_769025fbe2ed51526fdd2454cefad2bc"
```
**Response (200 OK after 800ms delay):**
```json
[
  {
    "id": 1,
    "name": "Premium Widget",
    "price": 99.99
  }
]
```

### 2. Calling Private Mock without API Key
**Request:**
```bash
curl -X GET "http://127.0.0.1:4000/mock/ecommerce-api/api/products"
```
**Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized: Invalid or missing API key in X-API-Key header"
}
```

### 3. Missing Endpoint
**Request:**
```bash
curl -X GET "http://127.0.0.1:4000/mock/ecommerce-api/api/nonexistent"
```
**Response (404 Not Found):**
```json
{
  "error": "Mock endpoint not found for method GET and path '/api/nonexistent'"
}
```

---

## 🖥️ Dashboard Capabilities

The dashboard provides tools for managing projects, endpoints, and request logs:

- **Overview Page**: Displays active project tallies, total endpoint counts, today's request count, and an activity list.
- **Projects Page**: Search project lists, create projects (modal dialogs), and copy API keys.
- **Endpoints Page**: Shows the project's mock base URL, active keys, search bars, method tabs, and CRUD buttons.
  - JSON payload validation: In-form validation prevents saving invalid JSON text.
- **Logs Page**: View incoming HTTP request parameters and click on rows to expand the details drawer.
- **Settings Page**: Edit names, toggle public/private modes, regenerate keys, or delete the project by entering its name to confirm.
- **Account Settings**: Switch between dark and light themes or change account passwords.

---

## 🛡️ Security Model

- **Bcrypt Password Protection**: User passwords are encrypted before database insertion.
- **JWT Protection**: Access control prevents users from viewing projects or resources they do not own.
- **Project Isolation**: Database queries check project and endpoint ownership to verify the user matches the request owner.
- **API Key Hashing**: Private projects check the `X-API-Key` request header. Mismatches return a `401 Unauthorized` response.

---
