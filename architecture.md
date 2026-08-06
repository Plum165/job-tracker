# Opportunity Hub — Layered System Architecture & Production Security

## 1. Overview & Architecture Design

Opportunity Hub adopts a clean, decoupled **Layered Architecture** with strict Separation of Concerns and Defense-in-Depth Security Middleware:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  React 19 Components, Tailwind CSS v4, AuthContext, Views   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    Security & Middleware                    │
│ Helmet (CSP/HSTS), CORS, Rate Limiters, Request Logger, Zod │
└──────────────────────────────┬──────────────────────────────┘
                               │ Validated Body Payload
┌──────────────────────────────▼──────────────────────────────┐
│                    Controller Layer                         │
│ Express Routers (/api/auth/login, signup, refresh, me, etc.)│
└──────────────────────────────┬──────────────────────────────┘
                               │ Domain DTOs
┌──────────────────────────────▼──────────────────────────────┐
│                     Service Layer                           │
│ AuthService (Multi-ID Detection, JWT Rotation, Replay Alert)│
└──────────────────────────────┬──────────────────────────────┘
                               │ Entity Models
┌──────────────────────────────▼──────────────────────────────┐
│                   Repository Layer                          │
│ UserRepository & TokenRepository (Prisma ORM Interfaces)   │
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
- **Schema Request Validation**: Zod validation (`loginSchema`, `signupSchema`, `refreshTokenSchema`) executing before controllers.
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
  - `ipAddress`: String?
  - `userAgent`: String?

---

## 4. Seed Data & Initial Migration

Initial migrations are stored in `prisma/migrations/20260806000000_init/migration.sql`.

Seed data in `prisma/seed.ts` populates default enterprise accounts:
- **`SMSMOE006`**: Demo Admin Lead (`smsmoe006@enterprise.io`, password: `1234`)
- **`architect99`**: Lead Architect (`architect@enterprise.io`, password: `Password123!`)
- **`jordan_student`**: Student (`student@university.edu`, password: `Password123!`)
- **`taylor_dev`**: Senior Developer (`employee@company.com`, password: `Password123!`)

---

## 5. Authentication Flow & Token Lifecycle

1. **Identifier Analysis**: User inputs Email, Student ID (`STU*`), Employee ID (`EMP*`), or Username.
2. **Schema Validation**: `validateRequest(loginSchema)` verifies non-empty input.
3. **Regex Type Detection**: `detectIdentifierType` identifies input type.
4. **Repository Query**: `userRepository.findByIdentifier()` searches PostgreSQL for matching user.
5. **Password Verification**: `bcrypt.compare()` verifies password hash.
6. **Dual JWT Generation**: Issues 15-minute Access Token and 7-day Refresh Token recorded in PostgreSQL.
7. **Token Rotation & Replay Protection**: Refreshing tokens revokes the old token record. If a revoked token is reused, all user refresh tokens are invalidated immediately.
