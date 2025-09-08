import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

// Simple providers wrapper for testing
// TODO: Add QueryClient and auth providers when implementing those features
function AllTheProviders({ children }: { children: ReactNode }) {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for future use
export const createAuthenticatedState = (userOverrides = {}) => ({
  user: {
    user_id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user' as const,
    is_active: true,
    ...userOverrides,
  },
  token: 'mock-jwt-token',
  isAuthenticated: true,
  loading: false,
})

export const createLoadingState = () => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
})