'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { approvalsApi } from '../../lib/api/approvals'
import { 
  PendingApprovalListParams, 
  PendingApprovalFilter, 
  PendingApprovalSort,
  ApprovalRequest,
  ApprovalAction
} from '../../types/approval'

interface PendingApprovalProps {
  defaultFilter?: PendingApprovalFilter
  defaultSort?: PendingApprovalSort
  pageSize?: number
}

export function PendingApproval({ 
  defaultFilter, 
  defaultSort = { field: 'submitted_at', direction: 'desc' },
  pageSize = 20 
}: PendingApprovalProps) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<PendingApprovalFilter>(defaultFilter || {})
  const [sort, setSort] = useState<PendingApprovalSort>(defaultSort)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean
    revisionId: string
    comment: string
  }>({
    isOpen: false,
    revisionId: '',
    comment: ''
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const queryParams: PendingApprovalListParams = {
    page,
    limit: pageSize,
    filter,
    sort
  }

  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pending-approvals', queryParams],
    queryFn: () => approvalsApi.getPendingApprovals(queryParams),
    select: (response) => response.data
  })

  // Approval action mutation
  const approvalMutation = useMutation({
    mutationFn: (params: { revision_id: string; action: ApprovalAction; comment?: string }) =>
      approvalsApi.performApprovalAction({
        revision_id: params.revision_id,
        action: params.action,
        comment: params.comment
      }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setSuccessMessage(response.data.message)
        setSelectedItems(new Set()) // Clear selections
        queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      } else {
        setErrorMessage(response.error || 'Action failed')
      }
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Action failed')
    }
  })

  const handlePriorityFilter = (priority: 'low' | 'medium' | 'high') => {
    const newPriority = filter.priority === priority ? undefined : priority
    setFilter({ ...filter, priority: newPriority })
    setPage(1)
  }

  const handleSort = (field: PendingApprovalSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    setSort({ field, direction: newDirection })
    setPage(1)
  }

  const getSortIcon = (field: PendingApprovalSort['field']) => {
    if (sort.field !== field) return '↕️'
    return sort.direction === 'asc' ? '↑' : '↓'
  }

  const handleApprove = (revisionId: string) => {
    setSuccessMessage('')
    setErrorMessage('')
    approvalMutation.mutate({ revision_id: revisionId, action: 'approve' })
  }

  const handleReject = (revisionId: string) => {
    setRejectionModal({
      isOpen: true,
      revisionId,
      comment: ''
    })
  }

  const submitRejection = () => {
    if (!rejectionModal.comment.trim()) {
      return // Require comment for rejection
    }
    
    setSuccessMessage('')
    setErrorMessage('')
    approvalMutation.mutate({ 
      revision_id: rejectionModal.revisionId, 
      action: 'reject',
      comment: rejectionModal.comment
    })
    
    setRejectionModal({ isOpen: false, revisionId: '', comment: '' })
  }

  const handleSelectItem = (revisionId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(revisionId)) {
      newSelected.delete(revisionId)
    } else {
      newSelected.add(revisionId)
    }
    setSelectedItems(newSelected)
  }

  const handleBulkApprove = () => {
    selectedItems.forEach(revisionId => {
      approvalMutation.mutate({ revision_id: revisionId, action: 'approve' })
    })
  }

  if (isLoading) {
    return (
      <div data-testid="pending-approval-loading" className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading pending approvals...</span>
      </div>
    )
  }

  if (error || !response) {
    return (
      <div data-testid="pending-approval-error" className="text-center p-8">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Pending Approvals</h3>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    )
  }

  if (response.approvals.length === 0) {
    return (
      <div data-testid="pending-approval-empty" className="text-center p-12">
        <div className="text-gray-500">
          <h3 className="text-lg font-semibold mb-2">No pending approvals</h3>
          <p className="text-sm">All articles are up to date!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Filter Panel */}
      <div data-testid="approval-filter-panel" className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Priority Filters */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Priority:</span>
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <Button
                key={priority}
                variant={filter.priority === priority ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handlePriorityFilter(priority)}
                className="capitalize"
              >
                {priority}
              </Button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex gap-2">
              <span className="text-sm text-gray-600">
                {selectedItems.size} selected
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkApprove}
                disabled={approvalMutation.isPending}
              >
                Bulk Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table 
          className="min-w-full divide-y divide-gray-200" 
          role="table"
          aria-label="Pending approvals list"
        >
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedItems.size === response.approvals.length}
                  onChange={() => {
                    if (selectedItems.size === response.approvals.length) {
                      setSelectedItems(new Set())
                    } else {
                      setSelectedItems(new Set(response.approvals.map(a => a.revision_id)))
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                  aria-label="Sort by title"
                >
                  <span>Title</span>
                  <span>{getSortIcon('title')}</span>
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort('submitted_at')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                  aria-label="Sort by submitted date"
                >
                  <span>Submitted</span>
                  <span>{getSortIcon('submitted_at')}</span>
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {response.approvals.map((approval) => (
              <PendingApprovalRow 
                key={approval.approval_id} 
                approval={approval}
                isSelected={selectedItems.has(approval.revision_id)}
                onSelect={() => handleSelectItem(approval.revision_id)}
                onApprove={() => handleApprove(approval.revision_id)}
                onReject={() => handleReject(approval.revision_id)}
                isLoading={approvalMutation.isPending}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {response.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, response.total)} of{' '}
            {response.total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === response.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Rejection Reason</h3>
            <textarea
              value={rejectionModal.comment}
              onChange={(e) => setRejectionModal(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Enter reason for rejection..."
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              required
            />
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectionModal({ isOpen: false, revisionId: '', comment: '' })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={submitRejection}
                disabled={!rejectionModal.comment.trim()}
              >
                Submit Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface PendingApprovalRowProps {
  approval: ApprovalRequest
  isSelected: boolean
  onSelect: () => void
  onApprove: () => void
  onReject: () => void
  isLoading: boolean
}

function PendingApprovalRow({ 
  approval, 
  isSelected, 
  onSelect, 
  onApprove, 
  onReject, 
  isLoading 
}: PendingApprovalRowProps) {
  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return 'No deadline'
    return formatDate(deadline)
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {approval.title}
        </div>
        <div className="text-xs text-gray-500">
          v{approval.version}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getPriorityBadge(approval.priority)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {approval.category_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {approval.author_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(approval.submitted_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDeadline(approval.deadline)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onApprove}
            disabled={isLoading}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            disabled={isLoading}
          >
            Reject
          </Button>
        </div>
      </td>
    </tr>
  )
}