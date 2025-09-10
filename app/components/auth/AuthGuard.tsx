'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { LoginForm } from './LoginForm'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'approver' | 'admin'
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requiredRole = 'user',
  fallback 
}: AuthGuardProps) {
  const { isAuthenticated, user, loading } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Wait for auth store to initialize from localStorage
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Show loading state while initializing
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Initializing...</span>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to be logged in to access this page
            </p>
          </div>
          <LoginForm onSuccess={() => {
            // Auth state will be updated automatically
            console.log('Login successful')
          }} />
          <div className="text-center">
            <div className="text-sm text-gray-500">
              <p>Test Users:</p>
              <p><strong>Admin:</strong> testadmin / password</p>
              <p><strong>Approver:</strong> testapprover / password</p>
              <p><strong>User:</strong> testuser / password</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check role permissions
  const roleHierarchy: Record<string, number> = {
    'user': 1,
    'approver': 2,
    'admin': 3
  }

  const userRoleLevel = roleHierarchy[user.role] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0

  if (userRoleLevel < requiredRoleLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="text-red-600">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="mt-2">
              You need {requiredRole} role or higher to access this page.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Your current role: {user.role}
            </p>
          </div>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Logout and try another account
          </button>
        </div>
      </div>
    )
  }

  // User is authenticated and has required permissions
  return <>{children}</>
}