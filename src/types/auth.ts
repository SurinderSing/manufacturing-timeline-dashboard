export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserProfile {
  id: string
  hid?: number
  username: string
  name: string
  email: string
  customer_id: string
  customer_name: string
  designation_id?: string
  designation_name?: string
  department_id?: string
  department_name?: string
  roles: string[]
  status: string
}

export interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}
