import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { loginApi, getMeApi, logoutApi } from '@/api/services/auth'
import { setUnauthorizedHandler } from '@/api/client'
import { tokenStorage } from '@/lib/storage'
import type { AuthContextType, LoginRequest, UserProfile } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } finally {
      tokenStorage.remove()
      setToken(null)
      setUser(null)
    }
  }, [])

  // Setup global 401 interceptor hook
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.remove()
      setToken(null)
      setUser(null)
    })
  }, [])

  // Restore session on app load
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      const storedToken = tokenStorage.get()
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      try {
        const userProfile = await getMeApi()
        if (isMounted) {
          setUser(userProfile)
          setToken(storedToken)
        }
      } catch {
        if (isMounted) {
          tokenStorage.remove()
          setToken(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [])

  // Login handler
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await loginApi(credentials)
      const accessToken = response.access_token

      tokenStorage.set(accessToken)
      setToken(accessToken)

      // Fetch user profile immediately
      const userProfile = await getMeApi()
      setUser(userProfile)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
