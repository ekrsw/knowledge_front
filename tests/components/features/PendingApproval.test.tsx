import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PendingApproval } from '../../../app/components/features/PendingApproval'
import { approvalsApi } from '../../../app/lib/api/approvals'
import { ApprovalRequest, PendingApprovalListResponse } from '../../../app/types/approval'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock the approvals API
jest.mock('../../../app/lib/api/approvals')
const mockApprovalsApi = approvalsApi as jest.Mocked<typeof approvalsApi>

// Helper to wrap component with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Mock data
const mockPendingApprovals: PendingApprovalListResponse = {
  approvals: [
    {
      approval_id: 'approval-1',
      revision_id: 'rev-1',
      article_id: 'art-1',
      title: 'Test Article 1',
      content: 'Test content for approval',
      category_name: 'Technical',
      submitted_by: 'user-1',
      submitted_at: '2024-01-01T10:00:00Z',
      author_name: 'John Doe',
      version: 1,
      current_status: 'pending',
      priority: 'medium',
      deadline: '2024-01-03T10:00:00Z'
    },
    {
      approval_id: 'approval-2',
      revision_id: 'rev-2',
      article_id: 'art-2',
      title: 'Test Article 2',
      content: 'Another test content',
      category_name: 'Business',
      submitted_by: 'user-2',
      submitted_at: '2024-01-02T10:00:00Z',
      author_name: 'Jane Smith',
      version: 2,
      current_status: 'pending',
      priority: 'high'
    }
  ],
  total: 2,
  page: 1,
  limit: 20,
  total_pages: 1
}

