'use client'

import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '../../stores/authStore'

interface LoginFormProps {
  onSuccess?: () => void
}

interface FormData {
  username: string
  password: string
}

interface FormErrors {
  username?: string
  password?: string
  general?: string
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, loading } = useAuthStore()
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await login({
        username: formData.username,
        password: formData.password
      })
      onSuccess?.()
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed'
      })
    }
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Clear errors when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      aria-label="Login Form"
      role="form"
      className="space-y-4 w-full max-w-md mx-auto"
    >
      <div>
        <Input
          label="Username"
          type="text"
          value={formData.username}
          onChange={handleInputChange('username')}
          error={errors.username}
          disabled={loading}
          autoComplete="username"
        />
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          disabled={loading}
          autoComplete="current-password"
        />
      </div>

      {errors.general && (
        <div 
          className="text-red-600 text-sm mt-2"
          role="alert"
          aria-live="polite"
        >
          {errors.general}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}