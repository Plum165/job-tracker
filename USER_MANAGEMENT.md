# User Management System — Phase 3 Specification & API Reference

## Architectural Overview

The User Management system is constructed following a strict layered architecture:
`Controller Layer (Express)` -> `Validation Middleware (Zod)` -> `Auth Guard (JWT Middleware)` -> `Service Layer (Business Logic)` -> `Repository Layer (Prisma ORM)` -> `Audit Logging Engine`.

---

## REST Endpoints & Authorization Rules

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Authenticated (JWT) | View complete authenticated user profile & parsed preferences |
| `PATCH` | `/api/users/me` | Authenticated (JWT) | Edit profile details (fullName, username, email, avatarUrl, bio, preferences) |
| `PATCH` | `/api/users/password` | Authenticated (JWT) | Change account password with current password verification & session revocation |
| `DELETE` | `/api/users/me` | Authenticated (JWT) | Delete account with password confirmation & token revocation |
| `GET` | `/api/users/me/audit-logs` | Authenticated (JWT) | View account security audit trail history |
| `GET` | `/api/users` | Admin Only (`ADMIN`) | List all registered user accounts |
| `PATCH` | `/api/users/:userId/role` | Admin Only (`ADMIN`) | Modify user access role (`STUDENT`, `EMPLOYEE`, `ADMIN`) |
| `DELETE` | `/api/users/:userId` | Admin Only (`ADMIN`) | Delete any target user account |

---

## DTO Data Schemas & Validation

### 1. Edit Profile (`PATCH /api/users/me`)
```json
{
  "fullName": "Jane Doe",
  "username": "janedoe",
  "email": "jane@enterprise.io",
  "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "bio": "Senior Systems Architect specializing in Cloud Run & Security.",
  "preferences": {
    "theme": "dark",
    "emailNotifications": true,
    "displayMode": "comfortable"
  }
}
```

### 2. Change Password (`PATCH /api/users/password`)
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecurePassword456!"
}
```

### 3. Delete Account (`DELETE /api/users/me`)
```json
{
  "password": "Password123!"
}
```

### 4. Admin Role Management (`PATCH /api/users/:userId/role`)
```json
{
  "role": "ADMIN"
}
```

---

## Security & Audit Trail Integration

All user management state mutations trigger an immutable audit event captured by `AuditService`:
- `PROFILE_UPDATE`: Logged when profile name, username, email, bio, or avatar is changed.
- `PASSWORD_CHANGE`: Logged when password is changed. Automatically revokes all existing refresh tokens for the user across all devices.
- `ACCOUNT_DELETE`: Logged when account is deleted by self or admin.
- `ROLE_CHANGE`: Logged when administrator updates user access role.
- `PREFERENCES_UPDATE`: Logged when theme, notification, or layout density preferences change.
