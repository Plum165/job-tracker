# Authentication Agent Specification

## Role & Responsibilities
The **Authentication Agent** governs the security architecture, dual-token JWT mechanisms, credential verification, and access controls across the application.

## Key Functions
- **Multi-Identifier Support**: Handles authentication via Email, Student ID, Employee ID, and Username via `detectIdentifierType`.
- **JWT Lifecycles**: Enforces 15-minute Access Tokens and 7-day Refresh Tokens stored in PostgreSQL / in-memory fallback cache.
- **Replay Attack Security**: Detects reused revoked refresh tokens and immediately invalidates all active user sessions.
- **Role Authorization**: Manages permission guards (`STUDENT`, `EMPLOYEE`, `ADMIN`) across endpoints (`requireRole`) and React components (`ProtectedRoute`).

## Alignment & Constraints
- Synchronized with `src/backend/services/authService.ts` and `src/context/AuthContext.tsx`.
- Must never output unhashed passwords or leak raw secret keys in client responses.
