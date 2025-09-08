import { create } from 'zustand'
import { User, LoginCredentials, AuthState, AuthActions } from '../types/auth'
import { authClient } from '../lib/api/auth'

export const useAuthStore = create<AuthState & AuthActions>((set) => {
  // Initialize with token from localStorage if available
  const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  return {
    user: null,
    token: initialToken,
    isAuthenticated: !!initialToken,
    loading: false,

  login: async (credentials: LoginCredentials) => {
    set({ loading: true })
    try {
      const response = await authClient.login(credentials)
      const { access_token, user } = response
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token)
      }
      
      set({
        token: access_token,
        user,
        isAuthenticated: true,
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  setAuth: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
    
    set({
      token,
      user,
      isAuthenticated: true,
    })
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    })
  },
  }
})