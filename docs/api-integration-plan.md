# API統合計画書

## 接続テスト戦略

### Phase 1: 基本接続確認
1. **ヘルスチェック**: `/api/v1/system/health`
2. **認証テスト**: `/api/v1/auth/login`
3. **トークン検証**: `/api/v1/auth/me`

### Phase 2: コアAPI確認
1. **修正案取得**: `/api/v1/revisions/`
2. **修正案作成**: `POST /api/v1/revisions/`
3. **承認キュー**: `/api/v1/approvals/queue`

### Phase 3: 統合テスト
1. **エンドツーエンド**: ログイン→データ取得→操作
2. **エラーハンドリング**: 401, 403, 500対応
3. **パフォーマンス**: レスポンス時間測定

## 実装手順

### 1. API Client セットアップ
```typescript
// lib/api-client.ts
import axios, { AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. 認証フック実装
```typescript
// hooks/use-auth.ts
export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
  };
  
  return { login, logout, user, isAuthenticated: !!token };
};
```

### 3. データフェッチング実装
```typescript
// hooks/use-revisions.ts
export const useRevisions = () => {
  return useQuery({
    queryKey: ['revisions'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/revisions/');
      return response.data;
    },
  });
};
```

## テストケース

### 認証テスト
```typescript
describe('Authentication', () => {
  test('successful login', async () => {
    const credentials = { username: 'test', password: 'test123' };
    const result = await authService.login(credentials);
    
    expect(result.access_token).toBeDefined();
    expect(result.user.role).toBeOneOf(['admin', 'approver', 'user']);
  });
  
  test('invalid credentials', async () => {
    const credentials = { username: 'wrong', password: 'wrong' };
    
    await expect(authService.login(credentials))
      .rejects.toThrow('Invalid credentials');
  });
});
```

### API接続テスト
```typescript
describe('API Connection', () => {
  test('health check', async () => {
    const response = await apiClient.get('/api/v1/system/health');
    expect(response.status).toBe(200);
  });
  
  test('authenticated request', async () => {
    // Login first
    const token = await getAuthToken();
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    
    const response = await apiClient.get('/api/v1/auth/me');
    expect(response.data.user_id).toBeDefined();
  });
});
```

## エラーハンドリング戦略

### HTTP Status Code 対応
```typescript
const handleApiError = (error: AxiosError) => {
  switch (error.response?.status) {
    case 401:
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;
    case 403:
      // Insufficient permissions
      toast.error('権限が不足しています');
      break;
    case 404:
      // Resource not found
      toast.error('リソースが見つかりません');
      break;
    case 500:
      // Server error
      toast.error('サーバーエラーが発生しました');
      break;
    default:
      toast.error('予期しないエラーが発生しました');
  }
};
```

### Retry Strategy
```typescript
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000, // Exponential backoff
  retryCondition: (error) => {
    return error.response?.status >= 500 || error.code === 'NETWORK_ERROR';
  },
};
```

## モック実装

### 開発用モックサーバー
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: {
          user_id: '1',
          username: 'testuser',
          role: 'user',
        },
      })
    );
  }),
  
  rest.get('/api/v1/revisions/', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          revision_id: '1',
          title: 'Test Revision',
          status: 'submitted',
          created_at: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),
];
```

## パフォーマンス監視

### API レスポンス時間測定
```typescript
const performanceMonitor = {
  measureApiCall: async (endpoint: string, apiCall: () => Promise<any>) => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`API Call ${endpoint}: ${duration}ms`);
      
      // Send to analytics
      analytics.track('api_performance', {
        endpoint,
        duration,
        success: true,
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      analytics.track('api_performance', {
        endpoint,
        duration,
        success: false,
        error: error.message,
      });
      
      throw error;
    }
  },
};
```

## 設定管理

### 環境別設定
```typescript
// config/api.ts
const config = {
  development: {
    apiUrl: 'http://localhost:8000',
    timeout: 10000,
    retries: 1,
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    timeout: 5000,
    retries: 2,
  },
  production: {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
  },
};

export const apiConfig = config[process.env.NODE_ENV] || config.development;
```

## 統合チェックリスト

### 接続確認項目
- [ ] ヘルスチェックエンドポイント疎通確認
- [ ] CORS設定確認
- [ ] 認証フロー動作確認
- [ ] JWT トークン検証
- [ ] エラーレスポンス形式確認

### データ取得確認項目
- [ ] 修正案一覧取得
- [ ] 個人修正案取得
- [ ] 承認キュー取得
- [ ] 記事データ取得
- [ ] ページネーション動作確認

### 操作確認項目
- [ ] 修正案作成
- [ ] 修正案更新
- [ ] 承認・却下操作
- [ ] ステータス変更
- [ ] 添付ファイル処理（該当する場合）

### セキュリティ確認項目
- [ ] 認証が必要なエンドポイントの保護
- [ ] 権限レベル別アクセス制御
- [ ] トークン有効期限処理
- [ ] 自動ログアウト機能
- [ ] XSS/CSRF対策