import { useQuery } from '@tanstack/react-query'
import { getShiftsApi, parseShiftOptions } from '@/api/services/shifts'
import type { ShiftDefinition, ShiftOption } from '@/types'

export function useShifts() {
  const query = useQuery<ShiftDefinition[], Error>({
    queryKey: ['shifts'],
    queryFn: getShiftsApi,
    staleTime: 10 * 60 * 1000, // 10 mins cache
  })

  const shiftOptions: ShiftOption[] = query.data ? parseShiftOptions(query.data) : []
  const defaultShift = shiftOptions[0] || null

  return {
    ...query,
    shifts: query.data || [],
    shiftOptions,
    defaultShift,
  }
}
