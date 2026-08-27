# Assessment Notes & Design Decisions

This document details the architectural decisions, performance trade-offs, and timezone conversion strategies implemented for the **Manufacturing Timeline Dashboard** assessment.

---

## 1. Authentication & Session Management

### Token Storage Decision: `localStorage`
The backend returns the access token inside the JSON login response body (`{ "access_token": "...", "token_type": "bearer" }`) rather than issuing an `HttpOnly` cookie via the `Set-Cookie` response header.

We evaluated four storage strategies:

1. **`localStorage` (Selected Strategy):**
   - **Pros:** Persists across page reloads and across multiple browser tabs/windows. When an operator opens new tabs to inspect different machines or shifts, their active authenticated session remains unbroken.
   - **Cons:** Accessible by client-side JavaScript, which introduces XSS vulnerability if untrusted scripts run.
   - **Mitigation:** We implement strict input sanitization, avoid `dangerouslySetInnerHTML`, and use automated 401 interception to instantly flush tokens upon invalidation.

2. **`sessionStorage`:**
   - **Pros:** Automatically cleared when the browser tab closes.
   - **Cons:** Token is isolated to a single tab. Opening a new tab forces the user to log in again, creating poor user experience for plant operators.

3. **Client-side Cookie (`document.cookie`):**
   - **Pros:** Can set domain/path and max-age expiration.
   - **Cons:** A common misconception is that cookies are inherently safer than `localStorage`. The critical distinction is between **`HttpOnly` server-set cookies** (which JavaScript cannot access at all, providing true XSS protection) and **client-set cookies** (created via `document.cookie` in JS). Since this backend returns the token in the JSON body rather than via a `Set-Cookie: HttpOnly` response header, we would have to store it via `document.cookie` — which is **equally readable by any XSS-injected script** as `localStorage.getItem()`. Therefore, client-set cookies provide **zero additional security** over `localStorage` in this architecture, while offering a less ergonomic API.
   - **When cookies WOULD be the right choice:** If the backend issued the token as an `HttpOnly; Secure; SameSite=Strict` cookie via the `Set-Cookie` header, and attached it automatically to requests, that would be the gold-standard approach — but that's a server-side architectural decision outside our control.

4. **In-Memory (React state / closure variable):**
   - **Pros:** Safest against XSS (not accessible via storage APIs).
   - **Cons:** Any page refresh (F5) or browser restart immediately wipes the token and logs the user out. For an operational industrial dashboard, losing state on refresh is unacceptable.

### Session Restore & 401 Interception
- **On App Load:** The `AuthProvider` retrieves the stored token and calls `GET /auth/me` to validate its freshness and retrieve the user profile (`roles`, `customer_name`, `email`).
- **Centralized Axios Interceptor:** Every request automatically attaches `Authorization: Bearer <token>` through a central request interceptor in `src/api/client.ts`.
- **401 Handling:** If any authenticated endpoint returns HTTP 401, the response interceptor clears the token from `localStorage`, sets `user = null`, and triggers a clean redirect to `/login`. (The `/auth/login` endpoint is exempted from auto-redirect so it can display inline credential errors).
- **500 Retry Logic:** On HTTP 500 errors, the Axios interceptor automatically retries up to 2 times with exponential backoff (1s, 2s) before surfacing an error state.

---

## 2. Interactive Timeline Chart Performance Strategy

The timeline chart is the most critical and performance-sensitive component. When the **"Show individual produces"** toggle is enabled, the backend returns **10,000 to 20,000 produce records**.

### Rendering Approach: HTML5 Canvas vs. SVG
- **Why Canvas over SVG/DOM:**
  - Rendering 20,000 SVG DOM elements (`<circle>`, `<path>`) causes substantial memory overhead, style recalculation bottlenecks, and frame drops during zoom/pan.
  - A single `<canvas>` element draws tens of thousands of points imperatively in a single GPU-accelerated rasterization pass, maintaining **60 FPS** interactions.

