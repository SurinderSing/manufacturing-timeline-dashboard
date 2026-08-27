export interface ApiResponse<T> {
  trace_id: string
  status_code: number
  message: string
  data: T
  note_for_candidate?: string
}

export interface ApiError {
  trace_id?: string
  status_code?: number
  message: string
  data?: unknown
}
