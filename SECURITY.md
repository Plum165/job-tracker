# Security Architecture & Production Hardening Guide

## 1. Executive Security Summary

Opportunity Hub implements an **Enterprise-Grade, Defense-in-Depth Security Framework** for authentication and data operations. The architecture protects against common web vulnerabilities, credential theft, brute-force attacks, session hijacking, replay attacks, and sensitive data exposure.

---

## 2. Threat Model & Implemented Security Controls

| Threat Vector | Mitigation Strategy | Implemented Component |
| :--- | :--- | :--- |
| **Credential Brute Force** | Strict IP-based Rate Limiting (20 req/15min) | `authRateLimiter` (`express-rate-limit`) |
| **Volumetric API Abuse** | Global API Rate Limiting (300 req/15min) | `globalApiRateLimiter` |
| **Token Theft & Replay** | Short-Lived Access Tokens (15m) + Single-Use Refresh Token Rotation | `AuthService.refreshTokens` |
| **Replay Attack / Stolen Refresh Token** | Family Revocation Tracking & Automatic Account Invalidation | `TokenRepository.revokeAllUserTokens` |
| **Cross-Site Scripting (XSS)** | CSP Directives, Nosniff, XSS Protection Headers, Content Sanitization | `helmet` + `explicitSecurityHeaders` |
| **Clickjacking / Frame Injection** | Frameguard (`SAMEORIGIN`) | `helmet.frameguard` |
| **Cross-Origin Data Leakage** | Configured CORS Origins & Method Control | `getCorsMiddleware` (`cors`) |
| **Injection & Malformed Inputs** | Schema Validation using Zod | `validateRequest` + `zod` |
| **Information Disclosure / Leaks** | Payload Sanitization in Logs, Hiding `X-Powered-By`, Suppressed Error Stacks | `requestLogger` + `errorHandler` |
| **Environment Misconfiguration** | Schema Validation of Secrets at Server Boot | `validateEnv` (`envConfig.ts`) |

---

## 3. JWT Dual-Token Lifecycle & Replay Detection

### Token Specifications
- **Access Tokens**:
  - **Lifetime**: 15 Minutes
  - **Purpose**: Authorize protected API operations (`/api/auth/me`, `/api/auth/active-sessions`)
  - **Algorithm**: HMAC-SHA256
  - **Payload Claims**: `userId`, `role`, `email`, `username`, `tokenType: 'access'`
- **Refresh Tokens**:
  - **Lifetime**: 7 Days
  - **Purpose**: Exchange for a new Access/Refresh token pair
  - **Storage**: Tracked in PostgreSQL `refresh_tokens` database table with revocation flags (`isRevoked`) and parent-child chaining (`replacedByTokenId`).

### Replay Attack Detection Mechanism
```
Client                      Server                          PostgreSQL
  │                            │                                │
  ├──── Send Refresh Token ───►│                                │
  │                            ├────── Query Token Record ─────►│
  │                            │◄───── Return Token Record ─────┤
  │                            │                                │
  │                            ├─── Check `isRevoked` ───┐     │
  │                            │                         │      │
  │                            │  If TRUE (REPLAY!):     │      │
  │                            │  Revoke ALL user tokens ├─────►│
  │                            │  Throw Security Alert   │      │
  │                            │                         │      │
  │                            │  If FALSE (VALID):      │      │
  │                            │  Mark token `isRevoked` ├─────►│
  │                            │  Issue new token pair   ├─────►│
  │◄── Return New Tokens ──────┤                                │
```

When a previously rotated or revoked refresh token is presented to `/api/auth/refresh`:
1. The server detects that `tokenRecord.isRevoked === true`.
2. A security event (`REPLAY_ATTACK_DETECTED`) is logged.
3. **Emergency Invalidation**: Every active refresh token associated with that user account is immediately revoked in PostgreSQL (`revokeAllUserTokens`).
4. The user is forced to re-authenticate with credentials.

---

## 4. Middleware Pipeline Order

Express processes requests strictly in the following order:

```
1. Environment Variable Validation (validateEnv)
2. Security Headers (Helmet + Explicit Headers)
3. CORS Policy Verification (corsMiddleware)
4. JSON Body Parser (express.json with 1MB limit)
5. Request Logger & Payload Sanitizer (requestLogger)
6. Global API Rate Limiter (300 req/15min)
7. Auth Endpoint Rate Limiter (20 req/15min)
8. Zod Payload Schema Validation (validateRequest)
9. Controller Business Logic & JWT Verification
10. Global Error Handler (errorHandler)
```

---

## 5. Security Headers Configuration

The application injects the following security response headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ws: wss: https:; frame-ancestors 'self' https://*.google.com https://*.run.app;
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload (Production)
```

---

## 6. Audit & Validation

Run the following scripts to verify security and code quality:

```bash
# Run TypeScript compilation & linting
npm run lint

# Verify full production build
npm run build
```
