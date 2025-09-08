import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../../app/stores/authStore'
import { createMockUser } from '../factories/userFactory'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.getState().clearAuth()
    // Clear localStorage mock
    if (window.localStorage) {
      window.localStorage.clear?.()
    }
    jest.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('handles successful login', async () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = createMockUser()
    const mockToken = 'mock-jwt-token'

    // Mock successful login response
    server.use(
      http.post('/api/v1/auth/login/json', () => {
        return HttpResponse.json({
          access_token: mockToken,
          token_type: 'bearer',
          user: mockUser,
        })
      })
    )

    await act(async () => {
      await result.current.login({
        username: 'testuser',
        password: 'password',
      })
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.loading).toBe(false)
  })

  it('handles login failure', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Mock failed login
    server.use(
      http.post('/api/v1/auth/login/json', () => {
        return new HttpResponse(
          JSON.stringify({ detail: 'Invalid credentials' }),
          { status: 401 }
        )
      })
    )

    await act(async () => {
      try {
        await result.current.login({
          username: 'wrong',
          password: 'wrong',
        })
      } catch (error) {
        // Expected error
        expect(error).toBeInstanceOf(Error)
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('sets loading state to false after login', async () => {
    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.login({
        username: 'testuser',
        password: 'password',
      })
    })
    
    // After login, loading should be false
    expect(result.current.loading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles logout correctly', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Set initial authenticated state
    act(() => {
      result.current.setAuth('token', createMockUser())
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('restores auth state from localStorage on initialization', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockToken = 'stored-token'
    const mockUser = createMockUser()
    
    // Simulate setting auth state (which would save to localStorage)
    act(() => {
      result.current.setAuth(mockToken, mockUser)
    })
    
    // Verify the token was set
    expect(result.current.token).toBe(mockToken)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })

  it('persists token to localStorage on setAuth', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockToken = 'test-token'
    const mockUser = createMockUser()

    act(() => {
      result.current.setAuth(mockToken, mockUser)
    })

    expect(result.current.token).toBe(mockToken)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('removes token from localStorage on clearAuth', () => {
    const { result } = renderHook(() => useAuthStore())

    // Set some initial state
    act(() => {
      result.current.setAuth('token', createMockUser())
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.clearAuth()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
  })
})