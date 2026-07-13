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
2. Formulate JSON, XML, HTML, or raw text mock payloads with specific HTTP status codes.
3. Simulate real-world network constraints, database delays, and timeout failures.
4. Integrate the mock endpoints seamlessly using a single project base URL.

---

## 🌟 Core Features

- **Project Environments**: Group endpoints under unique, URL-friendly slugs (e.g. `/mock/ecommerce-api`).
- **Flexible Endpoint CRUD**: Configure mock path, select HTTP methods (GET, POST, PUT, PATCH, DELETE), HTTP status codes (100–599), and custom JSON payloads.
- **Monaco Code Editor**: Replaced standard textareas with a sleek Monaco Editor wrapper supporting real-time JSON syntax checking and lint error warning banners.
- **Dynamic Response Templating**: Support for dynamic path parameters (`/users/:id` or `/users/{id}`), request context interpolation (`{{request.body.field}}`, `{{request.query.param}}`, `{{request.headers.header}}`, `{{request.params.segment}}`), project environment variables (`{{project.VAR_NAME}}`), and helper tokens (`{{uuid}}`, `{{timestamp}}`, `{{now}}`, `{{randomInt(min,max)}}`).
- **OpenAPI / Swagger Tooling**: Drag-and-drop YAML/JSON file import to batch-create endpoints, and instant OpenAPI v3 schema export.
- **Request Replay Playground**: Resend captured requests, modify headers/body parameters in place, and inspect real-time mock output.
- **Settings, CORS & Environment Variables**: Configurable origins, methods, headers, global variables key-values, and full project configuration export/import.
- **Custom Content-Types & Headers**: Switch between JSON, XML, HTML, and plain text body types with custom response headers per route.
- **Branded Password Reset**: Secure expiring tokens hashed with SHA-256, integrated with Resend email delivery.
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
       +---> Dynamic Path Parameter Matching (:id or {id} pattern segment parsing)
       |
       v
[ Dynamic Template Engine ] --> Interpolates {{request.body}}, {{uuid}}, {{project.var}}, etc.
       |
       v
[ Request Logs ] ------------> Writes detailed IP, Headers, and Body to database
       |
       v
[ Delay Promise ] -----------> If delayMs > 0, waits (setTimeout)
       |
       v
[ HTTP Response ] -----------> Returns configured status code, custom headers, & formatted body
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
| resetToken  |         | slug (Unique) |         | path (Normalized)|         | headers (Json) |
| resetExpires|         | apiKey(Unique)|         | method (HTTP)    |         | body (Json)    |
| createdAt   |         | isPublic      |         | responseJson(Json|         | ipAddress      |
+-------------+         | variables     |         | statusCode       |         | createdAt      |
                        | corsConfig    |         | delayMs          |         +----------------+
                        | createdAt     |         | headers (Json)   |
                        +---------------+         | bodyType (TEXT)  |
                                                  | bodyText (TEXT)  |
                                                  | tags (TEXT)      |
                                                  | createdAt        |
                                                  +------------------+
```

---

## 🔐 Authentication Flow

1. **User Sign Up**: Password credentials are hashed via `bcrypt` with 10 salt rounds and stored.
2. **User Login**: Credentials are validated. A signed JSON Web Token (JWT) is returned containing the user ID (`sub`) and email.
3. **Session Persistence**: The frontend client stores the JWT in `localStorage` (`mockforge_token`) along with the serialized user profile details.
4. **Forgot Password Flow**: Users request a reset link sent via Resend API. The link contains a cryptographically secure 32-byte hex token. The token is stored in the database as a SHA-256 hash and expires after 15 minutes. Resetting clears the token and updates the password hashed via `bcrypt`.
5. **Client Requests**: An Axios interceptor automatically attaches the `Authorization: Bearer <token>` header to all outgoing project dashboard calls.
6. **Route Protection**: The backend controllers verify incoming requests using NestJS `AuthGuard`. Unauthorized (401) responses trigger the frontend Zustand store to clear local storage and redirect the user back to `/login`.

---

## 📡 Mock Request Lifecycle

A mock endpoint call goes through the following sequence in the `ResolverService`:

1. **Routing**: NestJS routes requests directed to `/mock/:projectSlug` and `/mock/:projectSlug/*` to the `ResolverController`.
2. **Project Extraction**: Queries database for the `Project` where `slug === projectSlug`.
3. **Access Enforcement**: 
   - If `project.isPublic === false` (Private), the header `X-API-Key` is compared with `project.apiKey`. Mismatch returns a `401 Unauthorized` JSON payload.
4. **Endpoint Matching**: The sub-path following `/mock/:projectSlug` is normalized (leading slash added, trailing slash trimmed) and matched against the `MockEndpoint` database record where `projectId === project.id`. Matches are evaluated using a dynamic segment parameter path resolver (supporting `:param` and `{param}`).
5. **Dynamic Interpolation**: The response template renderer traverses response bodies and headers to resolve dynamic helpers (`{{uuid}}`, `{{timestamp}}`, `{{randomInt}}`), project environment variables (`{{project.VAR_NAME}}`), and request contexts (`{{request.body.field}}`, `{{request.query.param}}`, `{{request.headers.header}}`, `{{request.params.segment}}`).
6. **Payload Logging**: Creates a new `RequestLog` entry. Client source IP addresses are extracted (taking headers like `x-forwarded-for` into consideration for proxy servers) along with the request headers and parsed request body.
7. **Latency Delay**: An asynchronous timer pauses execution if `endpoint.delayMs > 0`.
8. **Execution Output**: Resolves the request by sending the customized content-type, user-configured response headers, and the compiled output body payload at the configured status code.

---

## 📊 Request Logging & Replay System

Every execution of a configured mock route is written to the database:
- **Captured Fields**: Caller IP Address, HTTP Request Method, Full Header JSON, Request Body Payload, and Timestamp.
- **Zustand Stream Integration**: The frontend polls or retrieves project logs, displaying them in a tabular data view.
- **Logs Details Drawer**: Clicking a log row slides a details drawer from the right. This drawer displays syntax-highlighted headers and body payloads for developers to debug request parameters.
- **Replay Playground**: Developers can open any log entry, tweak the target path, HTTP method, request headers, or body payload inside the sandbox interface, and press "Send" to run an immediate replay test against the MockForge engine.
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
│   │   ├── auth/             # Sign-up, login, forgot password, jwt guard
│   │   ├── projects/         # Project CRUD and slug/apiKey/CORS generators
│   │   ├── endpoints/        # Mock endpoints configuration, bulk copy, OpenAPI export
│   │   ├── logs/             # Request logging collection and deletion
│   │   ├── resolver/         # Dynamic resolver path matching & value interpolation
│   │   ├── prisma/           # Global PrismaService wrapping pg driver adapter
│   │   ├── app.module.ts     # Main module imports
│   │   └── main.ts           # Bootstraps NestJS app, CORS, prefix exclusions
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── public/               # Static icons and fonts
    ├── src/
    │   ├── app/              # Next.js App Router (Pages, Features, Docs routes)
    │   ├── components/       # UI Elements (Monaco wrappers, Slide sheets)
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
RESEND_API_KEY="re_123456789"
FRONTEND_URL="http://localhost:3000"
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
npx prisma db push

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

### 3. Dynamic Templating / Request Interpolation
**Request:**
```bash
curl -X POST "http://127.0.0.1:4000/mock/my-api/users/100?ref=newsletter" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tester"}'
```
**Response (201 Created):**
```json
{
  "id": "100",
  "name": "Tester",
  "referrer": "newsletter",
  "uuid": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "timestamp": 1783992019
}
```
