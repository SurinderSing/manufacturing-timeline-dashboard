import type { ChartProducePoint, ProduceGroupBucket } from '@/types'
import { utcToISTDate } from '@/lib/timezone'

/**
 * Flattens nested produce buckets into a flat array of produce points sorted chronologically.
 */
export function flattenProduces(buckets: ProduceGroupBucket[]): ChartProducePoint[] {
  const points: ChartProducePoint[] = []

  for (const bucket of buckets) {
    if (!bucket.produces) continue
    for (const p of bucket.produces) {
      points.push({
        id: p.produce_id,
        timestampUTC: p.first_seen_ts,
        timestampIST: utcToISTDate(p.first_seen_ts),
        result: p.result,
        partModelId: p.part_model_id,
      })
    }
  }

  // Sort chronologically (API explicitly states first_seen_ts is not sorted)
  points.sort((a, b) => a.timestampIST.getTime() - b.timestampIST.getTime())

  // Assign cumulative production index
  for (let i = 0; i < points.length; i++) {
    points[i].cumulativeIndex = i + 1
  }

  return points
}

/**
 * Downsampling algorithm that PRESERVES ALL FAIL MARKERS.
 * When rendered on screen, 10k-20k markers can cause canvas overdraw.
 * We divide the visible time range into pixel-width bins:
 * - ALL FAIL markers are unconditionally preserved.
 * - PASS markers within the same pixel column bin are thinned to keep performance 60fps smooth.
 */
export function downsampleProduces(
  points: ChartProducePoint[],
  chartWidthPx: number,
  viewStartTimeMs: number,
  viewEndTimeMs: number,
  pixelBinSize: number = 2
): ChartProducePoint[] {
  if (points.length === 0 || chartWidthPx <= 0) return []

  const durationMs = viewEndTimeMs - viewStartTimeMs
  if (durationMs <= 0) return points

  const totalBins = Math.max(1, Math.floor(chartWidthPx / pixelBinSize))
  const passBins = new Set<number>()
  const result: ChartProducePoint[] = []

  for (let i = 0; i < points.length; i++) {
    const pt = points[i]
    const timeMs = pt.timestampIST.getTime()

    // Filter to visible viewport
    if (timeMs < viewStartTimeMs || timeMs > viewEndTimeMs) {
      continue
    }

    // 1. ALWAYS KEEP ALL FAIL MARKERS (Assignment Rule: Never drop a FAIL)
    if (pt.result === 'FAIL') {
      result.push(pt)
      continue
    }

    // 2. For PASS markers: thin by pixel bin
    const binIndex = Math.floor(
      ((timeMs - viewStartTimeMs) / durationMs) * totalBins
    )

    if (!passBins.has(binIndex)) {
      passBins.add(binIndex)
      result.push(pt)
    }
  }

  return result
}
