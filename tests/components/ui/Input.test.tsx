import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../../../app/components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows helper text when provided', () => {
    render(<Input label="Email" helperText="Enter your email address" />)
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('handles user input correctly', async () => {
    const handleChange = jest.fn()
    render(<Input label="Email" onChange={handleChange} />)
    
    const input = screen.getByLabelText('Email')
    await userEvent.type(input, 'test@example.com')
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test@example.com')
  })

  it('shows required indicator when required', () => {
    render(<Input label="Email" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('is accessible with proper ARIA attributes', () => {
    render(<Input label="Email" error="Invalid email" required />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-describedby')
  })

  it('applies error styles when error is present', () => {
    render(<Input label="Email" error="Invalid email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveClass('border-red-500')
  })

  it('applies normal styles when no error', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveClass('border-gray-300')
  })

  it('hides helper text when error is present', () => {
    render(<Input label="Email" error="Invalid email" helperText="Enter your email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument()
  })

  it('can be used as password input', () => {
    render(<Input label="Password" type="password" />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })
})