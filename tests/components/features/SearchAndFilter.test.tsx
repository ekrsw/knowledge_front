import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchAndFilter } from '../../../app/components/features/SearchAndFilter'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock data factory for search results
const createMockSearchResult = (overrides = {}) => ({
  id: 'search-result-1',
  title: 'テスト記事タイトル',
  content: 'テスト記事の内容です。検索キーワードを含んでいます。',
  article_number: 'ART-001',
  info_category: 'general',
  approval_group: 'default',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  author: 'テスト投稿者',
  status: 'published',
  tags: ['テスト', 'タグ'],
  ...overrides,
})

const createMockRevisionResult = (overrides = {}) => ({
  revision_id: 'rev-1',
  title: 'テスト修正案',
  content: 'テスト修正案の内容です。',
  status: 'submitted',
  proposer_id: 'user-1',
  proposer_name: 'テスト提案者',
  target_article_id: 'art-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('SearchAndFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock successful search response
    server.use(
      http.get('/api/v1/search', ({ request }) => {
        const url = new URL(request.url)
        const query = url.searchParams.get('q')
        const type = url.searchParams.get('type')
        const category = url.searchParams.get('category')
        const status = url.searchParams.get('status')

        if (query === 'テスト') {
          let results = [
            createMockSearchResult({
              id: 'art-1',
              title: 'テスト記事1',
              content: 'テスト記事1の内容です。',
            }),
            createMockSearchResult({
              id: 'art-2', 
              title: 'テスト記事2',
              content: 'テスト記事2の内容です。',
              info_category: 'technical',
            }),
          ]

          // Filter by category if specified
          if (category === 'technical') {
            results = results.filter(r => r.info_category === 'technical')
          }

          return HttpResponse.json({
            total: results.length,
            results,
          })
        }

        return HttpResponse.json({
          total: 0,
          results: [],
        })
      })
    )
  })

  it('renders search form with proper elements', () => {
    render(<SearchAndFilter />)

    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByLabelText(/検索キーワード/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /検索/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/カテゴリー/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ステータス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/タイプ/i)).toBeInTheDocument()
  })

  it('performs search when form is submitted', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事1'
      })).toBeInTheDocument()
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事2'
      })).toBeInTheDocument()
    })

    expect(screen.getByText(/検索結果: 2件/i)).toBeInTheDocument()
  })

  it('performs search on Enter key press', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    
    await user.type(searchInput, 'テスト')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事1'
      })).toBeInTheDocument()
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事2'
      })).toBeInTheDocument()
    })
  })

  it('shows loading state during search', async () => {
    const user = userEvent.setup()
    
    // Delay the response to catch loading state
    server.use(
      http.get('/api/v1/search', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return HttpResponse.json({ total: 0, results: [] })
      })
    )

    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    expect(screen.getByTestId('search-loading')).toBeInTheDocument()
    expect(screen.getByText(/検索中/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('search-loading')).not.toBeInTheDocument()
    })
  })

  it('displays empty state when no results found', async () => {
    const user = userEvent.setup()
    
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.json({ total: 0, results: [] })
      })
    )

    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    await user.type(searchInput, '存在しないキーワード')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText(/検索結果が見つかりませんでした/i)).toBeInTheDocument()
      expect(screen.getByText(/検索条件を変更してお試しください/i)).toBeInTheDocument()
    })
  })

  it('filters results by category', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilter />)

    const categorySelect = screen.getByLabelText(/カテゴリー/i)
    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    await user.selectOptions(categorySelect, 'technical')
    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事2'
      })).toBeInTheDocument()
    })

    // Should only show technical category results
    expect(screen.queryByText((content, element) => {
      return element?.textContent === 'テスト記事1'
    })).not.toBeInTheDocument()
  })

  it('filters results by status', async () => {
    const user = userEvent.setup()
    
    server.use(
      http.get('/api/v1/search', ({ request }) => {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        
        if (status === 'published') {
          return HttpResponse.json({
            total: 1,
            results: [
              createMockSearchResult({
                id: 'pub-1',
                title: '公開記事',
                status: 'published',
              })
            ],
          })
        }

        return HttpResponse.json({ total: 0, results: [] })
      })
    )

    render(<SearchAndFilter />)

    const statusSelect = screen.getByLabelText(/ステータス/i)
    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    await user.selectOptions(statusSelect, 'published')
    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('公開記事')).toBeInTheDocument()
    })
  })

  it('filters results by type (articles vs revisions)', async () => {
    const user = userEvent.setup()
    
    server.use(
      http.get('/api/v1/search', ({ request }) => {
        const url = new URL(request.url)
        const type = url.searchParams.get('type')
        
        if (type === 'revisions') {
          return HttpResponse.json({
            total: 1,
            results: [
              createMockRevisionResult({
                revision_id: 'rev-1',
                title: 'テスト修正案',
              })
            ],
          })
        }

        return HttpResponse.json({
          total: 1,
          results: [
            createMockSearchResult({
              id: 'art-1',
              title: 'テスト記事',
            })
          ],
        })
      })
    )

    render(<SearchAndFilter />)

    const typeSelect = screen.getByLabelText(/タイプ/i)
    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    // Test revisions filter
    await user.selectOptions(typeSelect, 'revisions')
    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト修正案'
      })).toBeInTheDocument()
    })
  })

  it('shows error state when search fails', async () => {
    const user = userEvent.setup()
    
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.error()
      })
    )

    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText(/検索エラーが発生しました/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /再検索/i })).toBeInTheDocument()
    })
  })

  it('allows retrying after search error', async () => {
    const user = userEvent.setup()
    
    // First request fails
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.error()
      })
    )

    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText(/検索エラーが発生しました/i)).toBeInTheDocument()
    })

    // Mock successful retry
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.json({
          total: 1,
          results: [
            createMockSearchResult({ title: 'リトライ成功' })
          ],
        })
      })
    )

    const retryButton = screen.getByRole('button', { name: /再検索/i })
    await user.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('リトライ成功')).toBeInTheDocument()
    })
  })

  it('clears search results when search input is emptied', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    // Perform initial search
    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事1'
      })).toBeInTheDocument()
    })

    // Clear search input
    await user.clear(searchInput)
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.queryByText((content, element) => {
        return element?.textContent === 'テスト記事1'
      })).not.toBeInTheDocument()
    })

    // Should show empty results message when searched with empty input
    expect(screen.getByText(/検索結果が見つかりませんでした/i)).toBeInTheDocument()
  })

  it('resets filters to default values', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilter />)

    const categorySelect = screen.getByLabelText(/カテゴリー/i) as HTMLSelectElement
    const statusSelect = screen.getByLabelText(/ステータス/i) as HTMLSelectElement
    const typeSelect = screen.getByLabelText(/タイプ/i) as HTMLSelectElement
    const resetButton = screen.getByRole('button', { name: /リセット/i })

    // Change filters
    await user.selectOptions(categorySelect, 'technical')
    await user.selectOptions(statusSelect, 'published')
    await user.selectOptions(typeSelect, 'revisions')

    expect(categorySelect.value).toBe('technical')
    expect(statusSelect.value).toBe('published')
    expect(typeSelect.value).toBe('revisions')

    // Reset filters
    await user.click(resetButton)

    expect(categorySelect.value).toBe('')
    expect(statusSelect.value).toBe('')
    expect(typeSelect.value).toBe('all')
  })

  it('has proper accessibility attributes', () => {
    render(<SearchAndFilter />)

    // Check main search landmark
    const searchForm = screen.getByRole('search')
    expect(searchForm).toBeInTheDocument()

    // Check form labels and inputs
    expect(screen.getByLabelText(/検索キーワード/i)).toHaveAttribute('type', 'search')
    expect(screen.getByLabelText(/カテゴリー/i)).toHaveAttribute('aria-label', 'カテゴリーでフィルター')
    expect(screen.getByLabelText(/ステータス/i)).toHaveAttribute('aria-label', 'ステータスでフィルター')
    expect(screen.getByLabelText(/タイプ/i)).toHaveAttribute('aria-label', 'タイプでフィルター')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const categorySelect = screen.getByLabelText(/カテゴリー/i)
    const statusSelect = screen.getByLabelText(/ステータス/i)
    const typeSelect = screen.getByLabelText(/タイプ/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    // Tab through form elements
    await user.tab()
    expect(searchInput).toHaveFocus()

    await user.tab()
    expect(searchButton).toHaveFocus()

    await user.tab()
    expect(categorySelect).toHaveFocus()

    await user.tab()
    expect(statusSelect).toHaveFocus()

    await user.tab()
    expect(typeSelect).toHaveFocus()

    // Should be able to submit with Enter
    await user.clear(searchInput)
    await user.type(searchInput, 'テスト')
    searchButton.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事1'
      })).toBeInTheDocument()
    })
  })

  it('highlights search keywords in results', async () => {
    const user = userEvent.setup()
    
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.json({
          total: 1,
          results: [
            createMockSearchResult({
              title: 'テスト記事のタイトル',
              content: 'この記事にはテストキーワードが含まれています。',
            })
          ],
        })
      })
    )

    render(<SearchAndFilter />)

    const searchInput = screen.getByLabelText(/検索キーワード/i)
    const searchButton = screen.getByRole('button', { name: /検索/i })

    await user.type(searchInput, 'テスト')
    await user.click(searchButton)

    await waitFor(() => {
      // Check if search keywords are highlighted
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事のタイトル'
      })).toBeInTheDocument()
      
      // Check if the highlight contains the search keyword (via dangerouslySetInnerHTML)
      const titleElement = screen.getByText((content, element) => {
        return element?.textContent === 'テスト記事のタイトル'
      })
      expect(titleElement.innerHTML).toContain('search-highlight')
    })
  })
})