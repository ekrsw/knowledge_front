'use client'

import Link from 'next/link'
import { useAuthStore } from '../../stores/authStore'
import { Button } from './Button'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <nav className="bg-white shadow border-gray-200">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Knowledge Management
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/revisions" 
                className="text-gray-700 hover:text-blue-700 transition-colors"
              >
                Revisions
              </Link>
              
              <Link 
                href="/revisions/new" 
                className="text-gray-700 hover:text-blue-700 transition-colors"
              >
                New Article
              </Link>
              
              {(user.role === 'approver' || user.role === 'admin') && (
                <Link 
                  href="/revisions/pending" 
                  className="text-gray-700 hover:text-blue-700 transition-colors"
                >
                  Pending Approvals
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user.username}</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {user.role}
              </span>
            </div>
            
            <Button
              onClick={() => logout()}
              variant="outline"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}