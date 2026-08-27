export interface ShiftDefinition {
  id: string
  code: string
  name: string
  shift_timings: string[] // List of start times in "HH:MM" (local IST)
  is_active: boolean
}

export interface ShiftOption {
  id: string
  name: string
  code: string
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
  label: string // e.g. "Shift 1 (00:30 – 12:30)" or "Shift A (08:30 – 19:00)"
  crossesMidnight: boolean
}
