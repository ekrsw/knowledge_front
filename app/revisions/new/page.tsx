'use client'

import { NewCreation } from '../../components/features/NewCreation'
import { AuthGuard } from '../../components/auth/AuthGuard'

export default function NewRevisionPage() {
  return (
    <AuthGuard requiredRole="user">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Article
          </h1>
          <p className="text-gray-600">
            Create a new article or save as draft for later editing
          </p>
        </div>

        <NewCreation />
      </div>
    </AuthGuard>
  )
}