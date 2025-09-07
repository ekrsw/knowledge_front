# 技術仕様書 - ナレッジ承認ワークフローシステム

## システムアーキテクチャ

### 全体構成
```
┌─────────────────┐    ┌─────────────────┐
│   Next.js 15    │    │    FastAPI      │
│  (Frontend)     │◄──►│   (Backend)     │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Browser   │ │    │ │  Database   │ │
│ │   (JWT)     │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
```

### 認証フロー
```
1. User Login → FastAPI
2. FastAPI → JWT Token (with role)
3. Frontend → localStorage.setItem('token', jwt)
4. API Requests → Authorization: Bearer <token>
5. Token Expiry → Auto Logout
```

## データモデル

### JWT Payload
```typescript
interface JWTPayload {
  sub: string;           // user_id
  role: 'admin' | 'approver' | 'user';
  exp: number;           // expiration timestamp
  iat: number;           // issued at timestamp
}
```

### Revision Status Flow
```
[*] → draft → submitted → approved → [*]
        ↓         ↓         
     deleted      ↓         
        ↓         ↓         
       [*]    rejected → [*]
               ↑
               ↓ (差戻し)
             draft
```

#### Status Transitions
- **draft**: 提出 → submitted, 削除 → deleted
- **submitted**: 承認 → approved, 却下 → rejected, 差戻し → draft, 強制削除 → deleted  
- **approved**: 最終状態
- **rejected**: 最終状態
- **deleted**: 最終状態

### Main Entities
```typescript
// Revision (修正案)
interface Revision {
  revision_id: string;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'deleted';
  proposer_id: string;
  target_article_id: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
}

// User
interface User {
  user_id: string;
  username: string;
  email: string;
  role: 'admin' | 'approver' | 'user';
  is_active: boolean;
}

// Article
interface Article {
  article_id: string;
  article_number: string;
  title: string;
  content: string;
  info_category: string;
  approval_group: string;
  created_at: string;
  updated_at: string;
}
```

## API エンドポイント仕様

### 認証関連
```
POST /api/v1/auth/login
- Body: { username, password }
- Response: { access_token, token_type, role }

GET /api/v1/auth/me
- Headers: Authorization: Bearer <token>
- Response: User info
```

### 修正案関連
```
GET /api/v1/revisions/
- Query: ?status=submitted&limit=50
- Response: Revision[]

GET /api/v1/revisions/my-revisions
- Headers: Authorization: Bearer <token>
- Response: User's revisions

POST /api/v1/revisions/
- Body: { title, content, target_article_id }
- Response: Created revision

PUT /api/v1/revisions/{revision_id}
- Body: Partial revision data
- Response: Updated revision
```

### 承認関連
```
GET /api/v1/approvals/queue
- Headers: Authorization: Bearer <token>
- Response: Pending revisions for approval

POST /api/v1/approvals/{revision_id}/decide
- Body: { action: 'approve' | 'reject', comment? }
- Response: Approval result
```

## フロントエンド実装仕様

### 状態管理
```typescript
// Zustand Store
interface AppStore {
  // Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setError: (error: string) => void;
}
```

### API Client
```typescript
// Axios Configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Route Protection
```typescript
// Middleware
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Role-based access control
  const payload = parseJWT(token);
  if (request.nextUrl.pathname.startsWith('/pending') && 
      !['admin', 'approver'].includes(payload.role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

## コンポーネント設計

### Layout Components
```typescript
// DashboardLayout
interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

// Sidebar Navigation
const navigationItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/revisions', label: '修正案一覧', icon: FileText },
  { href: '/my-revisions', label: '自分の修正案', icon: User },
  { href: '/approved', label: '承認済み', icon: CheckCircle },
  { href: '/pending', label: '承認待ち', icon: Clock, roles: ['admin', 'approver'] },
  { href: '/create', label: '新規作成', icon: Plus },
];
```

### Data Components
```typescript
// RevisionTable
interface RevisionTableProps {
  revisions: Revision[];
  onStatusChange?: (revisionId: string, status: RevisionStatus) => void;
  showActions?: boolean;
}

// StatusBadge
interface StatusBadgeProps {
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'deleted';
}
```

### Form Components
```typescript
// RevisionForm
interface RevisionFormData {
  title: string;
  content: string;
  target_article_id: string;
  comment?: string;
}

// Using React Hook Form
const form = useForm<RevisionFormData>({
  resolver: zodResolver(revisionSchema),
});
```

## セキュリティ実装

### Input Validation
```typescript
// Zod Schemas
const revisionSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  target_article_id: z.string().uuid(),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
```

### XSS Prevention
```typescript
// DOMPurify for content sanitization
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userInput);
```

### CSRF Protection
```typescript
// Next.js CSRF protection
import { getCsrfToken } from 'next-auth/react';

const csrfToken = await getCsrfToken();
```

## パフォーマンス最適化

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    },
  },
});
```

### Lazy Loading
```typescript
// Dynamic imports for route components
const PendingPage = dynamic(() => import('./pending/page'), {
  loading: () => <LoadingSkeleton />,
});
```

### Bundle Optimization
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

## 環境設定

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## デプロイメント

### Build Process
```bash
# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
```

### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```