describe('PendingApproval', () => {
  const Wrapper = createWrapper()

  beforeEach(() => {
    jest.clearAllMocks()
    mockApprovalsApi.getPendingApprovals.mockResolvedValue({
      data: mockPendingApprovals,
      status: 200,
      success: true
    })
    
    mockApprovalsApi.performApprovalAction.mockResolvedValue({
      data: {
        success: true,
        message: 'Approval action completed',
        new_status: 'approved'
      },
      status: 200,
      success: true
    })
  })

  it('renders loading state initially', () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    expect(screen.getByTestId('pending-approval-loading')).toBeInTheDocument()
  })

  it('renders pending approvals list after loading', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
      expect(screen.getByText('Test Article 2')).toBeInTheDocument()
    })

    expect(screen.getByText('Technical')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays priority badges correctly', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })

    const mediumBadge = screen.getAllByText('medium').find(badge =>
      badge.classList.contains('bg-yellow-100')
    )
    const highBadge = screen.getAllByText('high').find(badge =>
      badge.classList.contains('bg-red-100')
    )

    expect(mediumBadge).toBeInTheDocument()
    expect(highBadge).toBeInTheDocument()
  })

  it('handles empty state', async () => {
    mockApprovalsApi.getPendingApprovals.mockResolvedValue({
      data: {
        approvals: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      },
      status: 200,
      success: true
    })

    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pending-approval-empty')).toBeInTheDocument()
      expect(screen.getByText('No pending approvals')).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    mockApprovalsApi.getPendingApprovals.mockResolvedValue({
      data: undefined,
      status: 500,
      success: false,
      error: 'Server error'
    })

    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pending-approval-error')).toBeInTheDocument()
      expect(screen.getByText(/error loading pending approvals/i)).toBeInTheDocument()
    })
  })

  it('supports filtering by priority', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('approval-filter-panel')).toBeInTheDocument()
    })

    // Find the high priority filter button
    const filterButtons = screen.getAllByText('high')
    const highFilterButton = filterButtons.find(btn => 
      btn.tagName === 'BUTTON' && 
      btn.classList.contains('capitalize')
    )
    expect(highFilterButton).toBeInTheDocument()
    
    fireEvent.click(highFilterButton!)

    await waitFor(() => {
      expect(mockApprovalsApi.getPendingApprovals).toHaveBeenLastCalledWith({
        filter: { priority: 'high' },
        page: 1,
        limit: 20,
        sort: { field: 'submitted_at', direction: 'desc' }
      })
    })
  })

  it('performs approval action', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })

    // Find and click approve button for first item
    const approveButtons = screen.getAllByRole('button', { name: /approve/i })
    expect(approveButtons.length).toBeGreaterThan(0)
    
    fireEvent.click(approveButtons[0])

    await waitFor(() => {
      expect(mockApprovalsApi.performApprovalAction).toHaveBeenCalledWith({
        revision_id: 'rev-1',
        action: 'approve'
      })
    })

    // Should show success message
    expect(screen.getByText(/approval action completed/i)).toBeInTheDocument()
  })

  it('performs rejection with comment', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })

    // Find and click reject button for first item
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i })
    expect(rejectButtons.length).toBeGreaterThan(0)
    
    fireEvent.click(rejectButtons[0])

    // Should show comment modal
    await waitFor(() => {
      expect(screen.getByText(/rejection reason/i)).toBeInTheDocument()
    })

    // Enter rejection reason
    const commentInput = screen.getByPlaceholderText(/enter reason for rejection/i)
    fireEvent.change(commentInput, { target: { value: 'Content needs revision' } })

    // Submit rejection
    const submitButton = screen.getByRole('button', { name: /submit rejection/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockApprovalsApi.performApprovalAction).toHaveBeenCalledWith({
        revision_id: 'rev-1',
        action: 'reject',
        comment: 'Content needs revision'
      })
    })
  })

  it('supports sorting', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    // Click on title header to sort
    const titleHeader = screen.getByRole('button', { name: /sort by title/i })
    fireEvent.click(titleHeader)

    await waitFor(() => {
      expect(mockApprovalsApi.getPendingApprovals).toHaveBeenLastCalledWith({
        sort: { field: 'title', direction: 'asc' },
        page: 1,
        limit: 20,
        filter: {}
      })
    })
  })

  it('shows deadline indicators', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })

    // Should show deadline for first item
    expect(screen.getByText(/Jan 3, 2024/)).toBeInTheDocument()
    
    // Should show "No deadline" for second item
    expect(screen.getByText(/no deadline/i)).toBeInTheDocument()
  })

  it('supports bulk actions', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })

    // Select first item
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // Bulk approve button should become visible
    expect(screen.getByRole('button', { name: /bulk approve/i })).toBeInTheDocument()

    // Click bulk approve
    const bulkApproveButton = screen.getByRole('button', { name: /bulk approve/i })
    fireEvent.click(bulkApproveButton)

    await waitFor(() => {
      expect(mockApprovalsApi.performApprovalAction).toHaveBeenCalledWith({
        revision_id: 'rev-1',
        action: 'approve'
      })
    })
  })

  it('has proper accessibility attributes', async () => {
    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    expect(table).toHaveAttribute('aria-label', 'Pending approvals list')
    
    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders.length).toBeGreaterThan(0)
    
    columnHeaders.forEach(header => {
      expect(header).toHaveAttribute('scope', 'col')
    })

    // Check action buttons have proper labels
    const approveButtons = screen.getAllByRole('button', { name: /approve/i })
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i })
    
    expect(approveButtons.length).toBeGreaterThan(0)
    expect(rejectButtons.length).toBeGreaterThan(0)
  })

  it('refreshes data on retry after error', async () => {
    mockApprovalsApi.getPendingApprovals
      .mockResolvedValueOnce({
        data: undefined,
        status: 500,
        success: false,
        error: 'Server error'
      })
      .mockResolvedValueOnce({
        data: mockPendingApprovals,
        status: 200,
        success: true
      })

    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('pending-approval-error')).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })
  })

  it('handles approval action errors', async () => {
    mockApprovalsApi.performApprovalAction.mockResolvedValue({
      data: undefined,
      status: 500,
      success: false,
      error: 'Approval failed'
    })

    render(
      <Wrapper>
        <PendingApproval />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })

    const approveButtons = screen.getAllByRole('button', { name: /approve/i })
    fireEvent.click(approveButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/approval failed/i)).toBeInTheDocument()
    })
  })
})