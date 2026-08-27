# Memory Bank - Technical Context

## Tech Stack Dependencies

The application runs on the following dependencies (from `package.json`):
- **Core:** `react: ^18`, `react-dom: ^18`, `typescript: ^5`
- **Build Tool:** `vite: ^6`
- **UI Library:** `@mui/material: ^6` (MUI v6, assignment mandated), `@emotion/react`, `@emotion/styled`
- **Icons:** `@mui/icons-material: ^6`
- **Routing:** `react-router-dom: ^7`
- **Server State:** `@tanstack/react-query: ^5`
- **HTTP Client:** `axios: ^1`
- **Date/Time:** `date-fns: ^4`

---

## Environment Variables Configuration

The following variable must be configured in `.env` or `.env.local`:

```bash
# Backend API Base URL (no /api prefix, no trailing slash)
VITE_API_BASE_URL=https://fractaldmsdev.centralindia.cloudapp.azure.com
```

---

## Tooling & Dev Commands

- **Local Server:** `npm run dev`
- **Production Build:** `npm run build`
- **Preview Build:** `npm run preview`

---

## Key Architecture Patterns

### API Client (Axios)
- Single instance in `@/api/client.ts`
- Request interceptor: attaches `Authorization: Bearer <token>` from `localStorage`
- Response interceptor: catches 401 → clears token → redirects to `/login`
- MES envelope unwrapping in service functions

### State Management
- React Query for all server-state (caching, loading/error, background refetch)
- React Context for auth session state
- Component state for UI-only concerns

### Timezone
- All API timestamps: UTC
- All UI timestamps: IST (Asia/Kolkata, +05:30)
- Central conversion module: `@/lib/timezone.ts`
- date-fns for formatting

### Chart Rendering
- Canvas-based (not SVG) for performance at 10k+ markers
- Pre-computed geometry (timestamp → pixel position)
- FAIL-preserving downsampling
- Memoized with `useMemo`
