import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RevisionList } from '../../../app/components/features/RevisionList'
import { revisionsApi } from '../../../app/lib/api/revisions'
import { RevisionListResponse, RevisionStatus } from '../../../app/types/revision'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock the revisions API
jest.mock('../../../app/lib/api/revisions')
const mockRevisionsApi = revisionsApi as jest.Mocked<typeof revisionsApi>

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
const mockRevisions: RevisionListResponse = {
  revisions: [
    {
      revision_id: 'rev-1',
      article_id: 'art-1',
      title: 'Test Article 1',
      status: 'pending' as RevisionStatus,
      created_at: '2024-01-01T10:00:00Z',
      created_by: 'user-1',
      version: 1,
      category_name: 'Technical',
      author_name: 'John Doe'
    },
    {
      revision_id: 'rev-2',
      article_id: 'art-2',
      title: 'Test Article 2',
      status: 'approved' as RevisionStatus,
      created_at: '2024-01-02T10:00:00Z',
      created_by: 'user-2',
      version: 2,
      category_name: 'Business',
      author_name: 'Jane Smith'
    }
  ],
  total: 2,
  page: 1,
  limit: 20,
  total_pages: 1
}

describe('RevisionList', () => {
  const Wrapper = createWrapper()

  beforeEach(() => {
    jest.clearAllMocks()
    mockRevisionsApi.getRevisions.mockResolvedValue({
      data: mockRevisions,
      status: 200,
      success: true
    })
  })

  it('renders loading state initially', () => {
    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    expect(screen.getByTestId('revision-list-loading')).toBeInTheDocument()
  })

  it('renders revision list after loading', async () => {
    render(
      <Wrapper>
        <RevisionList />
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

  it('displays revision status correctly', async () => {
    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      // Look specifically for status badges, not filter buttons
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })
    
    // Check for status badges in the table
    const statusBadges = screen.getAllByText('pending')
    const pendingBadge = statusBadges.find(badge => 
      badge.classList.contains('bg-yellow-100')
    )
    expect(pendingBadge).toBeInTheDocument()
    
    const approvedBadges = screen.getAllByText('approved')
    const approvedBadge = approvedBadges.find(badge => 
      badge.classList.contains('bg-green-100')
    )
    expect(approvedBadge).toBeInTheDocument()
  })

  it('handles empty state', async () => {
    mockRevisionsApi.getRevisions.mockResolvedValue({
      data: {
        revisions: [],
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
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('revision-list-empty')).toBeInTheDocument()
      expect(screen.getByText('No revisions found')).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    mockRevisionsApi.getRevisions.mockResolvedValue({
      data: undefined,
      status: 500,
      success: false,
      error: 'Server error'
    })

    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('revision-list-error')).toBeInTheDocument()
      expect(screen.getByText(/error loading revisions/i)).toBeInTheDocument()
    })
  })

  it('supports filtering by status', async () => {
    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
    })

    // Find the pending filter button specifically
    const filterButtons = screen.getAllByText('pending')
    const pendingFilterButton = filterButtons.find(btn => 
      btn.tagName === 'BUTTON' && 
      btn.classList.contains('capitalize')
    )
    expect(pendingFilterButton).toBeInTheDocument()
    
    fireEvent.click(pendingFilterButton!)

    await waitFor(() => {
      expect(mockRevisionsApi.getRevisions).toHaveBeenLastCalledWith({
        filter: { status: ['pending'] },
        page: 1,
        limit: 20,
        sort: { field: 'created_at', direction: 'desc' }
      })
    })
  })

  it('supports search functionality', async () => {
    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search revisions/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search revisions/i)
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    fireEvent.submit(searchInput.closest('form')!)

    await waitFor(() => {
      expect(mockRevisionsApi.getRevisions).toHaveBeenLastCalledWith({
        filter: { search: 'test search' },
        page: 1,
        limit: 20,
        sort: { field: 'created_at', direction: 'desc' }
      })
    })
  })

  it('supports sorting', async () => {
    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    // Click on title header to sort
    const titleHeader = screen.getByRole('button', { name: /sort by title/i })
    fireEvent.click(titleHeader)

    await waitFor(() => {
      expect(mockRevisionsApi.getRevisions).toHaveBeenLastCalledWith({
        sort: { field: 'title', direction: 'asc' },
        page: 1,
        limit: 20,
        filter: {}
      })
    })
  })

  it('supports pagination', async () => {
    const paginatedResponse = {
      ...mockRevisions,
      total: 50,
      total_pages: 3,
      page: 1
    }

    mockRevisionsApi.getRevisions.mockResolvedValue({
      data: paginatedResponse,
      status: 200,
      success: true
    })

    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    })

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockRevisionsApi.getRevisions).toHaveBeenLastCalledWith({
        page: 2,
        limit: 20,
        filter: {},
        sort: { field: 'created_at', direction: 'desc' }
      })
    })
  })

  it('has proper accessibility attributes', async () => {
    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    expect(table).toHaveAttribute('aria-label', 'Revisions list')
    
    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders.length).toBeGreaterThan(0)
    
    columnHeaders.forEach(header => {
      expect(header).toHaveAttribute('scope', 'col')
    })
  })

  it('supports keyboard navigation', async () => {
    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRow = screen.getAllByRole('row')[1] // Skip header row
    expect(firstRow).toBeInTheDocument()

    // Test keyboard navigation
    fireEvent.keyDown(firstRow, { key: 'Enter' })
    
    // Should trigger row action (view revision)
    await waitFor(() => {
      expect(firstRow).toHaveAttribute('tabIndex', '0')
    })
  })

  it('refreshes data on retry after error', async () => {
    mockRevisionsApi.getRevisions
      .mockResolvedValueOnce({
        data: undefined,
        status: 500,
        success: false,
        error: 'Server error'
      })
      .mockResolvedValueOnce({
        data: mockRevisions,
        status: 200,
        success: true
      })

    render(
      <Wrapper>
        <RevisionList />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('revision-list-error')).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    })
  })
})