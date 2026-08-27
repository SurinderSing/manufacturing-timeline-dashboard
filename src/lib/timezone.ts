import { format, parseISO, addDays, isAfter } from 'date-fns'

// IST offset in milliseconds (+05:30 = 5.5 * 60 * 60 * 1000 = 19,800,000 ms)
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/**
 * Converts a UTC ISO string or Date to an IST Date representation.
 * Since standard JS Date methods like getHours() use local browser timezone,
 * this returns a Date object shifted so that getUTC* methods (or formatted explicitly) reflect IST.
 */
export function utcToISTDate(utcInput: string | Date): Date {
  const utcDate = typeof utcInput === 'string' ? parseISO(utcInput) : utcInput
  return new Date(utcDate.getTime() + IST_OFFSET_MS)
}

/**
 * Formats a UTC ISO timestamp or Date into an IST string representation.
 */
export function formatToIST(
  utcInput: string | Date | null | undefined,
  formatPattern: string = 'HH:mm'
): string {
  if (!utcInput) return '-'
  const istDate = utcToISTDate(utcInput)
  // Format using UTC methods on the IST-shifted Date
  return format(
    new Date(istDate.getTime() + istDate.getTimezoneOffset() * 60000),
    formatPattern
  )
}

/**
 * Formats a Date object representing an IST time directly.
 */
export function formatISTTime(date: Date, pattern: string = 'HH:mm'): string {
  return format(date, pattern)
}

/**
 * Builds a UTC { from_ts, to_ts } range given an IST date string (YYYY-MM-DD),
 * a shift start time (HH:mm), and a shift end time (HH:mm).
 *
 * Example:
 * dateStr = "2026-06-23", start = "00:30", end = "12:30"
 * IST Start: 2026-06-23T00:30:00+05:30 -> UTC: 2026-06-22T19:00:00Z
 * IST End:   2026-06-23T12:30:00+05:30 -> UTC: 2026-06-23T07:00:00Z
 */
export function buildShiftWindowUTC(
  dateStr: string, // "YYYY-MM-DD"
  startTimeHHMM: string, // "HH:MM"
  endTimeHHMM: string // "HH:MM"
): { from_ts: string; to_ts: string; startIST: Date; endIST: Date } {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [startH, startM] = startTimeHHMM.split(':').map(Number)
  const [endH, endM] = endTimeHHMM.split(':').map(Number)

  // Construct start date in UTC as if it were IST (by creating UTC date and subtracting IST offset)
  // Month is 0-indexed in Date constructor
  const istStartUtcTimestamp =
    Date.UTC(year, month - 1, day, startH, startM, 0) - IST_OFFSET_MS
  const startIST = new Date(istStartUtcTimestamp + IST_OFFSET_MS)

  let istEndUtcTimestamp: number
  if (endH < startH || (endH === startH && endM <= startM)) {
    // Crosses midnight: end time is on next day
    const nextDay = addDays(new Date(year, month - 1, day), 1)
    istEndUtcTimestamp =
      Date.UTC(
        nextDay.getFullYear(),
        nextDay.getMonth(),
        nextDay.getDate(),
        endH,
        endM,
        0
      ) - IST_OFFSET_MS
  } else {
    istEndUtcTimestamp =
      Date.UTC(year, month - 1, day, endH, endM, 0) - IST_OFFSET_MS
  }
  const endIST = new Date(istEndUtcTimestamp + IST_OFFSET_MS)

  return {
    from_ts: new Date(istStartUtcTimestamp).toISOString(),
    to_ts: new Date(istEndUtcTimestamp).toISOString(),
    startIST,
    endIST,
  }
}

/**
 * Checks if a given IST date is in the future compared to current IST time.
 */
export function isISTFuture(targetISTDate: Date): boolean {
  const currentUTC = new Date()
  const currentIST = new Date(currentUTC.getTime() + IST_OFFSET_MS)
  return isAfter(targetISTDate, currentIST)
}

/**
 * Generates hourly boundaries between two IST dates.
 * Returns an array of hourly intervals: [{ start, end, label }]
 */
export interface ISTHourSlot {
  start: Date
  end: Date
  label: string // "08:30 - 09:30"
  utcStartISO: string
  utcEndISO: string
}

export function generateISTHourSlots(
  startIST: Date,
  endIST: Date
): ISTHourSlot[] {
  const slots: ISTHourSlot[] = []
  let cursor = new Date(startIST.getTime())

  while (cursor.getTime() < endIST.getTime()) {
    const nextHour = new Date(
      Math.min(cursor.getTime() + 60 * 60 * 1000, endIST.getTime())
    )

    const startLabel = format(cursor, 'HH:mm')
    const endLabel = format(nextHour, 'HH:mm')

    // Corresponding UTC timestamps for matching API buckets
    const utcStartISO = new Date(cursor.getTime() - IST_OFFSET_MS).toISOString()
    const utcEndISO = new Date(
      nextHour.getTime() - IST_OFFSET_MS
    ).toISOString()

    slots.push({
      start: new Date(cursor),
      end: new Date(nextHour),
      label: `${startLabel} - ${endLabel}`,
      utcStartISO,
      utcEndISO,
    })

    cursor = nextHour
  }

  return slots
}
