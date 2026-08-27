# Product Requirements Document (PRD) — Manufacturing Timeline Dashboard

## Product Vision & Objectives
This is a **Senior Frontend Engineering assessment** — a React application that demonstrates competence in authentication flow, real-time data visualization with high-performance charting, and timezone-aware data processing. The app connects to a live manufacturing backend to display an interactive timeline chart and hourly production & downtime summary for a single machine on a single shift.

## Target Users
- **Assessment evaluators** reviewing code quality, architecture, and performance decisions.
- **Manufacturing operators** (simulated) who would use this dashboard to monitor machine production, spot downtime, and identify failed parts.

## Feature Inventory

| Feature | Description | Priority | Graded? |
|:---|:---|:---|:---|
| **Login Screen** | Username + password form with validation, loading state, and inline error display on 401. | P0 — Required | ✅ Yes |
| **Session Management** | Token storage, restore-on-refresh, centralized API auth header, 401 interception. | P0 — Required | ✅ Yes (graded trade-off) |
| **Protected Routes** | Dashboard only accessible with valid session; unauthenticated users redirect to `/login`. | P0 — Required | ✅ Yes |
| **Logout** | Calls `POST /auth/logout`, clears token, redirects to `/login`. | P0 — Required | ✅ Yes |
| **Filter Bar** | Machine selector (from asset tree), shift selector (from shifts API), date picker, "Show individual produces" toggle, manual refresh button. | P0 — Required | ✅ Yes |
| **Timeline Chart** | Horizontal time-scaled view with colored segment bands (runtime/downtime/stoppage), produce markers (PASS/FAIL), zoom, and hover tooltips. | P0 — Hardest Part | ✅ Yes (performance graded) |
| **Hourly Summary Table** | Per-hour columns with rows for Total/Pass/Fail/Runtime/Unplanned Production/Stoppage/Unknown Downtime/Ideal Cycle Time/Actual Cycle Time. | P0 — Core of Part 2 | ✅ Yes |
| **Error Handling** | 401 redirect, 403 access denied, 422 validation errors, 500 retry with backoff. | P0 — Required | ✅ Yes |
| **Empty & Loading States** | Explicit handling for loading, error, empty data, and in-progress shifts. | P0 — Required | ✅ Yes |

## Out of Scope (Explicitly Forbidden)
- ❌ Segment classification dialogs / create-downtime flows
- ❌ Auto-refresh / polling (manual refresh only)
- ❌ CSV / PDF export
- ❌ i18n, multi-theme support, or settings area
- ❌ Full asset-hierarchy drill-down or multi-machine views
- ❌ Unit / integration tests

## Key Performance Requirements
- **Chart must stay interactive at 10,000–20,000 markers** with "Show individual produces" ON.
- **Never drop FAIL markers** during any downsampling/thinning.
- **No per-marker date parsing or colour lookups** inside the render path.
- **Smooth zoom and hover** — no multi-second freezes.

## Timezone Requirements
- API speaks **UTC**; UI speaks **IST (Asia/Kolkata, +05:30)**.
- Shift window: build in IST → convert to UTC for API request.
- Display: convert UTC response timestamps → IST for axis ticks, tooltips, table headers.

## Data Availability
- **Date range:** 22–25 June 2026
- **Backend URL:** `https://fractaldmsdev.centralindia.cloudapp.azure.com`
- **Credentials:** `analytics_user` / `dashboard123`

## Assessment Deliverables
1. Git repository with clean code
2. Deployed link (Netlify/Vercel)
3. `NOTES.md` documenting:
   - Token storage decision and trade-offs
   - Chart performance strategy
   - Timezone handling approach
   - Assumptions and scope cuts
4. Setup instructions (`npm install`, env var, `npm run dev`)
