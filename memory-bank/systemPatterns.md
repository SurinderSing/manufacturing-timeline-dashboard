# Memory Bank - System Patterns

## Architecture Pattern: Feature-Based SPA

```
src/
├── api/              # Centralized API layer
│   ├── client.ts     # Axios instance + interceptors
│   └── services/     # Service functions per domain
│       ├── auth.ts
│       ├── assets.ts
│       ├── shifts.ts
│       └── analytics.ts
├── app/              # Route page components
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── components/       # Reusable UI components
│   ├── auth/         # AuthProvider, ProtectedRoute
│   ├── dashboard/    # FilterBar, TimelineChart, HourlyTable
│   ├── layout/       # AppShell, Header
│   └── common/       # Loading, Error, Empty states
├── hooks/            # Custom React hooks
│   ├── useAuth.ts
│   ├── useAssets.ts
│   ├── useShifts.ts
│   └── useTimeline.ts
├── lib/              # Business logic
│   ├── timezone.ts   # UTC ↔ IST conversion
│   ├── bucketing.ts  # Segment → hourly bucketing
│   └── downsampling.ts # FAIL-preserving marker thinning
├── types/            # TypeScript interfaces
│   ├── api.ts        # API response types
│   ├── auth.ts       # Auth types
│   ├── assets.ts     # Asset tree types
│   ├── shifts.ts     # Shift types
│   └── analytics.ts  # Timeline + cycle-time types
└── utils/            # General utilities
    ├── colors.ts     # Segment color mapping
    └── format.ts     # Display formatting
```

## Key Patterns

### API Client Pattern
Single Axios instance with interceptors for auth and error handling. Service functions unwrap the MES envelope and return typed `data`.

### Context + Hook Pattern
`AuthProvider` wraps the app with auth state. `useAuth()` hook exposes `user`, `token`, `login()`, `logout()`, `isAuthenticated`.

### React Query Pattern
Each API domain has a custom hook:
- `useAssets()` → `GET /core/assets/tree`
- `useShifts()` → `GET /core/shifts`
- `useTimeline(filters)` → `POST /analytics-query/machine-intervals`
- `useCycleTime(filters)` → `POST /analytics-query`

### Canvas Chart Pattern
`<canvas>` element with imperative drawing. Pre-computed geometry stored in a `useMemo` array. Zoom state in component state. Mouse events mapped to data coordinates via inverse scaling.

### Timezone Pattern
All conversion centralized in `@/lib/timezone.ts`. Never call `new Date()` without explicit timezone handling. IST offset = +05:30 = +330 minutes.

### Bucketing Pattern
Segments cut at IST hour boundaries. Each piece's duration added to its hour's row, keeping kinds separate. `@/lib/bucketing.ts` takes an array of segments + an IST hour grid and returns a map of `{ hour → { runtime, unplanned, stoppage, unknown } }`.
