import { apiClient } from '@/api/client'
import type { ApiResponse, LoginRequest, LoginResponse, UserProfile } from '@/types'

export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    credentials
  )
  return response.data.data
}

export async function getMeApi(): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/me')
  return response.data.data
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout')
  } catch {
    // Ignore server error on logout to ensure client cleanup
  }
}
