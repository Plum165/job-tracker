# Opportunity Hub — Shared Catalog & Private Job Application Tracker

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

A privacy-focused, enterprise-authenticated job opportunity catalog and personal application tracker designed for students, graduates, and engineering candidates. 

Shared company and job opportunity data is available in the public catalog, while each user’s application statuses, personal notes, interview logs, document checklists, and recruiter contacts are securely stored in the PostgreSQL database and isolated by JWT authentication, ensuring full user privacy and cross-device persistence.

---

## 1. Project Overview

### What It Is
Opportunity Hub bridges the gap between shared job discovery and private personal tracking. Group members or friends see the exact same catalog of graduate roles, internships, and tech vacancies, but every user's personal application progress, dates applied, interview preparation notes, and contacts remain completely private to their own device.

### Why It Exists
Most job application tools either force users into expensive cloud databases requiring accounts and logins, or isolate them in personal spreadsheets where sharing new company links requires manual effort. Opportunity Hub provides a shared catalog with zero server overhead and complete client-side data ownership.

### Target Audience
- University graduates & students applying to graduate programs and internships.
- Software engineers, data scientists, and fintech candidates tracking multiple interview pipelines.
- Study groups and peer networks looking for a unified job directory with private notes.

---

## 2. Features

- 🔍 **Shared Opportunities Catalog**: Central directory of software engineering, data science, graduate programmes, and internship roles with company descriptions, locations, work arrangements (Remote, Hybrid, On-site), and application links.
- 🔒 **Zero-Backend Private Workspace**: Application statuses, application dates, personal notes, and recruiter contacts are stored locally on your device in IndexedDB / `localStorage`.
- 📊 **Interactive Dashboard**: Real-time analytics tracking active applications, interview stages, offers received, and upcoming closing deadlines (< 7 days).
- 📋 **Application Kanban Board**: Visual drag-and-drop / selector board organizing opportunities by status (`Researching`, `Not started`, `Preparing`, `Applied`, `Interview`, `Offer`, `Rejected`, `Closed`, `Withdrawn`).
- ⏰ **Deadline Countdown Alerts**: Real-time countdown badges (`Closing today`, `Closes in 3 days`, `Closed X days ago`).
- 📅 **Deadlines & Milestones Calendar**: Chronological timeline mapping application deadlines, technical interview dates, and follow-up reminders.
- 🤝 **Recruiter & Contact CRM**: Private networking database for recruiters, software managers, and alumni.
- 📑 **Excel & CSV Import Wizard**: Import existing Excel sheets (`.xlsx`, `.xls`, `.csv`) with automatic header detection and mapping.
- 💾 **JSON Backup & Export**: One-click download of private workspace JSON backups for data portability and device restoration.
- 📤 **Excel Export**: Export the full opportunity matrix and personal status to Excel spreadsheets (`.xlsx`).
- 🎨 **Modern Responsive UI**: Clean, high-contrast light/dark layout built with Tailwind CSS v4 and Lucide React icons.

---

## 3. Technology Stack

### Frontend
- **React 19**: Modern component composition and hooks.
- **TypeScript 5.8**: Complete end-to-end type safety for data models.
- **Axios**: Production API client featuring request/response interceptors for automatic dual-token JWT refresh queueing.
- **Vite 6**: Fast bundling and instant local dev environment.
- **Tailwind CSS v4**: Utility-first styling with high-contrast neutral palette.
- **Lucide React**: Clean vector icons.
- **Motion**: Fluid route transitions and entry animations.
- **Canvas-Confetti**: Celebration effects upon receiving job offers!

### Backend & Authentication
- **Express + Prisma ORM**: Decoupled layered architecture with PostgreSQL database.
- **Dual-Token JWT Auth**: Short-lived access tokens + rotating refresh tokens with replay detection.
- **Protected Routes & Hooks**: `ProtectedRoute` wrapper component and custom `useAuth` / `useRequireAuth` hooks for seamless session restoration and role-based access controls.

---

## 4. Repository Structure

```
.
├── assets/                  # Branding assets, logo, and favicon placeholders
│   ├── favicon.png
│   ├── logo.png
│   └── README.md
├── demo/                    # Demo resources, sample Excel import files, and backups
│   └── README.md
├── docs/                    # Architecture guides and data model documentation
│   └── README.md
├── scripts/                 # Maintenance and validation scripts
│   └── README.md
├── src/
│   ├── backend/             # Virtual client-side backend & IndexedDB storage engine
│   │   └── README.md
│   ├── components/          # React 19 visual UI components
│   │   ├── Calendar/        # Timeline and calendar view
│   │   ├── Contacts/        # Recruiter contacts CRM
│   │   ├── Dashboard/       # Overview analytics and urgency alerts
│   │   ├── DataManagement/  # Excel import wizard & backup manager
│   │   ├── Kanban/          # Application status Kanban board
│   │   ├── Opportunities/   # Catalog cards, table matrix, and detail modals
│   │   └── UI/              # Toast notifications container
│   ├── context/             # React Workspace Context state provider
│   ├── data/                # Shared default opportunities catalog
│   ├── frontend/            # UI documentation
│   │   └── README.md
│   ├── lib/                 # Storage engine, Excel parser, and date utilities
│   ├── types/               # TypeScript interfaces and status enums
│   ├── App.tsx              # Main layout and tab router
│   ├── index.css            # Global Tailwind CSS entry
│   └── main.tsx             # Application bootstrap
├── vendor/                  # Third-party dependencies documentation
│   └── README.md
├── .env.example             # Environment variable declarations
├── metadata.json            # AI Studio metadata configuration
├── package.json             # Package manifest and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

---

## 5. Installation

Ensure you have Node.js 18+ installed on your machine.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/opportunity-hub.git
   cd opportunity-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 6. Setup

Create a `.env` file based on `.env.example`:
```env
APP_URL="http://localhost:3000"
```

No API keys or databases are required to run the application locally!

---

## 7. Running the Project

### Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Type Check & Validation
```bash
npm run lint
```

### Run Test Suite
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 8. Production Deployment & Operations

The application is prepared for enterprise production deployment across Vercel (Frontend SPA), Render (Backend API), and Render Managed PostgreSQL (Database):

- **Deployment Guide**: See [`DEPLOYMENT.md`](DEPLOYMENT.md) for step-by-step instructions.
- **Frontend (Vercel)**: Configured with `vercel.json` for edge static SPA routing, SSL, and security headers.
- **Backend (Render)**: Defined in `render.yaml` for Node.js Express API service, health checks (`GET /api/health`), and rate limiting.
- **Database (PostgreSQL)**: Relational database managed with Prisma ORM (`npx prisma migrate deploy`).
- **AI Agent Specifications**: See [`agents/`](agents/) for engineering, authentication, and deployment agent definitions.

---

## 9. Future Improvements

- 🔔 **Browser Notification Alerts**: Web Push alerts for deadlines closing within 24 hours.
- 📱 **PWA Service Worker**: Full Progressive Web App manifest for desktop and mobile installability.
- 🌐 **Peer-to-Peer Sync (WebRTC)**: Optional direct browser-to-browser sharing of custom opportunity additions without central servers.
