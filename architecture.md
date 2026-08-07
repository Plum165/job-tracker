# Opportunity Hub — Layered System Architecture & Production Security

## 1. Overview & Architecture Design

Opportunity Hub adopts a clean, decoupled **Layered Architecture** with strict Separation of Concerns and Defense-in-Depth Security Middleware:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  React 19 Components, Tailwind CSS v4, AuthContext, Views   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API (Bearer JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                    Security & Middleware                    │
│ Helmet (CSP/HSTS), CORS, Rate Limiters, Request Logger, Zod │
└──────────────────────────────┬──────────────────────────────┘
                               │ Validated Body Payload & Authenticated JWT
┌──────────────────────────────▼──────────────────────────────┐
│                    Controller Layer                         │
│ Express Routers (/api/auth, /api/users, /api/jobs, etc.)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Domain DTOs
┌──────────────────────────────▼──────────────────────────────┐
│                     Service Layer                           │
│ AuthService, UserService, JobService, ApplicationService    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Entity Models & Ownership Guards
┌──────────────────────────────▼──────────────────────────────┐
│                   Repository Layer                          │
│ UserRepository, TokenRepository, JobRepository, etc.        │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL Queries
┌──────────────────────────────▼──────────────────────────────┐
│                   Database Engine                           │
│ PostgreSQL Database (Prisma Client & Schema Migrations)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Production Security Hardening

- **Helmet Security Headers**: Strict CSP, Frameguard (`SAMEORIGIN`), Nosniff, HSTS (production), and Referrer Policy.
- **Express Rate Limiting**: Global rate limiter (300 req / 15m) and Auth rate limiter (20 req / 15m).
- **Schema Request Validation**: Zod validation (`loginSchema`, `signupSchema`, `createJobSchema`, `updateApplicationStateSchema`, `createContactSchema`) executing before controllers.
- **JWT Authorization & Guard**: All data routes (`/api/jobs`, `/api/applications`, `/api/contacts`) are protected with JWT verification (`authenticateToken`). User ID is extracted from token claims (`req.user.userId`) and never trusted from client request bodies.
- **Request Logging & Sanitization**: Logs HTTP method, URL, status code, IP, and latency while redacting sensitive password & token values.
- **Global Error Handling**: Uniform error JSON format suppressing sensitive stack traces in non-development environments.
- **Environment Variable Validation**: Zod schema check at server startup (`validateEnv`).

---

## 3. Database Schema (Prisma ORM & PostgreSQL)

The persistence layer uses **Prisma ORM** connecting to a **PostgreSQL** database via the `@prisma/adapter-pg` driver.

### Schema Definitions (`prisma/schema.prisma`)

- **`User` Entity**:
  - `id`: String Primary Key (`usr-*` or generated UUID)
  - `email`: String (Unique)
  - `username`: String (Unique)
  - `studentId`: String? (Unique)
  - `employeeId`: String? (Unique)
  - `fullName`: String
  - `role`: Role Enum (`STUDENT` | `EMPLOYEE` | `ADMIN`)
  - `passwordHash`: String (Bcrypt salted password hash)
  - `createdAt`: DateTime

- **`RefreshToken` Entity**:
  - `id`: String Primary Key (`tok-*`)
  - `userId`: String (Foreign Key -> `User.id`, Cascade Delete)
  - `token`: String (JWT Refresh Token string)
  - `isRevoked`: Boolean (Revocation status for replay attack defense)
  - `replacedByTokenId`: String? (Token family chain tracking)
  - `expiresAt`: DateTime
  - `createdAt`: DateTime

- **`JobOpportunity` Entity**:
  - `id`: String Primary Key
  - `companyName`: String
  - `jobTitle`: String
  - `jobCategory`: String
  - `location`: String
  - `workArrangement`: String (`Remote` | `Hybrid` | `On-site`)
  - `employmentType`: String
  - `closingDate`: String
  - `isShared`: Boolean (Public catalog flag vs. User created opportunity)
  - `createdById`: String? (Foreign Key -> `User.id`)

- **`UserApplicationState` Entity**:
  - `id`: String Primary Key
  - `userId`: String (Foreign Key -> `User.id`, Cascade Delete)
  - `opportunityId`: String (Foreign Key -> `JobOpportunity.id`, Cascade Delete)
  - `status`: String (`Researching`, `Preparing`, `Applied`, `Interview`, `Offer`, `Rejected`, `Closed`, `Withdrawn`)
  - `priority`: String (`High`, `Medium`, `Low`)
  - `dateApplied`: String?
  - `personalNotes`: String
  - `interviewDates`: String (JSON Array of interview events)
  - `documentsPrepared`: String (JSON Checklist)
  - `personalLinks`: String (JSON Array of URLs)
  - Unique constraint: `[userId, opportunityId]`

- **`Contact` Entity**:
  - `id`: String Primary Key
  - `userId`: String (Foreign Key -> `User.id`, Cascade Delete)
  - `name`: String
  - `company`: String
  - `role`: String
  - `email`: String
  - `linkedIn`: String
  - `howMet`: String
  - `privateNotes`: String

---

## 4. API Endpoint Specifications

| Method | Endpoint | Auth | Scope / Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | JWT | Get all visible opportunities (Public Catalog + User Created) |
| `GET` | `/api/jobs/public` | JWT | Get public catalog opportunities only |
| `GET` | `/api/jobs/mine` | JWT | Get user-created private opportunities |
| `POST` | `/api/jobs` | JWT | Create new job opportunity owned by authenticated user |
| `PATCH` | `/api/jobs/:id` | JWT | Update job opportunity (Owner guard verified) |
| `DELETE` | `/api/jobs/:id` | JWT | Delete job opportunity (Owner guard verified) |
| `GET` | `/api/applications` | JWT | Get all application states for authenticated user |
| `GET` | `/api/applications/:opportunityId` | JWT | Get application state for specific job opportunity |
| `PUT` | `/api/applications/:opportunityId` | JWT | Save/Update user application state & notes |
| `PATCH` | `/api/applications/:opportunityId/status` | JWT | Update application status specifically |
| `PATCH` | `/api/applications/:opportunityId/priority` | JWT | Update application priority specifically |
| `GET` | `/api/contacts` | JWT | Get all recruiter & network contacts for authenticated user |
| `POST` | `/api/contacts` | JWT | Create new contact for authenticated user |
| `PATCH` | `/api/contacts/:id` | JWT | Update contact details |
| `DELETE` | `/api/contacts/:id` | JWT | Delete contact |

---

## 5. Seed Data & Initial Migration

Initial migrations are stored in `prisma/migrations/20260806000000_init/migration.sql`.

Seed data in `prisma/seed.ts` populates default enterprise accounts:
- **`SMSMOE006`**: Demo Admin Lead (`smsmoe006@enterprise.io`, password: `1234`)
- **`architect99`**: Lead Architect (`architect@enterprise.io`, password: `Password123!`)
- **`jordan_student`**: Student (`student@university.edu`, password: `Password123!`)
- **`taylor_dev`**: Senior Developer (`employee@company.com`, password: `Password123!`)

---

## 6. Authentication Flow & Token Lifecycle

1. **Identifier Analysis**: User inputs Email, Student ID (`STU*`), Employee ID (`EMP*`), or Username.
2. **Schema Validation**: `validateRequest(loginSchema)` verifies non-empty input.
3. **Regex Type Detection**: `detectIdentifierType` identifies input type.
4. **Repository Query**: `userRepository.findByIdentifier()` searches PostgreSQL for matching user.
5. **Password Verification**: `bcrypt.compare()` verifies password hash.
6. **Dual JWT Generation**: Issues 15-minute Access Token and 7-day Refresh Token recorded in PostgreSQL.
7. **Token Rotation & Replay Protection**: Refreshing tokens revokes the old token record. If a revoked token is reused, all user refresh tokens are invalidated immediately.

---

## 7. Frontend Authentication Architecture & Automatic Refresh

The React presentation layer connects to the backend API via an Axios-based client (`src/lib/apiClient.ts`):

1. **Token Storage (`TokenStorage`)**: Access tokens and refresh tokens are managed securely with memory and `localStorage` fallback persistence.
2. **Axios Interceptors**:
   - **Request Interceptor**: Automatically injects `Authorization: Bearer <accessToken>` headers into outbound requests.
   - **Response Interceptor**: Intercepts `401 Unauthorized` API responses. It queues concurrent failing requests, triggers a single `/api/auth/refresh` endpoint request using the refresh token, updates stored credentials, and retries all queued requests transparently without requiring manual page refresh or interrupting the user.
   - **Unrecoverable Rejection Guard**: If token refresh fails or credentials are revoked, queued requests are rejected and the user is automatically logged out to a clean state.
3. **Auth Context (`AuthContext.tsx`)**: Exposes reactive `user`, `tokens`, `isAuthenticated`, `isLoading`, `login`, `signup`, `logout`, and `refreshTokens` states across the app.
4. **Protected Routes (`ProtectedRoute.tsx`)**: Wraps core routes and views. Handles session restoration loading spinners, authentication guards, and role-based authorization rules (`STUDENT`, `EMPLOYEE`, `ADMIN`).
5. **Custom Hooks (`useAuth`, `useRequireAuth`, `useUserRole`)**: Simplifies session checking, role validation, and route protection in UI components.

