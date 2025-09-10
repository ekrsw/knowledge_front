'use client'

import { RevisionList } from '../components/features/RevisionList'
import { AuthGuard } from '../components/auth/AuthGuard'

export default function RevisionsPage() {
  return (
    <AuthGuard requiredRole="user">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Revisions
          </h1>
          <p className="text-gray-600">
            Manage and review all article revisions
          </p>
        </div>

        <RevisionList />
      </div>
    </AuthGuard>
  )
}