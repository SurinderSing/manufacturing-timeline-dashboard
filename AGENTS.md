# AGENTS.md - Operational Guide for AI Agents

Welcome! This repository is a **React + TypeScript + Vite** Manufacturing Timeline Dashboard application — a frontend assessment for a Senior Frontend Engineer role.
The app connects to a real backend API to display authentication, interactive timeline charts, and hourly production summaries for manufacturing machines.

Please read this file before performing any tasks. Detailed specifications are in `/docs/` and `/memory-bank/`.

---

## Setup & Commands

Always run these commands to set up, build, or verify the application:
- **Install dependencies:** `npm install`
- **Start development server:** `npm run dev`
- **Build production bundle:** `npm run build`
- **Preview production build:** `npm run preview`

---

## Rules and Boundaries

To maintain project integrity, follow this three-tier ruleset:

### 🟩 Always Do
- **Keep Documentation Updated (Highest Priority):** Always update the repository documentation (`/docs/` specifications, memory bank files, and any related contexts) in the same session as the code changes. Never let documentation get out of sync.
- **DRY & Centralized Reusable Utilities (High Priority):** Create shared utility functions, hooks, and helpers in `src/utils/`, `src/hooks/`, `src/lib/` and import/reuse them everywhere. Never duplicate identical logic across files.
- **Single-Responsibility Component Design (High Priority):** Divide components into small, focused subcomponents based on their distinct responsibilities. No monolithic component files.
- **Check for and Fix Errors/Warnings (High Priority):** Always run TypeScript compiler checks and build verification after completing work, fixing all errors before concluding.
- **Prevent Deployment Failures (High Priority):** Always run `npm run build` before concluding any task that modifies source code. Never leave the codebase in a broken state.
- **Performance-First Chart Rendering:** The timeline chart MUST remain interactive at 10,000–20,000 markers. Use Canvas-based rendering, memoization, or virtualization. Never drop FAIL markers during downsampling.
- **UTC ↔ IST Timezone Handling:** All API timestamps are UTC. All displayed timestamps must be IST (Asia/Kolkata, +05:30). Centralize conversion utilities.
- **Centralized API Client:** All HTTP calls go through a single Axios instance with `Authorization: Bearer <token>` header injection and 401 interceptor. Never repeat header wiring in individual calls.
- Use TypeScript with strict type checking. Ensure type annotations are accurate.
- Build clean, responsive UI components using MUI v6.
- Keep components focused and reusable.
- Update `/memory-bank/` files at the end of each session or major task.

### 🟨 Ask First
- Always stay in Ask Mode first to research, create an implementation plan, and obtain user approval before starting edits.
- Before adding new NPM dependencies beyond those already approved.
- Before changing the project's routing structure.
- Before modifying the API client interceptor logic.

### 🟥 Never Do
- **Do not write unit tests** (explicitly out of scope for this assignment).
- **Do not build out-of-scope features:** No segment classification dialogs, no auto-refresh/polling, no CSV/PDF export, no i18n, no multi-theme, no multi-machine views.
- Never hardcode shift names (A/B/C) — always derive from `/core/shifts` API response.
- Never hardcode credentials or API keys. Always read from environment variables.
- Never show UTC timestamps in the UI — always convert to IST.
- Never drop FAIL markers during chart downsampling.

---

## Workspace Layout

- `public/`: Public static assets.
- `src/`: Application source code.
  - `api/`: Axios client instance, API service functions, and TypeScript response types.
  - `app/`: Route page components (Login, Dashboard).
  - `assets/`: Static image assets.
  - `components/`: Reusable React components.
    - `auth/`: Login form, protected route wrapper, auth context provider.
    - `dashboard/`: Filter bar, timeline chart, hourly summary table.
    - `layout/`: App shell — header, sidebar, main content wrapper.
    - `common/`: Shared UI elements — loading spinners, error states, empty states.
  - `hooks/`: Custom React hooks (useAuth, useShifts, useTimeline, useFilters).
  - `lib/`: Business logic utilities — timezone conversion, segment bucketing, produce flattening.
  - `types/`: TypeScript interfaces and type definitions for API responses and domain models.
  - `utils/`: General utility functions — date formatting, color mapping, downsampling.
- `docs/`: Technical and design specifications (PRD, TRD, API_REFERENCE, APP_FLOW).
- `memory-bank/`: Preserved context across work sessions.
- `NOTES.md`: Required assessment deliverable — design decisions and trade-offs.

---

## Backend Configuration

- **Base URL:** `https://fractaldmsdev.centralindia.cloudapp.azure.com` (no `/api` prefix)
- **Test Credentials:** `analytics_user` / `dashboard123`
- **Available Data Range:** 22–25 June 2026
- **Timezone:** API speaks UTC; UI displays IST (Asia/Kolkata, +05:30)
- **MES Envelope:** All responses wrapped in `{ trace_id, status_code, message, data }`
