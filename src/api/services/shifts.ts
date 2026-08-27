import { apiClient } from '@/api/client'
import type { ApiResponse, ShiftDefinition, ShiftOption } from '@/types'

export async function getShiftsApi(): Promise<ShiftDefinition[]> {
  const response = await apiClient.get<ApiResponse<ShiftDefinition[]>>('/core/shifts')
  return response.data.data
}

/**
 * Parses shift definitions into concrete selectable shift options with start/end times.
 * In the backend, shift_timings is a list of shift START times in "HH:MM" (IST).
 * Each entry runs until the next entry, and the last wraps around to the first.
 * e.g. ["00:30", "12:30"] => Shift 1 (00:30 - 12:30) and Shift 2 (12:30 - 00:30).
 */
export function parseShiftOptions(shifts: ShiftDefinition[]): ShiftOption[] {
  const options: ShiftOption[] = []

  for (const shift of shifts) {
    if (!shift.is_active || !shift.shift_timings || shift.shift_timings.length === 0) {
      continue
    }

    const timings = shift.shift_timings

    for (let i = 0; i < timings.length; i++) {
      const startTime = timings[i]
      const nextIndex = (i + 1) % timings.length
      const endTime = timings[nextIndex]

      const [startH, startM] = startTime.split(':').map(Number)
      const [endH, endM] = endTime.split(':').map(Number)
      const crossesMidnight = endH < startH || (endH === startH && endM <= startM)

      const shiftLetter = String.fromCharCode(65 + i) // 'A', 'B', 'C'
      const shiftName =
        timings.length === 1
          ? shift.name
          : `Shift ${shiftLetter} (${startTime} – ${endTime})`

      options.push({
        id: `${shift.id}-${i}`,
        name: shift.name,
        code: shift.code,
        startTime,
        endTime,
        label: shiftName,
        crossesMidnight,
      })
    }
  }

  return options
}
