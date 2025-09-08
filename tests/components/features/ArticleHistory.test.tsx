import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticleHistory } from '../../../app/components/features/ArticleHistory'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock data factory for article history
const createMockHistoryEntry = (overrides = {}) => ({
  version_id: 'v1',
  revision_id: 'rev-1',
  article_id: 'art-1',
  title: 'テスト記事履歴',
  content: 'テスト用の記事内容です。',
  version_number: 1,
  change_type: 'created',
  editor_id: 'editor-1',
  editor_name: 'テスト編集者',
  approved_by: 'テスト承認者',
  created_at: '2024-01-01T00:00:00Z',
  summary: 'Initial version created',
  ...overrides,
})

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('ArticleHistory', () => {
  const defaultProps = {
    articleId: 'test-article-1',
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    mockPush.mockClear()

    // Mock successful API response
    server.use(
      http.get('/api/v1/articles/:id/history', ({ params }) => {
        const { id } = params
        return HttpResponse.json([
          createMockHistoryEntry({
            version_id: 'v3',
            version_number: 3,
            change_type: 'updated',
            created_at: '2024-01-03T00:00:00Z',
            summary: 'Fixed typos in section 2',
          }),
          createMockHistoryEntry({
            version_id: 'v2', 
            version_number: 2,
            change_type: 'updated',
            created_at: '2024-01-02T00:00:00Z',
            summary: 'Added new section on best practices',
          }),
          createMockHistoryEntry({
            version_id: 'v1',
            version_number: 1,
            change_type: 'created',
            created_at: '2024-01-01T00:00:00Z',
            summary: 'Initial version created',
          }),
        ])
      })
    )
  })

  it('renders article history with proper heading', async () => {
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /記事履歴/i })).toBeInTheDocument()
      expect(screen.getByText(/記事の変更履歴を表示します/i)).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<ArticleHistory {...defaultProps} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText(/読み込み中/i)).toBeInTheDocument()
  })

  it('displays history entries in chronological order (newest first)', async () => {
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('バージョン 3')).toBeInTheDocument()
      expect(screen.getByText('バージョン 2')).toBeInTheDocument()
      expect(screen.getByText('バージョン 1')).toBeInTheDocument()
    })

    // Check order (newest first)
    const versionHeaders = screen.getAllByText(/バージョン \d+/)
    expect(versionHeaders[0]).toHaveTextContent('バージョン 3')
    expect(versionHeaders[1]).toHaveTextContent('バージョン 2')
    expect(versionHeaders[2]).toHaveTextContent('バージョン 1')
  })

  it('displays history entry details correctly', async () => {
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Fixed typos in section 2')).toBeInTheDocument()
      expect(screen.getByText('Added new section on best practices')).toBeInTheDocument()
      expect(screen.getByText('Initial version created')).toBeInTheDocument()
    })

    // Check metadata
    expect(screen.getAllByText('テスト編集者')).toHaveLength(3)
    expect(screen.getAllByText('テスト承認者')).toHaveLength(3)
    expect(screen.getByText('2024/01/03')).toBeInTheDocument()
    expect(screen.getByText('2024/01/02')).toBeInTheDocument()
    expect(screen.getByText('2024/01/01')).toBeInTheDocument()
  })

  it('shows different icons for different change types', async () => {
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('バージョン 3')).toBeInTheDocument()
    })

    // Check for change type indicators
    expect(screen.getAllByText('更新')).toHaveLength(2) // v3 and v2: updated
    expect(screen.getByText('作成')).toBeInTheDocument() // v1: created
  })

  it('shows empty state when no history exists', async () => {
    server.use(
      http.get('/api/v1/articles/:id/history', () => {
        return HttpResponse.json([])
      })
    )
    
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/履歴がありません/i)).toBeInTheDocument()
      expect(screen.getByText(/記事の変更履歴がまだありません/i)).toBeInTheDocument()
    })
  })

  it('displays error state when API fails', async () => {
    server.use(
      http.get('/api/v1/articles/:id/history', () => {
        return HttpResponse.error()
      })
    )
    
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /再読み込み/i })).toBeInTheDocument()
    })
  })

  it('allows retrying after error', async () => {
    const user = userEvent.setup()
    
    // First request fails
    server.use(
      http.get('/api/v1/articles/:id/history', () => {
        return HttpResponse.error()
      })
    )
    
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument()
    })
    
    // Mock successful retry
    server.use(
      http.get('/api/v1/articles/:id/history', () => {
        return HttpResponse.json([
          createMockHistoryEntry({ summary: 'リトライ成功' })
        ])
      })
    )
    
    const retryButton = screen.getByRole('button', { name: /再読み込み/i })
    await user.click(retryButton)
    
    await waitFor(() => {
      expect(screen.getByText('リトライ成功')).toBeInTheDocument()
    })
  })

  it('navigates to version comparison when compare button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('バージョン 3')).toBeInTheDocument()
    })
    
    const compareButton = screen.getAllByRole('button', { name: /比較/i })[0]
    await user.click(compareButton)
    
    expect(mockPush).toHaveBeenCalledWith('/articles/test-article-1/compare?from=v2&to=v3')
  })

  it('has proper accessibility attributes', async () => {
    render(<ArticleHistory {...defaultProps} />)
    
    // Check main landmark
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('aria-label', '記事履歴')
    
    await waitFor(() => {
      expect(screen.getByText('バージョン 3')).toBeInTheDocument()
    })
    
    // Check timeline structure
    const timeline = screen.getByRole('list', { name: /履歴タイムライン/i })
    expect(timeline).toBeInTheDocument()
    
    const timelineItems = screen.getAllByRole('listitem')
    expect(timelineItems).toHaveLength(3)
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('バージョン 3')).toBeInTheDocument()
    })
    
    const compareButtons = screen.getAllByRole('button', { name: /比較/i })
    
    // Tab to first compare button
    await user.tab()
    expect(compareButtons[0]).toHaveFocus()
    
    // Press Enter to activate
    await user.keyboard('{Enter}')
    
    expect(mockPush).toHaveBeenCalledWith('/articles/test-article-1/compare?from=v2&to=v3')
  })

  it('formats dates correctly in Japanese locale', async () => {
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('2024/01/03')).toBeInTheDocument()
    })

    // Check Japanese date formatting
    expect(screen.getByText('2024/01/03')).toBeInTheDocument()
    expect(screen.getByText('2024/01/02')).toBeInTheDocument()
    expect(screen.getByText('2024/01/01')).toBeInTheDocument()
  })

  it('displays change summary with proper truncation for long text', async () => {
    server.use(
      http.get('/api/v1/articles/:id/history', () => {
        return HttpResponse.json([
          createMockHistoryEntry({
            summary: 'This is a very long summary that should be truncated when displayed to ensure the UI remains clean and readable without overwhelming the user with too much text in a single line',
          }),
        ])
      })
    )
    
    render(<ArticleHistory {...defaultProps} />)
    
    await waitFor(() => {
      const summaryText = screen.getByText(/This is a very long summary/)
      expect(summaryText).toBeInTheDocument()
      
      // Check if summary is displayed with ellipsis or truncation
      const summaryElement = summaryText.closest('.line-clamp-2, .truncate')
      expect(summaryElement).toBeTruthy()
    })
  })
})