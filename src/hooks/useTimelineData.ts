import { useQuery } from '@tanstack/react-query'
import {
  getMachineIntervalsApi,
  getCycleTimeMetricsApi,
} from '@/api/services/analytics'
import type {
  MachineIntervalsData,
  HourlyCycleTimeBucket,
  FlatAssetOption,
  ShiftOption,
} from '@/types'
import { buildShiftWindowUTC } from '@/lib/timezone'

interface UseTimelineParams {
  asset: FlatAssetOption | null
  dateStr: string // "YYYY-MM-DD"
  shift: ShiftOption | null
  showIndividualProduces: boolean
}

export function useTimelineData({
  asset,
  dateStr,
  shift,
  showIndividualProduces,
}: UseTimelineParams) {
  // 1. Calculate UTC shift window
  const windowInfo =
    asset && shift && dateStr
      ? buildShiftWindowUTC(dateStr, shift.startTime, shift.endTime)
      : null

  // 2. Query machine intervals
  const intervalsQuery = useQuery<MachineIntervalsData, Error>({
    queryKey: [
      'machine-intervals',
      asset?.id,
      asset?.assetlevel_id,
      windowInfo?.from_ts,
      windowInfo?.to_ts,
      showIndividualProduces,
    ],
    queryFn: async () => {
      if (!asset || !windowInfo) {
        throw new Error('Asset and shift window are required.')
      }

      return getMachineIntervalsApi({
        entity_scope: {
          type: 'asset',
          asset: {
            asset_id: asset.id,
            asset_level_id: asset.assetlevel_id,
          },
        },
        time_range: {
          from_ts: windowInfo.from_ts,
          to_ts: windowInfo.to_ts,
        },
        produce_counts: true,
        exact_produces: showIndividualProduces,
        group_produce_counts_by_part_model: true,
      })
    },
    enabled: !!asset && !!windowInfo,
    staleTime: 60 * 1000, // 1 min stale time
  })

  // 3. Query cycle time metrics (hourly distribution)
  const cycleTimeQuery = useQuery<HourlyCycleTimeBucket[], Error>({
    queryKey: [
      'cycle-time-metrics',
      asset?.id,
      asset?.assetlevel_id,
      windowInfo?.from_ts,
      windowInfo?.to_ts,
    ],
    queryFn: async () => {
      if (!asset || !windowInfo) {
        throw new Error('Asset and shift window are required.')
      }

      return getCycleTimeMetricsApi({
        entity_scope: {
          type: 'asset',
          asset: {
            asset_id: asset.id,
            asset_level_id: asset.assetlevel_id,
          },
        },
        metrics: ['ideal_cycle_time_seconds', 'actual_cycle_time_seconds'],
        time_range: {
          from_ts: windowInfo.from_ts,
          to_ts: windowInfo.to_ts,
        },
        distribution: 'hourly',
      })
    },
    enabled: !!asset && !!windowInfo,
    staleTime: 60 * 1000,
  })

  const isLoading = intervalsQuery.isLoading || cycleTimeQuery.isLoading
  const isFetching = intervalsQuery.isFetching || cycleTimeQuery.isFetching
  const error = intervalsQuery.error || cycleTimeQuery.error

  const refetch = async () => {
    await Promise.all([intervalsQuery.refetch(), cycleTimeQuery.refetch()])
  }

  return {
    intervalsData: intervalsQuery.data,
    cycleTimes: cycleTimeQuery.data,
    windowInfo,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
