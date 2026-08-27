# Memory Bank - Progress Tracker

## Project Phases & Status

### Phase 0: Project Initialization & Planning ✅
- [x] Analyze assignment requirements
- [x] Review reference screenshots
- [x] Review sample API payloads
- [x] Scaffold Vite + React + TypeScript project
- [x] Install core dependencies (MUI v6, React Router, Axios, React Query, date-fns)
- [x] Create AGENTS.md and .agents/AGENTS.md
- [x] Create docs/ (PRD, TRD, API_REFERENCE, APP_FLOW)
- [x] Create memory-bank/ files
- [x] Create .env.example
- [x] Create implementation plan

### Phase 1: Foundation Setup ✅
- [x] Configure Vite path aliases (`@/` → `src/`)
- [x] Configure TypeScript strict mode and path aliases
- [x] Set up MUI v6 theme provider with custom palette
- [x] Set up React Router v7 with route structure (`/login`, `/dashboard`, `/`, `*`)
- [x] Create Axios API client (`src/api/client.ts`) with interceptors
- [x] Create TypeScript types for all API responses (`src/types/`)
- [x] Create AuthContext provider (`src/components/auth/AuthProvider.tsx`)
- [x] Create ProtectedRoute wrapper (`src/components/auth/ProtectedRoute.tsx`)
- [x] Create React Query provider setup

### Phase 2: Authentication (Part 1 of Assignment) ✅
- [x] Build Login page (`src/app/LoginPage.tsx`) with MUI form
- [x] Implement form validation (both fields required)
- [x] Show loading state during login request
- [x] Show inline error on 401
- [x] Store token in localStorage on success
- [x] Redirect to `/dashboard` on success
- [x] Implement session restore on app load (`GET /auth/me`)
- [x] Implement logout flow (`POST /auth/logout` + clear token + redirect)
- [x] Show user name and role in app header
- [x] Handle 401 on any authenticated call → redirect to `/login`

### Phase 3: Dashboard Shell & Filter Bar ✅
- [x] Build app shell layout (header with user info, main content area)
- [x] Build filter bar component with selectors
- [x] Fetch asset tree (`GET /core/assets/tree`) → flatten with breadcrumbs
- [x] Fetch shifts (`GET /core/shifts`) → compute shift options dynamically
- [x] Build date picker (default to 2026-06-23)
- [x] Build "Show individual produces" toggle
- [x] Build "Point labels" toggle
- [x] Build manual refresh button with spinner
- [x] Wire filter changes to data refetch

### Phase 4: Timeline Chart (Hardest Part — Performance Graded) ✅
- [x] Create Canvas-based chart component
- [x] Render segment bands (runtime/downtime/stoppage) with color coding
- [x] Render produce markers (PASS = circle, FAIL = cross)
- [x] Implement time-scaled X-axis with IST labels
- [x] Implement Y-axis for cumulative production
- [x] Implement zoom via brush selection (drag / Shift+drag)
- [x] Implement zoom reset (double-click)
- [x] Implement hover tooltips on produce markers and segments
- [x] Pre-compute geometry (timestamps → pixels, colors resolved)
- [x] Implement FAIL-preserving downsampling for 10k+ markers
- [x] Memoize computed data with useMemo
- [x] Add chart legend (Runtime, Unplanned Production, Planned Downtime, etc.)

### Phase 5: Hourly Summary Table ✅
- [x] Create table component with MUI Table
- [x] Generate per-hour columns from shift window (IST)
- [x] Implement segment-to-hourly bucketing (cut at hour boundaries)
- [x] Populate rows: Total, Pass, Fail, Actual Cycle Time, Ideal Cycle Time, Runtime, Planned Downtime, Minor Stoppage, Unknown Downtime, Unplanned Production
- [x] Fetch cycle-time data (`POST /analytics-query`) → populate Ideal/Actual Cycle Time rows
- [x] Handle null cycle-time values (blank cells)
- [x] Handle in-progress shifts (empty future hours, not zero-filled)
- [x] Verify per-hour minutes sum ≈ 60

### Phase 6: Error Handling & States ✅
- [x] Loading states for all data-fetching components
- [x] Error states with retry buttons
- [x] Empty state for shifts with no data
- [x] In-progress shift state (partial data)
- [x] 500 error retry with exponential backoff (1s, 2s delay)

### Phase 7: Polish & Deliverables ✅
- [x] Write NOTES.md with all required trade-off explanations
- [x] Final UI polish and responsiveness
- [x] .env.example with setup instructions
- [x] README.md with run instructions
- [x] Run `npm run build` — zero errors

---

## Red Flags Checklist (Pre-Submission)
- [x] Chart does NOT freeze with individual produces on (Canvas 60fps)
- [x] Downsampling does NOT hide FAIL markers (unconditional preservation)
- [x] Timeline is NOT shifted by 5½ hours (UTC vs IST correct throughout)
- [x] Auth header is centralized in single Axios client
- [x] Page refresh does NOT log user out (session restored from localStorage via /auth/me)
- [x] 401 is handled (session expiry redirects to login)
- [x] Chart and table data AGREE
- [x] Per-hour minutes ADD UP to ≈ 60
