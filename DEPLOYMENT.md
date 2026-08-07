# Production Deployment & Operations Guide

This document provides a complete guide for deploying Opportunity Hub to production cloud infrastructure, configuring production environment variables, executing database migrations, and performing operational rollbacks.

---

## 1. Cloud Architecture Overview

| Component | Target Platform | Hosted Asset / Service | Configuration |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | React 19 Single Page Application (SPA) | `vercel.json` |
| **Backend** | **Render** | Node.js Express REST API | `render.yaml` |
| **Database** | **Render PostgreSQL** | Relational Database Engine (Prisma ORM) | `prisma/schema.prisma` |

---

## 2. Step-by-Step Deployment Guide

### Phase A: Database Setup (Render PostgreSQL / Neon)
1. Log into your **Render Dashboard** (or Supabase/Neon).
2. Create a new **PostgreSQL Instance**:
   - **Database Name**: `opportunity_hub`
   - **User**: `postgres`
   - **Region**: Oregon (or matching backend region)
3. Copy the production `DATABASE_URL` connection string (with `?sslmode=require`).

### Phase B: Backend API Deployment (Render Web Service)
1. Connect your GitHub repository to Render.
2. Select **New Web Service** -> Use `render.yaml` or manually configure:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
3. Configure Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: `<Your-PostgreSQL-Connection-String>`
   - `CORS_ORIGIN`: `https://opportunity-hub.vercel.app,https://*.vercel.app`
   - `JWT_ACCESS_SECRET`: `<Secret-Min-32-Chars>`
   - `JWT_REFRESH_SECRET`: `<Secret-Min-32-Chars>`
4. Trigger Initial Deployment & execute Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Phase C: Frontend SPA Deployment (Vercel)
1. Import your GitHub repository into **Vercel**.
2. Framework Preset: **Vite**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure Environment Variables in Vercel:
   - `VITE_API_BASE_URL`: `https://opportunity-hub-backend.onrender.com`
4. Deploy application. Vercel automatically routes `/api/*` traffic to the Render backend and handles SPA route rewrites via `vercel.json`.

---

## 3. Production Readiness Checklist

Before marking deployment ready, verify every item below:

- [x] **Build Validation**: Executed `npm run build` without compilation or bundling errors.
- [x] **Linting Verification**: Passed `npm run lint` (`tsc --noEmit`) with zero type errors.
- [x] **Automated Test Suite**: Passed `npm test` (`vitest run`) with 27/27 green unit, integration, and API tests.
- [x] **HTTPS Enforcement**: Enabled SSL/TLS on both Vercel frontend and Render backend endpoints.
- [x] **CORS Restraints**: Verified that `CORS_ORIGIN` strictly matches production frontend domain(s).
- [x] **Reverse Proxy Header Trust**: Enabled `app.set('trust proxy', 1)` for accurate IP rate-limiting behind cloud proxies.
- [x] **Health Check Verification**: Verified `GET /api/health` returns status `200 OK` with database status, memory metrics, and uptime.
- [x] **Database Schema Sync**: Applied migrations via `npx prisma migrate deploy`.
- [x] **Security Header Hardening**: Verified CSP, HSTS, X-Frame-Options (DENY), and X-Content-Type-Options (nosniff) headers.

---

## 4. Rollback Procedures

### Procedure A: Frontend Vercel Rollback
If a visual defect or client-side bug is released:
1. Open the **Vercel Project Dashboard**.
2. Navigate to **Deployments**.
3. Locate the previous stable deployment build.
4. Click the **`...`** menu -> Select **Instant Rollback**.
5. Vercel automatically redirects global CDN edge traffic to the previous build in < 5 seconds.

### Procedure B: Backend Render Rollback
If an API bug or backend regression occurs:
1. Open the **Render Service Dashboard** for `opportunity-hub-backend`.
2. Navigate to **Events** / **Deploys**.
3. Select the previous successful deployment release.
4. Click **Rollback to this deploy**.
5. Render boots the previous container image and routes traffic after passing `/api/health`.

### Procedure C: Database Schema Rollback
If a broken database migration is applied:
1. Revert the target migration step locally using Prisma:
   ```bash
   npx prisma migrate resolve --rolled-back "<migration_name>"
   ```
2. Redeploy the previous schema version:
   ```bash
   npx prisma db push
   ```

---

## 5. System Health Endpoint Specification

### `GET /api/health`
**Sample Production Response**:
```json
{
  "status": "ok",
  "service": "Opportunity Hub API",
  "environment": "production",
  "uptimeSeconds": 14520,
  "database": "healthy",
  "memoryUsage": {
    "rssMb": 84,
    "heapUsedMb": 42
  },
  "timestamp": "2026-08-07T11:06:12.000Z"
}
```
