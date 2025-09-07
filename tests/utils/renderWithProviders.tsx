import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactElement, ReactNode } from 'react'

// Mock Auth Store for testing
const createMockAuthStore = (initialState?: any) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  setAuth: jest.fn(),
  clearAuth: jest.fn(),
  ...initialState,
})

// Test Query Client with sensible defaults
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

interface AllTheProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
  initialAuthState?: any
}

function AllTheProviders({ 
  children, 
  queryClient = createTestQueryClient(),
  initialAuthState = {} 
}: AllTheProvidersProps) {
  // Mock the auth store hook
  const mockAuthStore = createMockAuthStore(initialAuthState)
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialAuthState?: any
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { queryClient, initialAuthState, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders 
        queryClient={queryClient}
        initialAuthState={initialAuthState}
        {...props}
      />
    ),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }

// Helper to create authenticated user state
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

// Helper to create loading state
export const createLoadingState = () => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
})