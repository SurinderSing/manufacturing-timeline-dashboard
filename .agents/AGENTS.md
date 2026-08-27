# Workspace-Scoped Agent Rules (.agents/AGENTS.md)

This file configures Antigravity/Gemini workspace behaviors for the Manufacturing Timeline Dashboard project.

## Development Style
- **TypeScript First:** Ensure strict type checks. Explicitly define all return types on functions, hooks, API calls, and utility methods.
- **MUI v6 & Component System:** Align styling with MUI theming. Use the MUI theme provider and styled components. Do not write raw inline styles.
- **Component Separation:** Maintain clear separation between page-level components (`src/app/`), reusable UI components (`src/components/`), and business logic (`src/lib/`, `src/hooks/`).
- **Path Aliases:** Always write imports using absolute aliases (`@/components/...`, `@/lib/...`, `@/types/...`, `@/utils/...`, `@/api/...`, `@/hooks/...`). Never use relative imports like `../../components`.

## Constraints & Requirements
- **Keep Documentation Updated (Highest Priority):** Always keep all project documentation (`/docs/`, memory bank files, `NOTES.md`) up to date alongside any code modifications.
- **DRY & Centralized Reusable Utilities (High Priority):** Create shared utility functions, hooks, and helpers once in shared modules and reuse everywhere.
- **Single-Responsibility Component Design (High Priority):** Divide large components into focused subcomponents with distinct responsibilities.
- **Check for and Fix Errors/Warnings (High Priority):** Always run TypeScript compiler checks after completing work.
- **Prevent Deployment Failures (High Priority):** Always run `npm run build` before concluding any task.
- **Stay in Ask Mode first:** Research, create plan, get approval before editing codebase.
- **No Tests:** Do NOT create unit test suites or testing scripts.
- **No Out-of-Scope Features:** Do NOT build segment classification, auto-refresh, CSV/PDF export, i18n, multi-theme, or multi-machine views.

## API Client Architecture
- **`@/api/client`** (`apiClient`): Single Axios instance with base URL from `VITE_API_BASE_URL`, automatic `Authorization: Bearer <token>` header injection via request interceptor, and 401 response interceptor that clears session and redirects to `/login`.
- **`@/api/services/auth`**: Login, logout, and getMe service functions.
- **`@/api/services/assets`**: Asset tree fetching.
- **`@/api/services/shifts`**: Shift definitions fetching.
- **`@/api/services/analytics`**: Machine intervals and cycle-time queries.
- **Rule:** Never add auth headers manually in service functions — the Axios interceptor handles it.

## State Management Architecture
- **React Query (`@tanstack/react-query`)** for all server-state: API data fetching, caching, background refetching, and error/loading states.
- **React Context** for auth session state (token, user profile, login/logout actions).
- **Local component state** for UI-only concerns (filter selections, toggle states, zoom range).
- **Rule:** Justify this choice in `NOTES.md`.

## Timezone Architecture
- **All API timestamps** are UTC (`Z` suffix).
- **All UI timestamps** are IST (`Asia/Kolkata`, UTC+05:30).
- Centralize conversion in `@/lib/timezone.ts` using `date-fns` with `date-fns-tz` or manual offset.
- Shift window calculation: Build in IST (date + shift HH:MM), convert to UTC for API request.
- Display conversion: UTC response timestamps → IST for chart axes, tooltips, table headers.

## Memory Preservation
- Keep project documentation current. Always synchronize developments with `/memory-bank/` records.
