import { http, HttpResponse } from 'msw'

// Mock data generators
const createMockUser = (overrides = {}) => ({
  user_id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  is_active: true,
  ...overrides,
})

const createMockRevision = (overrides = {}) => ({
  revision_id: 'test-revision-id',
  title: 'テスト修正案',
  content: 'テスト用の修正内容です。',
  status: 'draft',
  proposer_id: 'test-user-id',
  target_article_id: 'test-article-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockArticle = (overrides = {}) => ({
  article_id: 'test-article-id',
  article_number: 'ART-001',
  title: 'テスト記事',
  content: 'テスト記事の内容です。',
  info_category: 'general',
  approval_group: 'default',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const handlers = [
  // Authentication endpoints
  http.post('/api/v1/auth/login/json', async ({ request }) => {
    const body = await request.json() as { username: string; password: string }
    
    if (body.username === 'testadmin' && body.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-admin-token',
        token_type: 'bearer',
        user: createMockUser({ 
          username: 'testadmin', 
          email: 'testadmin@example.com',
          role: 'admin' 
        }),
      })
    }
    
    if (body.username === 'testapprover' && body.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-approver-token',
        token_type: 'bearer',
        user: createMockUser({ 
          username: 'testapprover',
          email: 'testapprover@example.com', 
          role: 'approver' 
        }),
      })
    }
    
    if (body.username === 'testuser' && body.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-user-token',
        token_type: 'bearer',
        user: createMockUser(),
      })
    }
    
    // Invalid credentials
    return HttpResponse.json(
      { detail: 'ユーザー名またはパスワードが間違っています' },
      { status: 401 }
    )
  }),

  http.get('/api/v1/auth/me', ({ request }) => {
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const token = authorization.substring(7)
    
    if (token === 'mock-admin-token') {
      return HttpResponse.json(createMockUser({ 
        username: 'testadmin',
        email: 'testadmin@example.com',
        role: 'admin' 
      }))
    }
    
    if (token === 'mock-approver-token') {
      return HttpResponse.json(createMockUser({ 
        username: 'testapprover',
        email: 'testapprover@example.com',
        role: 'approver' 
      }))
    }
    
    return HttpResponse.json(createMockUser())
  }),

  // Revision endpoints
  http.get('/api/v1/revisions/', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    let mockRevisions = [
      createMockRevision({ 
        revision_id: 'rev-1',
        title: 'テスト修正案1', 
        status: 'submitted',
        created_at: '2024-01-01T00:00:00Z',
      }),
      createMockRevision({ 
        revision_id: 'rev-2',
        title: 'テスト修正案2', 
        status: 'approved',
        created_at: '2024-01-02T00:00:00Z',
      }),
      createMockRevision({ 
        revision_id: 'rev-3',
        title: 'テスト修正案3', 
        status: 'draft',
        created_at: '2024-01-03T00:00:00Z',
      }),
    ]
    
    if (status) {
      mockRevisions = mockRevisions.filter(rev => rev.status === status)
    }
    
    return HttpResponse.json(mockRevisions.slice(0, limit))
  }),

  http.post('/api/v1/revisions/', async ({ request }) => {
    const body = await request.json() as { 
      title: string; 
      content: string; 
      target_article_id: string 
    }
    
    const newRevision = createMockRevision({
      revision_id: `rev-${Date.now()}`,
      title: body.title,
      content: body.content,
      target_article_id: body.target_article_id,
    })
    
    return HttpResponse.json(newRevision, { status: 201 })
  }),

  http.get('/api/v1/revisions/:id', ({ params }) => {
    const { id } = params
    
    const revision = createMockRevision({
      revision_id: id,
      title: `修正案 ${id}`,
    })
    
    return HttpResponse.json(revision)
  }),

  http.put('/api/v1/revisions/:id', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as Partial<any>
    
    const updatedRevision = createMockRevision({
      revision_id: id,
      ...body,
      updated_at: new Date().toISOString(),
    })
    
    return HttpResponse.json(updatedRevision)
  }),

  http.delete('/api/v1/revisions/:id', ({ params }) => {
    return HttpResponse.json({ message: 'Revision deleted successfully' })
  }),

  // My revisions endpoint
  http.get('/api/v1/revisions/my-revisions', () => {
    const myRevisions = [
      createMockRevision({ 
        revision_id: 'my-rev-1',
        title: '私の修正案1', 
        status: 'draft' 
      }),
      createMockRevision({ 
        revision_id: 'my-rev-2',
        title: '私の修正案2', 
        status: 'submitted' 
      }),
    ]
    
    return HttpResponse.json(myRevisions)
  }),

  // Approval endpoints
  http.get('/api/v1/approvals/queue', () => {
    const approvalQueue = [
      {
        ...createMockRevision({ 
          revision_id: 'pending-1',
          title: '承認待ち修正案1', 
          status: 'submitted' 
        }),
        priority: 'high',
        submitted_at: '2024-01-01T10:00:00Z',
      },
      {
        ...createMockRevision({ 
          revision_id: 'pending-2',
          title: '承認待ち修正案2', 
          status: 'submitted' 
        }),
        priority: 'medium',
        submitted_at: '2024-01-02T10:00:00Z',
      },
    ]
    
    return HttpResponse.json(approvalQueue)
  }),

  http.post('/api/v1/approvals/:id/decide', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as { 
      action: 'approve' | 'reject'; 
      comment?: string 
    }
    
    const updatedRevision = createMockRevision({
      revision_id: id,
      status: body.action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString(),
      ...(body.action === 'approve' && { approved_at: new Date().toISOString() }),
    })
    
    return HttpResponse.json(updatedRevision)
  }),

  // Articles endpoints
  http.get('/api/v1/articles/', () => {
    const articles = [
      createMockArticle({
        article_id: 'art-1',
        title: 'テスト記事1',
      }),
      createMockArticle({
        article_id: 'art-2',
        title: 'テスト記事2',
      }),
    ]
    
    return HttpResponse.json(articles)
  }),

  http.get('/api/v1/articles/:id', ({ params }) => {
    const { id } = params
    
    const article = createMockArticle({
      article_id: id,
      title: `記事 ${id}`,
    })
    
    return HttpResponse.json(article)
  }),

  // System health check
  http.get('/api/v1/system/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  }),
]