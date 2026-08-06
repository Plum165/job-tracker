# Opportunity Hub — Layered System Architecture & Data Persistence

## 1. Overview & Architecture Design

Opportunity Hub adopts a clean, decoupled **Layered Architecture** with strict Separation of Concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  React 19 Components, Tailwind CSS v4, AuthContext, Views   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    Controller Layer                         │
│  Express Routers (/api/auth/login, signup, refresh, me)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Domain DTOs
┌──────────────────────────────▼──────────────────────────────┐
│                     Service Layer                           │
│  AuthService (Multi-Identifier Detection, JWT Rotation)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Entity Models
┌──────────────────────────────▼──────────────────────────────┐
│                   Repository Layer                          │
│  UserRepository & TokenRepository (Prisma ORM Interfaces)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL Queries
┌──────────────────────────────▼──────────────────────────────┐
│                   Database Engine                           │
│  PostgreSQL Database (Prisma Client & Schema Migrations)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema (Prisma ORM & PostgreSQL)

The persistence layer uses **Prisma ORM** connecting to a **PostgreSQL** database.

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

## 3. Seed Data & Initial Migration

Initial migrations are stored in `prisma/migrations/20260806000000_init/migration.sql`.

Seed data in `prisma/seed.ts` populates default enterprise accounts:
- **`SMSMOE006`**: Demo Admin Lead (`smsmoe006@enterprise.io`, password: `1234`)
- **`architect99`**: Lead Architect (`architect@enterprise.io`, password: `Password123!`)
- **`jordan_student`**: Student (`student@university.edu`, password: `Password123!`)
- **`taylor_dev`**: Senior Developer (`employee@company.com`, password: `Password123!`)

---

## 4. Authentication Flow & Multi-Identifier Regex Inferring

1. **Identifier Analysis**: User inputs Email, Student ID (`STU*`), Employee ID (`EMP*`), or Username.
2. **Regex Type Detection**: `detectIdentifierType` identifies the input type.
3. **Repository Query**: `userRepository.findByIdentifier()` searches PostgreSQL for matching user credentials.
4. **Password Verification**: `bcrypt.compare()` verifies the hashed password.
5. **Dual JWT Generation**: Issues 15-minute Access Token and 7-day Refresh Token stored in PostgreSQL `refresh_tokens` table.
6. **Token Rotation & Replay Protection**: Refreshing tokens revokes the old token record and stores the new child token ID. If a revoked token is reused, all user refresh tokens are invalidated immediately.
