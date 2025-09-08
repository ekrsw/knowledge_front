import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../../../app/components/auth/LoginForm'
import { useAuthStore } from '../../../app/stores/authStore'

// Mock the auth store
jest.mock('../../../app/stores/authStore')
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

describe('LoginForm', () => {
  const mockLogin = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock store state
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      login: mockLogin,
      logout: jest.fn(),
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    })
  })

  it('renders login form with all required fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByRole('form', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.click(submitButton)
    
    expect(screen.getByText(/username is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('displays validation error for short username', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(usernameInput, 'ab')
    await user.click(submitButton)
    
    expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
  })

  it('displays validation error for short password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(passwordInput, '12345')
    await user.click(submitButton)
    
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
  })

  it('calls login function with correct credentials on valid submission', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockLogin).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock loading state
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
      login: mockLogin,
      logout: jest.fn(),
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    })
    
    render(<LoginForm />)
    
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    
    // Mock login to throw error
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(usernameInput, 'wronguser')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback when login succeeds', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = jest.fn()
    
    // Mock successful login
    mockLogin.mockResolvedValue(undefined)
    
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<LoginForm />)
    
    const form = screen.getByRole('form')
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(form).toHaveAttribute('aria-label', 'Login Form')
    expect(usernameInput).toHaveAttribute('type', 'text')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Tab navigation should work
    await user.tab()
    expect(usernameInput).toHaveFocus()
    
    await user.tab()
    expect(passwordInput).toHaveFocus()
    
    await user.tab()
    expect(submitButton).toHaveFocus()
  })

  it('clears error message when user starts typing', async () => {
    const user = userEvent.setup()
    
    // Mock login to throw error
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Trigger error
    await user.type(usernameInput, 'wronguser')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
    
    // Start typing - should clear error
    await user.type(usernameInput, 'a')
    
    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
  })
})