### The FAIL-Preserving Downsampling Algorithm
> **Core Assessment Rule:** *If you thin/downsample markers, never drop a FAIL marker.*

Our custom downsampling algorithm (`src/lib/downsampling.ts`):
1. **Unconditional Preservation of Defects:** All points where `result === 'FAIL'` are ALWAYS added to the render queue regardless of zoom level or density.
2. **Pixel-Bin Thinning for PASS Markers:** The visible time span is divided into discrete pixel column bins (e.g., 2px wide). Only one representative PASS marker is drawn per pixel bin, eliminating redundant pixel overdraw while maintaining continuous trend density.
3. **Geometry Pre-computation:** Coordinate conversions (`timeToX`, `countToY`) and color resolutions are calculated once outside render loops, never per-frame.
4. **HiDPI Scaling:** Canvas resolutions adapt to `window.devicePixelRatio` for razor-sharp rendering on Retina/4K displays.

### Zoom & Hover Tooltip
- **Brush Zoom:** Drag or Shift+drag across the canvas to select any time span.
- **Instant Reset:** Double-click anywhere on the canvas to reset back to the full shift window.
- **Dynamic HTML Tooltip:** Hovering detects nearby produce markers or segment bands, displaying timestamps in IST, part model IDs, and status without expensive canvas re-renders.

---

## 3. Timezone Handling (UTC ↔ IST)

### The 5½ Hour Offset (`Asia/Kolkata`, UTC +05:30)
- **API Timestamp Convention:** All request inputs and response outputs from the backend use UTC ISO-8601 strings (e.g. `2026-06-23T07:00:00Z`).
- **UI Display Convention:** All times displayed to operators (axis ticks, shift selectors, tooltips, hourly summary columns) are strictly formatted in **IST (+05:30)**.

### Shift Window Calculation (`src/lib/timezone.ts`)
1. User selects a date (e.g. `2026-06-23`) and a shift (e.g. `00:30 – 12:30` IST).
2. The shift window is constructed in IST:
   - Start IST: `2026-06-23 00:30:00 +05:30` → Converted to UTC: `2026-06-22T19:00:00Z`
   - End IST: `2026-06-23 12:30:00 +05:30` → Converted to UTC: `2026-06-23T07:00:00Z`
3. Cross-midnight shifts (e.g. `12:30 – 00:30`) automatically increment the end date to the next calendar day.
4. Response timestamps are converted from UTC to IST on ingestion.

---

## 4. Hourly Production & Downtime Bucketing

In `src/lib/bucketing.ts`, we implement hourly summary bucketing:
1. **Segment Cutting:** Segments from `runtimes`, `downtimes`, and `stoppages` are sliced across IST clock hour boundaries (e.g., `08:30–09:30`, `09:30–10:30`). The exact minutes of overlap are added to the corresponding category (Runtime, Unplanned Production, Planned Downtime, Minor Stoppage, Unknown Downtime).
2. **Sanity Check:** For each fully elapsed hour, `Runtime + Unplanned + Stoppage + Unknown Downtime ≈ 60 mins`.
3. **Cycle Time Matching:** Ideal and Actual cycle times from `POST /analytics-query` are matched to each hour bucket by `bucket_start`. Hours with null data render blank.
4. **In-Progress Shift Guard:** Future hours relative to current IST time are kept empty rather than zero-filled.

---

## 5. Scope & Assumptions

- **Dynamic Shifts:** Shifts are dynamically computed from `GET /core/shifts` without hardcoding shift names or counts.
- **Machine Selection:** The asset tree from `GET /core/assets/tree` is flattened with hierarchical breadcrumbs for intuitive single-machine filtering.
- **Out-of-Scope Items Respected:** In accordance with the assessment brief, we excluded segment reclassification dialogs, auto-polling, and multi-theme complexity to focus on chart performance, timezone accuracy, and clean architecture.
