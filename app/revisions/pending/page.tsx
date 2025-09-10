'use client'

import { PendingApproval } from '../../components/features/PendingApproval'

export default function PendingApprovalsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pending Approvals
        </h1>
        <p className="text-gray-600">
          Review and approve pending article revisions
        </p>
      </div>

      <PendingApproval />
    </div>
  )
}