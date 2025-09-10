'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { revisionsApi } from '../../lib/api/revisions'
import { 
  RevisionListParams, 
  RevisionFilter, 
  RevisionSort, 
  RevisionStatus,
  RevisionListItem 
} from '../../types/revision'

interface RevisionListProps {
  defaultFilter?: RevisionFilter
  defaultSort?: RevisionSort
  pageSize?: number
}

export function RevisionList({ 
  defaultFilter, 
  defaultSort = { field: 'created_at', direction: 'desc' },
  pageSize = 20 
}: RevisionListProps) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<RevisionFilter>(defaultFilter || {})
  const [sort, setSort] = useState<RevisionSort>(defaultSort)
  const [searchQuery, setSearchQuery] = useState('')

  const queryParams: RevisionListParams = {
    page,
    limit: pageSize,
    filter: {
      ...filter,
      ...(searchQuery && { search: searchQuery })
    },
    sort
  }

  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['revisions', queryParams],
    queryFn: () => revisionsApi.getRevisions(queryParams),
    select: (response) => {
      // Ensure proper structure with fallback
      const data = response.data as RevisionListResponse
      return data || { 
        revisions: [], 
        total: 0, 
        page: 1, 
        limit: 20, 
        total_pages: 0 
      }
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page
    // searchQuery is already set via controlled input
  }

  const handleSort = (field: RevisionSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    setSort({ field, direction: newDirection })
    setPage(1)
  }

  const handleStatusFilter = (status: RevisionStatus) => {
    const currentStatuses = filter.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    setFilter({ ...filter, status: newStatuses.length ? newStatuses : undefined })
    setPage(1)
  }

  const getSortIcon = (field: RevisionSort['field']) => {
    if (sort.field !== field) return '↕️'
    return sort.direction === 'asc' ? '↑' : '↓'
  }

  if (isLoading) {
    return (
      <div data-testid="revision-list-loading" className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading revisions...</span>
      </div>
    )
  }

  if (error || !response) {
    return (
      <div data-testid="revision-list-error" className="text-center p-8">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Revisions</h3>
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

  if (!response?.revisions || response.revisions.length === 0) {
    return (
      <div data-testid="revision-list-empty" className="text-center p-12">
        <div className="text-gray-500">
          <h3 className="text-lg font-semibold mb-2">No revisions found</h3>
          <p className="text-sm">No revisions match your current filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Panel */}
      <div data-testid="filter-panel" className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="Search revisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline" size="sm">
                Search
              </Button>
            </div>
          </form>

          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['draft', 'pending', 'approved', 'rejected', 'published'] as RevisionStatus[]).map((status) => (
              <Button
                key={status}
                variant={filter.status?.includes(status) ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table 
          className="min-w-full divide-y divide-gray-200" 
          role="table"
          aria-label="Revisions list"
        >
          <thead className="bg-gray-50">
            <tr>
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
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                  aria-label="Sort by created date"
                >
                  <span>Created</span>
                  <span>{getSortIcon('created_at')}</span>
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {response?.revisions?.map((revision) => (
              <RevisionListRow 
                key={revision.revision_id} 
                revision={revision}
                onView={() => {/* TODO: Navigate to revision view */}}
                onEdit={() => {/* TODO: Navigate to edit */}}
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
          <div className="text-sm text-gray-500">
            Page {page} of {response.total_pages}
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
    </div>
  )
}

interface RevisionListRowProps {
  revision: RevisionListItem
  onView: () => void
  onEdit: () => void
}

function RevisionListRow({ revision, onView, onEdit }: RevisionListRowProps) {
  const getStatusBadge = (status: RevisionStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      published: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
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

  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onView()
        }
      }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {revision.title}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(revision.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {revision.category_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(revision.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {revision.author_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        v{revision.version}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            Edit
          </Button>
        </div>
      </td>
    </tr>
  )
}