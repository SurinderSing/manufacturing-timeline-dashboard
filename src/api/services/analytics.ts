import { apiClient } from '@/api/client'
import type {
  ApiResponse,
  MachineIntervalsRequest,
  MachineIntervalsData,
  CycleTimeRequest,
  HourlyCycleTimeBucket,
} from '@/types'

export async function getMachineIntervalsApi(
  request: MachineIntervalsRequest
): Promise<MachineIntervalsData> {
  const response = await apiClient.post<ApiResponse<MachineIntervalsData>>(
    '/analytics-query/machine-intervals',
    request
  )
  return response.data.data
}

export async function getCycleTimeMetricsApi(
  request: CycleTimeRequest
): Promise<HourlyCycleTimeBucket[]> {
  const response = await apiClient.post<ApiResponse<HourlyCycleTimeBucket[]>>(
    '/analytics-query',
    request
  )
  return response.data.data
}
