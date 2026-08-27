import type { SegmentKind } from '@/types'

export const CHART_COLORS = {
  runtime: '#149E8E', // Teal / Green
  unplannedProduction: '#B6D74B', // Lime / Olive-Yellow
  plannedDowntime: '#6E9C22', // Green / Break
  unplannedDowntime: '#FF6B57', // Coral / Salmon Red
  unknownDowntime: '#FF6B57', // Coral
  minorStoppage: '#5E54C7', // Purple-Blue
  passMarker: '#1E64DB', // Blue Circle
  failMarker: '#E02424', // Red Cross
  cumulativeLine: '#2563EB', // Blue line
  nowBadge: '#1D4ED8', // Navy Blue
  gridLine: '#E2E8F0',
  axisText: '#475569',
}

export function getSegmentColor(kind: SegmentKind, rawType?: string): string {
  const typeLower = (rawType || '').toLowerCase()

  if (typeLower.includes('tea break') || typeLower.includes('lunch break') || typeLower.includes('planned')) {
    if (kind === 'runtime') return CHART_COLORS.runtime
    return CHART_COLORS.plannedDowntime
  }

  if (typeLower.includes('unplanned production')) {
    return CHART_COLORS.unplannedProduction
  }

  switch (kind) {
    case 'runtime':
      return CHART_COLORS.runtime
    case 'unknown_unplanned_production':
      return CHART_COLORS.unplannedProduction
    case 'planned_downtime':
      return CHART_COLORS.plannedDowntime
    case 'unplanned_downtime':
    case 'unknown_downtime':
      return CHART_COLORS.unknownDowntime
    case 'minor_stoppage':
      return CHART_COLORS.minorStoppage
    default:
      return CHART_COLORS.runtime
  }
}
