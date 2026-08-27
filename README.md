# Manufacturing Timeline Dashboard

A high-performance React + TypeScript web application for real-time manufacturing timeline analytics, machine monitoring, and shift production summaries. Built as a Senior Frontend Assessment connecting to the Fractal DMS backend.

---

## 🚀 Key Features

- **Robust Authentication & Session Management:** Token persistence via `localStorage`, session restore on app load (`GET /auth/me`), centralized Axios interceptor with automatic 401 redirect and 500 retry backoff.
- **Interactive High-Performance Timeline Chart:** Custom Canvas-based renderer capable of displaying **10,000–20,000 produce markers at 60 FPS**. Features FAIL-preserving downsampling, brush zoom, double-click reset, and hover tooltips.
- **Hourly Production & Downtime Summary Table:** Precise segment cutting across IST hour boundaries, displaying Total, Pass, Fail, Runtime, Unplanned Production, Downtimes, and Cycle Time metrics.
- **Strict Timezone Architecture (UTC ↔ IST):** Converts IST shift windows to UTC for API requests and maps UTC responses back to IST (+05:30) across all UI elements.
- **Modern UI & UX:** Built with MUI v6, responsive layout, loading skeletons, error states with retry, and empty state handling.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **UI Components:** MUI v6 (`@mui/material`, `@emotion/react`, `@emotion/styled`)
- **Icons:** `@mui/icons-material`
- **Routing:** React Router v7
- **Server State:** TanStack React Query v5
- **HTTP Client:** Axios with custom interceptors
- **Date/Time:** date-fns

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Installation
```bash
git clone <repository-url>
cd manufacturing-timeline-dashboard
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
VITE_API_BASE_URL=https://fractaldmsdev.centralindia.cloudapp.azure.com
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🔑 Test Credentials

| Parameter | Value |
|:---|:---|
| **Username** | `analytics_user` |
| **Password** | `dashboard123` |
| **Available Data Range** | **22–25 June 2026** |

---

## 📖 Documentation

- Detailed design decisions, chart performance strategies, and token storage trade-offs are documented in [NOTES.md](./NOTES.md).
- Product Requirements Document: [docs/PRD.md](./docs/PRD.md)
- Technical Requirements Document: [docs/TRD.md](./docs/TRD.md)
- API Reference: [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)
- Application Flow: [docs/APP_FLOW.md](./docs/APP_FLOW.md)
