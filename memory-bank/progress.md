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

### Phase 1: Foundation Setup 🔲
- [ ] Configure Vite path aliases (`@/` → `src/`)
- [ ] Configure TypeScript strict mode and path aliases
- [ ] Set up MUI v6 theme provider (dark/light, color palette for segments)
- [ ] Set up React Router v6 with route structure (`/login`, `/dashboard`, `/`, `*`)
- [ ] Create Axios API client (`src/api/client.ts`) with interceptors
- [ ] Create TypeScript types for all API responses (`src/types/`)
- [ ] Create AuthContext provider (`src/components/auth/AuthProvider.tsx`)
- [ ] Create ProtectedRoute wrapper (`src/components/auth/ProtectedRoute.tsx`)
- [ ] Create React Query provider setup

### Phase 2: Authentication (Part 1 of Assignment) 🔲
- [ ] Build Login page (`src/app/LoginPage.tsx`) with MUI form
- [ ] Implement form validation (both fields required)
- [ ] Show loading state during login request
- [ ] Show inline error on 401
- [ ] Store token in localStorage on success
- [ ] Redirect to `/dashboard` on success
- [ ] Implement session restore on app load (`GET /auth/me`)
- [ ] Implement logout flow (`POST /auth/logout` + clear token + redirect)
- [ ] Show user name in app header
- [ ] Handle 401 on any authenticated call → redirect to `/login`

### Phase 3: Dashboard Shell & Filter Bar 🔲
- [ ] Build app shell / layout (header with user info, main content area)
- [ ] Build filter bar component
- [ ] Fetch asset tree (`GET /core/assets/tree`) → populate machine selector
- [ ] Flatten or tree-select asset nodes
- [ ] Fetch shifts (`GET /core/shifts`) → compute shift options dynamically
- [ ] Build date picker (default to 2026-06-23)
- [ ] Build "Show individual produces" toggle
- [ ] Build manual refresh button
- [ ] Wire filter changes to data refetch

### Phase 4: Timeline Chart (Hardest Part — Performance Graded) 🔲
- [ ] Create Canvas-based chart component
- [ ] Render segment bands (runtime/downtime/stoppage) with color coding
- [ ] Render produce markers (PASS = circle, FAIL = cross)
- [ ] Implement time-scaled X-axis with IST labels
- [ ] Implement Y-axis for cumulative production
- [ ] Implement zoom via brush selection (Shift+drag)
- [ ] Implement zoom reset (double-click)
- [ ] Implement hover tooltips on produce markers
- [ ] Pre-compute geometry (timestamps → pixels, colors resolved)
- [ ] Implement FAIL-preserving downsampling for 10k+ markers
- [ ] Memoize computed data with useMemo
- [ ] Performance test with real 10k–20k produce data
- [ ] Add chart legend (Runtime, Unplanned Production, Planned Downtime, etc.)

### Phase 5: Hourly Summary Table 🔲
- [ ] Create table component with MUI Table
- [ ] Generate per-hour columns from shift window (IST)
- [ ] Implement segment-to-hourly bucketing (cut at hour boundaries)
- [ ] Populate rows: Total, Pass, Fail, Runtime, Unplanned Production, Stoppage, Unknown Downtime
- [ ] Fetch cycle-time data (`POST /analytics-query`) → populate Ideal/Actual Cycle Time rows
- [ ] Handle null cycle-time values (blank cells)
- [ ] Handle in-progress shifts (empty future hours, not zero-filled)
- [ ] Verify per-hour minutes sum ≈ 60

### Phase 6: Error Handling & States 🔲
- [ ] Loading states for all data-fetching components
- [ ] Error states with retry buttons
- [ ] Empty state for shifts with no data
- [ ] In-progress shift state (partial data)
- [ ] 500 error retry with exponential backoff (1s, 2s delay)
- [ ] 403 access denied display
- [ ] 422 validation error display

### Phase 7: Polish & Deliverables 🔲
- [ ] Write NOTES.md with all required trade-off explanations
- [ ] Final UI polish and responsiveness
- [ ] .env.example with setup instructions
- [ ] README.md with run instructions
- [ ] Run `npm run build` — zero errors
- [ ] Deploy to Vercel or Netlify
- [ ] Final review against "Red flags" checklist

---

## Red Flags Checklist (Pre-Submission)
- [ ] Chart does NOT freeze with individual produces on
- [ ] Downsampling does NOT hide FAIL markers
- [ ] Timeline is NOT shifted by 5½ hours (UTC vs IST correct)
- [ ] Auth header is centralized (not ad-hoc per call)
- [ ] Page refresh does NOT log user out
- [ ] 401 is handled (session expiry redirects to login)
- [ ] Chart and table data AGREE
- [ ] Per-hour minutes ADD UP to ≈ 60
