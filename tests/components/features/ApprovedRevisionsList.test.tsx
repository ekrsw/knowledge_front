import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApprovedRevisionsList } from '../../../app/components/features/ApprovedRevisionsList'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock data factory for approved revisions
const createMockApprovedRevision = (overrides = {}) => ({
  revision_id: 'approved-rev-1',
  title: 'テスト承認済み修正案',
  content: 'テスト用の承認済み内容です。',
  status: 'approved',
  proposer_id: 'test-user-id',
  approver_id: 'test-approver-id',
  target_article_id: 'test-article-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  approved_at: '2024-01-02T00:00:00Z',
  approval_comment: 'Good work!',
  proposer_name: 'テストユーザー',
  approver_name: 'テスト承認者',
  article_title: 'テスト記事',
  ...overrides,
})

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('ApprovedRevisionsList', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    mockPush.mockClear()
    // Mock successful API response
    server.use(
      http.get('/api/v1/revisions/', ({ request }) => {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        
        if (status === 'approved') {
          return HttpResponse.json([
            createMockApprovedRevision({
              revision_id: 'approved-1',
              title: '承認済み修正案1',
              approved_at: '2024-01-02T10:00:00Z',
            }),
            createMockApprovedRevision({
              revision_id: 'approved-2', 
              title: '承認済み修正案2',
              approved_at: '2024-01-01T10:00:00Z',
            }),
          ])
        }
        return HttpResponse.json([])
      })
    )
  })

  it('renders approved revisions list with proper heading', async () => {
    render(<ApprovedRevisionsList />)
    
    // Wait for data to load first, then check heading
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /承認済み修正案一覧/i })).toBeInTheDocument()
    })
    expect(screen.getByText(/承認された修正案の一覧です/i)).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    render(<ApprovedRevisionsList />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText(/読み込み中/i)).toBeInTheDocument()
  })

  it('displays approved revisions data correctly', async () => {
    render(<ApprovedRevisionsList />)
    
    await waitFor(() => {
      expect(screen.getByText('承認済み修正案1')).toBeInTheDocument()
      expect(screen.getByText('承認済み修正案2')).toBeInTheDocument()
    })

    // Check for approval information (use getAllByText since there are multiple items)
    expect(screen.getAllByText('テスト承認者')).toHaveLength(2)
    expect(screen.getByText(/2024\/01\/02/)).toBeInTheDocument()
    expect(screen.getAllByText('Good work!')).toHaveLength(2)
  })

  it('sorts revisions by approval date in descending order', async () => {
    render(<ApprovedRevisionsList />)
    
    await waitFor(() => {
      expect(screen.getByText('承認済み修正案1')).toBeInTheDocument()
      expect(screen.getByText('承認済み修正案2')).toBeInTheDocument()
    })

    // Get revision cards in DOM order and check titles
    const revisionCards = screen.getAllByRole('button')
    const firstTitle = revisionCards[0].querySelector('h2')?.textContent
    const secondTitle = revisionCards[1].querySelector('h2')?.textContent
    
    expect(firstTitle).toBe('承認済み修正案1') // More recent (2024-01-02)
    expect(secondTitle).toBe('承認済み修正案2') // Older (2024-01-01)
  })

  it('shows empty state when no approved revisions exist', async () => {
    server.use(
      http.get('/api/v1/revisions/', () => {
        return HttpResponse.json([])
      })
    )
    
    render(<ApprovedRevisionsList />)
    
    await waitFor(() => {
      expect(screen.getByText(/承認済みの修正案がありません/i)).toBeInTheDocument()
      expect(screen.getByText(/修正案が承認されると、ここに表示されます/i)).toBeInTheDocument()
    })
  })

  it('displays error state when API fails', async () => {
    server.use(
      http.get('/api/v1/revisions/', () => {
        return HttpResponse.error()
      })
    )
    
    render(<ApprovedRevisionsList />)
    
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /再試行/i })).toBeInTheDocument()
    })
  })

  it('allows retrying after error', async () => {
    const user = userEvent.setup()
    
    // First request fails
    server.use(
      http.get('/api/v1/revisions/', () => {
        return HttpResponse.error()
      })
    )
    
    render(<ApprovedRevisionsList />)
    
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument()
    })
    
    // Mock successful retry
    server.use(
      http.get('/api/v1/revisions/', () => {
        return HttpResponse.json([
          createMockApprovedRevision({ title: 'リトライ成功' })
        ])
      })
    )
    
    const retryButton = screen.getByRole('button', { name: /再試行/i })
    await user.click(retryButton)
    
    await waitFor(() => {
      expect(screen.getByText('リトライ成功')).toBeInTheDocument()
    })
  })

  it('navigates to revision details when clicked', async () => {
    const user = userEvent.setup()
    
    render(<ApprovedRevisionsList />)
    
    await waitFor(() => {
      expect(screen.getByText('承認済み修正案1')).toBeInTheDocument()
    })
    
    const revisionCard = screen.getByText('承認済み修正案1').closest('button')
    await user.click(revisionCard!)
    
    expect(mockPush).toHaveBeenCalledWith('/revisions/approved-1')
  })

  it('has proper accessibility attributes', async () => {
    render(<ApprovedRevisionsList />)
    
    // Check main landmark
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('aria-label', '承認済み修正案一覧')
    
    await waitFor(() => {
      expect(screen.getByText('承認済み修正案1')).toBeInTheDocument()
    })
    
    // Check interactive elements
    const revisionCards = screen.getAllByRole('button')
    revisionCards.forEach(card => {
      expect(card).toHaveAttribute('aria-label')
      expect(card).toHaveAttribute('tabindex', '0')
    })
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<ApprovedRevisionsList />)
    
    await waitFor(() => {
      expect(screen.getByText('承認済み修正案1')).toBeInTheDocument()
    })
    
    const firstCard = screen.getAllByRole('button')[0]
    
    // Focus on first card
    firstCard.focus()
    expect(firstCard).toHaveFocus()
    
    // Press Enter to activate
    await user.keyboard('{Enter}')
    
    expect(mockPush).toHaveBeenCalledWith('/revisions/approved-1')
  })

  it('displays approval metadata correctly', async () => {
    render(<ApprovedRevisionsList />)
    
    await waitFor(() => {
      expect(screen.getByText('承認済み修正案1')).toBeInTheDocument()
    })
    
    // Check metadata display (using getAllByText for multiple elements)
    expect(screen.getAllByText(/提案者:/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('テストユーザー')).toHaveLength(2)
    expect(screen.getAllByText(/承認者:/).length).toBeGreaterThan(0) 
    expect(screen.getAllByText('テスト承認者')).toHaveLength(2)
    expect(screen.getAllByText(/対象記事:/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('テスト記事')).toHaveLength(2)
  })
})