import type {
  MachineIntervalsData,
  HourlyCycleTimeBucket,
  HourlyBucketSummary,
  UnifiedSegment,
  SegmentKind,
} from '@/types'
import {
  utcToISTDate,
  isISTFuture,
  type ISTHourSlot,
} from '@/lib/timezone'

/**
 * Transforms raw runtime, downtime, and stoppage arrays into a unified list of visual segments.
 */
export function normalizeSegments(data: MachineIntervalsData): UnifiedSegment[] {
  const segments: UnifiedSegment[] = []

  // 1. Runtimes
  data.runtimes?.forEach((rt, idx) => {
    const isUnplanned = (rt.type || '').toLowerCase().includes('unplanned')
    const kind: SegmentKind = isUnplanned ? 'unknown_unplanned_production' : 'runtime'
    const label = isUnplanned ? 'UNPLANNED PROD' : rt.runtime_name || 'RUNTIME'

    segments.push({
      id: `rt-${idx}`,
      startAtUTC: rt.start_at,
      endAtUTC: rt.end_at,
      startAtIST: utcToISTDate(rt.start_at),
      endAtIST: utcToISTDate(rt.end_at),
      kind,
      label,
      rawType: rt.type,
    })
  })

  // 2. Downtimes
  data.downtimes?.forEach((dt, idx) => {
    const typeLower = (dt.type || '').toLowerCase()
    const nameLower = (dt.downtime_name || '').toLowerCase()

    let kind: SegmentKind = 'unknown_downtime'
    let label = dt.downtime_name || 'UNKNOWN'

    if (
      typeLower.includes('tea break') ||
      nameLower.includes('tea break') ||
      typeLower.includes('lunch break') ||
      nameLower.includes('lunch break') ||
      typeLower.includes('planned')
    ) {
      kind = 'planned_downtime'
      label = dt.downtime_name || 'BREAK'
    } else if (typeLower.includes('unplanned')) {
      kind = 'unplanned_downtime'
      label = dt.downtime_name || 'UNPLANNED'
    }

    segments.push({
      id: `dt-${idx}`,
      startAtUTC: dt.start_at,
      endAtUTC: dt.end_at,
      startAtIST: utcToISTDate(dt.start_at),
      endAtIST: utcToISTDate(dt.end_at),
      kind,
      label,
      rawType: dt.type,
    })
  })

  // 3. Stoppages
  data.stoppages?.forEach((st, idx) => {
    segments.push({
      id: `st-${idx}`,
      startAtUTC: st.start_at,
      endAtUTC: st.end_at,
      startAtIST: utcToISTDate(st.start_at),
      endAtIST: utcToISTDate(st.end_at),
      kind: 'minor_stoppage',
      label: st.stoppage_name || 'STOPPAGE',
      rawType: st.type || 'stoppage',
    })
  })

  // Sort segments by start time
  segments.sort((a, b) => a.startAtIST.getTime() - b.startAtIST.getTime())

  return segments
}

/**
 * Computes the minutes overlap between a segment [segStart, segEnd] and an hour bucket [bucketStart, bucketEnd].
 */
function getOverlapMinutes(
  segStart: Date,
  segEnd: Date,
  bucketStart: Date,
  bucketEnd: Date
): number {
  const start = Math.max(segStart.getTime(), bucketStart.getTime())
  const end = Math.min(segEnd.getTime(), bucketEnd.getTime())

  if (end <= start) return 0
  return (end - start) / (1000 * 60)
}

/**
 * Buckets segments, produce counts, and cycle times into the hourly summary table structure.
 */
export function computeHourlySummaries(
  hourSlots: ISTHourSlot[],
  data: MachineIntervalsData | null | undefined,
  cycleTimes: HourlyCycleTimeBucket[] | null | undefined
): HourlyBucketSummary[] {
  if (!hourSlots || hourSlots.length === 0) return []

  const segments = data ? normalizeSegments(data) : []
  const produceCounts = data?.produce_counts || []

  return hourSlots.map((slot) => {
    const isFuture = isISTFuture(slot.start)

    if (isFuture) {
      return {
        hourLabel: slot.label,
        startIST: slot.start,
        endIST: slot.end,
        isFuture: true,
        total: null,
        pass: null,
        fail: null,
        runtimeMinutes: null,
        unplannedProductionMinutes: null,
        stoppageMinutes: null,
        unknownDowntimeMinutes: null,
        plannedDowntimeMinutes: null,
        idealCycleTimeSeconds: null,
        actualCycleTimeSeconds: null,
      }
    }

    // 1. Calculate durations for each kind from intersecting segments
    let runtimeMinutes = 0
    let unplannedProductionMinutes = 0
    let stoppageMinutes = 0
    let unknownDowntimeMinutes = 0
    let plannedDowntimeMinutes = 0

    for (const seg of segments) {
      const overlap = getOverlapMinutes(
        seg.startAtIST,
        seg.endAtIST,
        slot.start,
        slot.end
      )
      if (overlap <= 0) continue

      switch (seg.kind) {
        case 'runtime':
          runtimeMinutes += overlap
          break
        case 'unknown_unplanned_production':
          unplannedProductionMinutes += overlap
          break
        case 'minor_stoppage':
          stoppageMinutes += overlap
          break
        case 'unknown_downtime':
        case 'unplanned_downtime':
          unknownDowntimeMinutes += overlap
          break
        case 'planned_downtime':
          plannedDowntimeMinutes += overlap
          break
      }
    }

    // 2. Aggregate produce counts (sum across part models for matching bucket_start)
    let passCount = 0
    let failCount = 0
    let hasProduceData = false

    for (const pc of produceCounts) {
      const pcStartIST = utcToISTDate(pc.bucket_start)
      // Check if this produce bucket falls within the current hour slot
      const pcTime = pcStartIST.getTime()
      if (pcTime >= slot.start.getTime() && pcTime < slot.end.getTime()) {
        passCount += pc.ok_count || 0
        failCount += pc.ng_count || 0
        hasProduceData = true
      }
    }

    // 3. Match cycle times (hourly distribution)
    let idealCycleTime: number | null = null
    let actualCycleTime: number | null = null

    if (cycleTimes && cycleTimes.length > 0) {
      for (const ct of cycleTimes) {
        const ctStartIST = utcToISTDate(ct.bucket_start)
        const ctTime = ctStartIST.getTime()
        if (ctTime >= slot.start.getTime() && ctTime < slot.end.getTime()) {
          idealCycleTime = ct.ideal_cycle_time_seconds ?? null
          actualCycleTime = ct.actual_cycle_time_seconds ?? null
          break
        }
      }
    }

    return {
      hourLabel: slot.label,
      startIST: slot.start,
      endIST: slot.end,
      isFuture: false,
      total: hasProduceData ? passCount + failCount : (passCount + failCount > 0 ? passCount + failCount : 0),
      pass: passCount,
      fail: failCount,
      runtimeMinutes: Math.round(runtimeMinutes * 10) / 10,
      unplannedProductionMinutes: Math.round(unplannedProductionMinutes * 10) / 10,
      stoppageMinutes: Math.round(stoppageMinutes * 10) / 10,
      unknownDowntimeMinutes: Math.round(unknownDowntimeMinutes * 10) / 10,
      plannedDowntimeMinutes: Math.round(plannedDowntimeMinutes * 10) / 10,
      idealCycleTimeSeconds: idealCycleTime,
      actualCycleTimeSeconds: actualCycleTime,
    }
  })
}
