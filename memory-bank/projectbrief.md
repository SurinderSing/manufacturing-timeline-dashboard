# Memory Bank - Project Brief

## Project Overview
**Manufacturing Timeline Dashboard** — A React SPA built as a Senior Frontend Engineering assessment. The application connects to a real manufacturing backend (Fractal DMS) to authenticate users, display interactive timeline charts for machine production/downtime, and present hourly production summaries.

## Core Requirements
1. **Authentication:** Login form, token-based sessions (localStorage), protected routes, centralized API auth, 401 handling, logout.
2. **Timeline Chart:** Canvas-based horizontal time chart with colored segment bands (runtime/downtime/stoppage) and produce markers (PASS/FAIL). Must handle 10k–20k markers with smooth zoom and hover.
3. **Hourly Summary Table:** Per-hour columns with rows for Total/Pass/Fail/Runtime/Unplanned Production/Stoppage/Unknown Downtime/Ideal Cycle Time/Actual Cycle Time.
4. **Filter Bar:** Machine selector (asset tree), shift selector (dynamic), date picker, "Show individual produces" toggle, manual refresh.
5. **Timezone:** UTC ↔ IST conversion throughout.
6. **Error Handling:** 401/403/422/500 with retry logic.

## Success Criteria
- Chart stays interactive at 10k–20k markers (no frame drops)
- FAIL markers never hidden during downsampling
- Timestamps display correctly in IST (not shifted by 5.5h)
- Auth token centralized in one API client
- Session persists across page refreshes
- Chart and table data agree
- Per-hour minutes approximately sum to 60

## Timeline
1 week total. Priority: chart performance > feature completeness.
