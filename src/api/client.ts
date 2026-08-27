import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '@/lib/storage'
import type { ApiResponse } from '@/types/api'

// Base URL: default to production azure endpoint if env not set
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://fractaldmsdev.centralindia.cloudapp.azure.com'

export const apiClient = axios.create({
  baseURL: BASE_URL.replace(/\/+$/, ''), // Strip trailing slashes
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Extend config for retry count
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

// Request Interceptor: Attach Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Global unauthorized event handler callback
type UnauthorizedHandler = () => void
let onUnauthorizedCallback: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorizedCallback = handler
}

// Response Interceptor: Unwrap MES Envelope & handle errors
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<unknown>

    // Check if status_code inside MES envelope indicates an error
    if (data && typeof data === 'object' && 'status_code' in data) {
      if (data.status_code >= 400) {
        return Promise.reject({
          status_code: data.status_code,
          message: data.message || 'API Error',
          trace_id: data.trace_id,
          data: data.data,
        })
      }
      // Unwrap MES envelope: return data.data directly
      return response
    }

    return response
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined

    // 1. Handle HTTP 401 Unauthorized
    if (error.response?.status === 401) {
      const url = originalRequest?.url || ''
      // Don't auto-redirect on login failure; let the login form show inline error
      if (!url.includes('/auth/login')) {
        tokenStorage.remove()
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback()
        }
      }
    }

    // 2. Handle HTTP 500 Retry with exponential backoff (up to 2 retries)
    if (
      error.response?.status &&
      error.response.status >= 500 &&
      originalRequest
    ) {
      originalRequest._retryCount = originalRequest._retryCount || 0

      if (originalRequest._retryCount < 2) {
        originalRequest._retryCount += 1
        const delayMs = originalRequest._retryCount * 1000 // 1s, then 2s
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        return apiClient(originalRequest)
      }
    }

    // Format error message from envelope if present
    const serverMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'

    return Promise.reject({
      status_code: error.response?.status || 500,
      message: serverMessage,
      trace_id: error.response?.data?.trace_id,
      data: error.response?.data?.data,
    })
  }
)
