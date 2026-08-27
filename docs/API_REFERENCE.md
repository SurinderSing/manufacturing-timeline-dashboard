# API Reference — Manufacturing Timeline Dashboard

> **Base URL:** `https://fractaldmsdev.centralindia.cloudapp.azure.com`
> **No `/api` prefix.** Endpoints sit at the host root.
> **Data available for:** 22–25 June 2026.
> **All timestamps:** UTC.

---

## MES Envelope

Every response is wrapped:

```json
{
  "trace_id": "...",
  "status_code": 200,
  "message": "OK",
  "data": { ... }
}
```

- On success: use `data`.
- When `status_code >= 400`: surface `message` as the error.

---

## Endpoints

### 1. POST /auth/login

**Purpose:** Authenticate and receive a bearer token.

**Request:**
```json
{
  "username": "analytics_user",
  "password": "dashboard123"
}
```

**Response (`data`):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Error (401):**
```json
{
  "trace_id": "...",
  "status_code": 401,
  "message": "Invalid username or password",
  "data": null
}
```

---

### 2. GET /auth/me (Authenticated)

**Purpose:** Validate session, get current user profile.

**Response (`data`):**
```json
{
  "id": "a7c6c848-...",
  "username": "user",
  "name": "User",
  "email": "user@mail.com",
  "customer_id": "83d34607-...",
  "customer_name": "Noviga",
  "roles": ["SuperAdmin"],
  "status": "active"
}
```

---

### 3. POST /auth/logout (Authenticated)

**Purpose:** Invalidate the current session.

**Response (`data`):**
```json
{
  "message": "Logout successful"
}
```

---

### 4. GET /core/assets/tree (Authenticated)

**Purpose:** Fetch the asset hierarchy tree (machines/lines).

**Response (`data`):** Nested array. Each node has `id`, `name`, `codename`, `assetlevel_id`, `children[]`.

```json
[
  {
    "id": "83d34607-...",
    "name": "Noviga",
    "assetlevel_id": 50,
    "children": [
      {
        "id": "b95f2c1a-...",
        "name": "Noida",
        "assetlevel_id": 40,
        "children": [
          {
            "id": "283f3d3d-...",
            "name": "SMT Line 1",
            "codename": "LINE-01",
            "assetlevel_id": 20,
            "children": [
              {
                "id": "04f3a8b2-...",
                "name": "AOI",
                "codename": "AOI - 01",
                "assetlevel_id": 10,
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
]
```

Use selected node's `id` + `assetlevel_id` as `entity_scope.asset.asset_id` / `asset_level_id`.

---

### 5. GET /core/shifts (Authenticated)

**Purpose:** Fetch shift definitions.

**Response (`data`):**
```json
[
  {
    "id": "b4bb7e2d-...",
    "code": "main",
    "name": "main",
    "shift_timings": ["00:30", "12:30"],
    "is_active": true
  }
]
```

**`shift_timings`** is a list of shift **start times** in `HH:MM` local IST.
Each entry starts a shift that runs until the next entry. The last wraps to the first (crossing midnight).
Example: `["00:30", "12:30"]` → Two shifts: `00:30–12:30` and `12:30–00:30`.

**Do NOT hard-code shift names.**

---

### 6. POST /analytics-query/machine-intervals (Authenticated)

**Purpose:** Fetch timeline data (segments + produce counts + individual produces).

**Request:**
```json
{
  "entity_scope": {
    "type": "asset",
    "asset": {
      "asset_id": "283f3d3d-...",
      "asset_level_id": 20
    }
  },
  "time_range": {
    "from_ts": "2026-06-23T07:00:00Z",
    "to_ts": "2026-06-23T19:00:00Z"
  },
  "produce_counts": true,
  "exact_produces": false,
  "group_produce_counts_by_part_model": true
}
```

- `time_range` is **UTC** (convert IST shift window to UTC before sending).
- Set `exact_produces: true` only when "Show individual produces" is on (adds 10k–20k rows).

**Response (`data`):**
- `machine_ids`: Array of machine IDs.
- `runtimes[]`: `{ start_at, end_at, type, runtime_name }` — types: `"planned"`, `"unknown unplanned production"`.
- `downtimes[]`: `{ start_at, end_at, downtime_name, type }` — types: `"unknown"`, etc.
- `stoppages[]`: Same shape.
- `produce_counts[]`: `{ bucket_start, part_model_id, ok_count, ng_count }` — hourly, per part model.
- `produces[]` (only when `exact_produces: true`): `{ bucket_start, part_model_id, produces[] }` where each produce has `produce_id, first_seen_ts, result ("PASS"/"FAIL"), produce_type, part_model_id`.

**Segments are tiled and non-overlapping.** Backend fills gaps as `downtime` with `type: "unknown"`.

---

### 7. POST /analytics-query (Authenticated)

**Purpose:** Fetch hourly cycle-time metrics (Ideal / Actual Cycle Time).

**Request:**
```json
{
  "entity_scope": {
    "type": "asset",
    "asset": {
      "asset_id": "283f3d3d-...",
      "asset_level_id": 20
    }
  },
  "metrics": ["ideal_cycle_time_seconds", "actual_cycle_time_seconds"],
  "time_range": {
    "from_ts": "2026-06-23T07:00:00Z",
    "to_ts": "2026-06-23T19:00:00Z"
  },
  "distribution": "hourly"
}
```

**Response (`data`):** Array of hourly buckets:
```json
[
  {
    "bucket_start": "2026-06-23T07:00:00Z",
    "ideal_cycle_time_seconds": 307,
    "actual_cycle_time_seconds": 412.5
  }
]
```

Match each bucket to its hour by `bucket_start` (UTC → IST). Values can be `null` — render blank.
