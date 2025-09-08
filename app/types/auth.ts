export interface User {
  user_id: string
  username: string
  email: string
  role: 'admin' | 'approver' | 'user'
  is_active: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}