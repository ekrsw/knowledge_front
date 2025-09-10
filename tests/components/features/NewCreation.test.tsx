import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NewCreation } from '../../../app/components/features/NewCreation'
import { articlesApi } from '../../../app/lib/api/articles'
import { Category } from '../../../app/types/article'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock the articles API
jest.mock('../../../app/lib/api/articles')
const mockArticlesApi = articlesApi as jest.Mocked<typeof articlesApi>

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
const mockCategories: Category[] = [
  {
    category_id: 'cat-1',
    name: 'Technical',
    description: 'Technical articles',
    is_active: true,
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    category_id: 'cat-2',
    name: 'Business',
    description: 'Business articles',
    is_active: true,
    created_at: '2024-01-01T10:00:00Z'
  }
]

// Mock success response for article creation
const mockCreateResponse = {
  article_id: 'art-123',
  revision_id: 'rev-123',
  status: 'draft' as const
}

describe('NewCreation', () => {
  const Wrapper = createWrapper()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock categories endpoint
    mockArticlesApi.getCategories.mockResolvedValue({
      data: mockCategories,
      status: 200,
      success: true
    })
    
    // Mock create article endpoint
    mockArticlesApi.createArticle.mockResolvedValue({
      data: mockCreateResponse,
      status: 201,
      success: true
    })
    
    // Mock draft save endpoint
    mockArticlesApi.saveDraft.mockResolvedValue({
      data: {
        draft_id: 'draft-123',
        title: 'Test Draft',
        content: 'Draft content',
        category_id: 'cat-1',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        created_by: 'user-1'
      },
      status: 201,
      success: true
    })
  })

  it('renders the form with all required fields', async () => {
    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /create article/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument()
  })

  it('loads and displays categories in select', async () => {
    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Technical')).toBeInTheDocument()
    })

    // Open the select dropdown
    const categorySelect = screen.getByLabelText(/category/i)
    fireEvent.click(categorySelect)
    
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create article/i })).toBeInTheDocument()
    })

    // Try to submit without filling required fields
    const createButton = screen.getByRole('button', { name: /create article/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/content is required/i)).toBeInTheDocument()
    })
  })

  it('creates an article successfully', async () => {
    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Article' }
    })
    
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'This is test content for the article.' }
    })

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create article/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockArticlesApi.createArticle).toHaveBeenCalledWith({
        title: 'Test Article',
        content: 'This is test content for the article.',
        category_id: 'cat-1', // First category should be selected by default
        tags: [],
        save_as_draft: false
      })
    })

    // Should show success message
    expect(screen.getByText(/article created successfully/i)).toBeInTheDocument()
  })

  it('saves article as draft', async () => {
    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Draft Article' }
    })
    
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'This is draft content.' }
    })

    // Save as draft
    const draftButton = screen.getByRole('button', { name: /save as draft/i })
    fireEvent.click(draftButton)

    await waitFor(() => {
      expect(mockArticlesApi.saveDraft).toHaveBeenCalledWith({
        title: 'Draft Article',
        content: 'This is draft content.',
        category_id: 'cat-1',
        tags: []
      })
    })

    // Should show success message
    expect(screen.getByText(/draft saved successfully/i)).toBeInTheDocument()
  })

  it('handles tags input', async () => {
    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    })

    const tagsInput = screen.getByLabelText(/tags/i)
    fireEvent.change(tagsInput, {
      target: { value: 'tag1, tag2, tag3' }
    })

    expect(tagsInput).toHaveValue('tag1, tag2, tag3')

    // Fill other required fields and submit
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Tagged Article' }
    })
    
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Content with tags.' }
    })

    const createButton = screen.getByRole('button', { name: /create article/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockArticlesApi.createArticle).toHaveBeenCalledWith({
        title: 'Tagged Article',
        content: 'Content with tags.',
        category_id: 'cat-1',
        tags: ['tag1', 'tag2', 'tag3'],
        save_as_draft: false
      })
    })
  })

  it('handles API errors gracefully', async () => {
    mockArticlesApi.createArticle.mockResolvedValue({
      data: undefined,
      status: 500,
      success: false,
      error: 'Server error'
    })

    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Article' }
    })
    
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test content' }
    })

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create article/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to create article/i)).toBeInTheDocument()
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    // Delay the API response
    mockArticlesApi.createArticle.mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          data: mockCreateResponse,
          status: 201,
          success: true
        }), 100)
      )
    )

    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Article' }
    })
    
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Test content' }
    })

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create article/i })
    fireEvent.click(createButton)

    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(createButton).toBeDisabled()

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/article created successfully/i)).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', async () => {
    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    // Check form controls have proper labels
    const titleInput = screen.getByLabelText(/title/i)
    const contentTextarea = screen.getByLabelText(/content/i)
    const categorySelect = screen.getByLabelText(/category/i)
    
    expect(titleInput).toHaveAttribute('required')
    expect(contentTextarea).toHaveAttribute('required')
    expect(categorySelect).toHaveAttribute('required')
    
    // Check ARIA attributes
    expect(titleInput).toHaveAttribute('aria-required', 'true')
    expect(contentTextarea).toHaveAttribute('aria-required', 'true')
  })

  it('resets form after successful submission', async () => {
    render(
      <Wrapper>
        <NewCreation />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    // Fill in the form
    const titleInput = screen.getByLabelText(/title/i)
    const contentTextarea = screen.getByLabelText(/content/i)
    
    fireEvent.change(titleInput, { target: { value: 'Test Article' } })
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } })

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create article/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/article created successfully/i)).toBeInTheDocument()
    })

    // Form should be reset
    expect(titleInput).toHaveValue('')
    expect(contentTextarea).toHaveValue('')
  })
})