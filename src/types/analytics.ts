export type RuntimeType = 'planned' | 'unknown unplanned production' | string
export type DowntimeType = 'unknown' | 'tea break' | 'lunch break' | 'maintenance' | string
export type ProduceResult = 'PASS' | 'FAIL'
export type ProduceType = 'FIRST' | string

export interface EntityScope {
  type: 'asset'
  asset: {
    asset_id: string
    asset_level_id: number
  }
}

export interface TimeRangeUTC {
  from_ts: string // ISO 8601 UTC string (e.g. "2026-06-23T07:00:00Z")
  to_ts: string // ISO 8601 UTC string (e.g. "2026-06-23T19:00:00Z")
}

export interface MachineIntervalsRequest {
  entity_scope: EntityScope
  time_range: TimeRangeUTC
  produce_counts: boolean
  exact_produces: boolean
  group_produce_counts_by_part_model: boolean
}

export interface RuntimeSegment {
  start_at: string // UTC
  end_at: string // UTC
  type: RuntimeType
  runtime_name: string | null
}

export interface DowntimeSegment {
  start_at: string // UTC
  end_at: string // UTC
  type: DowntimeType
  downtime_name: string | null
}

export interface StoppageSegment {
  start_at: string // UTC
  end_at: string // UTC
  type?: string
  stoppage_name?: string | null
}

export interface ProduceCountBucket {
  bucket_start: string // UTC hour start
  part_model_id: string
  ok_count: number
  ng_count: number
}

export interface IndividualProduce {
  produce_id: string
  first_seen_ts: string // UTC timestamp
  result: ProduceResult
  produce_type: ProduceType
  part_model_id: string
}

export interface ProduceGroupBucket {
  bucket_start: string // UTC
  part_model_id: string
  produces: IndividualProduce[]
}

export interface MachineIntervalsData {
  machine_ids: number[]
  runtimes: RuntimeSegment[]
  downtimes: DowntimeSegment[]
  stoppages: StoppageSegment[]
  produce_counts: ProduceCountBucket[]
  produces?: ProduceGroupBucket[]
}

export interface CycleTimeRequest {
  entity_scope: EntityScope
  metrics: string[]
  time_range: TimeRangeUTC
  distribution: 'hourly'
}

export interface HourlyCycleTimeBucket {
  entity_type?: string
  entity_id?: string
  parent_entity?: string | null
  asset_level_id?: number
  bucket_start: string // UTC
  ideal_cycle_time_seconds: number | null
  actual_cycle_time_seconds: number | null
  [key: string]: unknown
}

// Visual Chart Timeline Segment
export type SegmentKind =
  | 'runtime'
  | 'unknown_unplanned_production'
  | 'planned_downtime'
  | 'unplanned_downtime'
  | 'minor_stoppage'
  | 'unknown_downtime'

export interface UnifiedSegment {
  id: string
  startAtUTC: string
  endAtUTC: string
  startAtIST: Date
  endAtIST: Date
  kind: SegmentKind
  label: string
  rawType: string
}

// Processed Produce Point for Chart
export interface ChartProducePoint {
  id: string
  timestampUTC: string
  timestampIST: Date
  result: ProduceResult
  partModelId: string
  cumulativeIndex?: number
}

// Hourly summary row metrics
export interface HourlyBucketSummary {
  hourLabel: string // "08:30 - 09:30"
  startIST: Date
  endIST: Date
  isFuture: boolean
  total: number | null
  pass: number | null
  fail: number | null
  runtimeMinutes: number | null
  unplannedProductionMinutes: number | null
  stoppageMinutes: number | null
  unknownDowntimeMinutes: number | null
  plannedDowntimeMinutes: number | null
  idealCycleTimeSeconds: number | null
  actualCycleTimeSeconds: number | null
}
