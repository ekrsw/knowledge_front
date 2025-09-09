/**
 * API Services Layer
 * Type-safe service layer for all KSAP API endpoints
 */

import { apiClient, ApiResponse } from './api-client';

// ============================================================================
// TYPE DEFINITIONS (Based on KSAP API Specification)
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'reviewer' | 'contributor' | 'reader';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: User;
  category_id: string;
  category: Category;
  tags: Tag[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';
  version: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  parent?: Category;
  children: Category[];
  article_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  articles: Article[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  facets: {
    categories: { id: string; name: string; count: number }[];
    tags: { id: string; name: string; count: number }[];
    authors: { id: string; name: string; count: number }[];
  };
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user: User;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'article_update' | 'review_request' | 'approval' | 'rejection' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

// Request/Response types
export interface CreateArticleRequest {
  title: string;
  content: string;
  category_id: string;
  tags?: string[];
  status?: 'draft' | 'pending_review';
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  version: number;
}

export interface SearchRequest {
  q?: string;
  category_id?: string;
  tags?: string[];
  author_id?: string;
  status?: string[];
  page?: number;
  per_page?: number;
  sort_by?: 'relevance' | 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// API SERVICES
// ============================================================================

/**
 * Authentication Service
 * Enhanced for Phase 1 real backend integration with localhost:8000
 */
export const AuthService = {
  /**
   * Login with username/email and password
   * Supports test users from docs/test-users.md
   */
  async login(username: string, password: string): Promise<ApiResponse<{ access_token: string; token_type: string; user?: User }>> {
    // Try primary login endpoint first
    let response = await apiClient.authenticate(username, password);
    
    // If that fails, try alternate endpoints that might exist
    if (!response.success && response.status === 404) {
      // Try JSON login endpoint as documented in test-users.md
      response = await apiClient.post('/api/v1/auth/login/json', {
        username,
        password
      });
      
      // If JSON endpoint also fails, try form-based endpoint
      if (!response.success && response.status === 404) {
        response = await apiClient.post('/api/v1/auth/login', {
          username,
          password
        });
      }
    }
    
    return response;
  },

  /**
   * Login specifically with email (alternative to username)
   */
  async loginWithEmail(email: string, password: string): Promise<ApiResponse<{ access_token: string; token_type: string; user?: User }>> {
    return this.login(email, password);
  },

  async logout(): Promise<void> {
    apiClient.logout();
  },

  /**
   * Get current authenticated user profile
   * Tries multiple possible endpoints
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    // Try the most common endpoint first
    let response = await apiClient.get<User>('/api/v1/users/me');
    
    // Fallback to alternate endpoints if needed
    if (!response.success && response.status === 404) {
      response = await apiClient.get<User>('/auth/me');
    }
    
    if (!response.success && response.status === 404) {
      response = await apiClient.get<User>('/me');
    }
    
    return response;
  },

  async refreshToken(): Promise<boolean> {
    return apiClient.refreshToken();
  },

  getAuthStatus() {
    return apiClient.getAuthStatus();
  },

  /**
   * Verify token is still valid
   */
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; expires_at?: string }>> {
    return apiClient.get('/api/v1/auth/verify');
  },

  /**
   * Test connection to auth endpoints
   */
  async testConnection(): Promise<ApiResponse<{ status: string }>> {
    return apiClient.get('/api/v1/auth/status');
  }
};

/**
 * User Management Service
 * Updated for Phase 1 real backend integration
 */
export const UserService = {
  async getUsers(page = 1, per_page = 20): Promise<ApiResponse<{ users: User[]; total: number; page: number; per_page: number }>> {
    return apiClient.get<any>(`/api/v1/users?page=${page}&per_page=${per_page}`);
  },

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/api/v1/users/${userId}`);
  },

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/api/v1/users', userData);
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/api/v1/users/${userId}`, userData);
  },

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/v1/users/${userId}`);
  },

  async updateUserRole(userId: string, role: User['role']): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(`/api/v1/users/${userId}/role`, { role });
  }
};

/**
 * Article Management Service  
 * Updated for Phase 1 real backend integration
 */
export const ArticleService = {
  async getArticles(params: SearchRequest = {}): Promise<ApiResponse<{ articles: Article[]; total: number; page: number; per_page: number }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    return apiClient.get<any>(`/api/v1/articles?${queryParams.toString()}`);
  },

  async getArticle(articleId: string): Promise<ApiResponse<Article>> {
    return apiClient.get<Article>(`/api/v1/articles/${articleId}`);
  },

  async createArticle(articleData: CreateArticleRequest): Promise<ApiResponse<Article>> {
    return apiClient.post<Article>('/api/v1/articles', articleData);
  },

  async updateArticle(articleId: string, articleData: UpdateArticleRequest): Promise<ApiResponse<Article>> {
    return apiClient.put<Article>(`/api/v1/articles/${articleId}`, articleData);
  },

  async deleteArticle(articleId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/v1/articles/${articleId}`);
  },

  async publishArticle(articleId: string): Promise<ApiResponse<Article>> {
    return apiClient.patch<Article>(`/articles/${articleId}/publish`);
  },

  async unpublishArticle(articleId: string): Promise<ApiResponse<Article>> {
    return apiClient.patch<Article>(`/articles/${articleId}/unpublish`);
  },

  async approveArticle(articleId: string, reviewData?: { comments?: string }): Promise<ApiResponse<Article>> {
    return apiClient.patch<Article>(`/articles/${articleId}/approve`, reviewData);
  },

  async rejectArticle(articleId: string, reviewData: { reason: string; comments?: string }): Promise<ApiResponse<Article>> {
    return apiClient.patch<Article>(`/articles/${articleId}/reject`, reviewData);
  },

  async getArticleHistory(articleId: string): Promise<ApiResponse<Article[]>> {
    return apiClient.get<Article[]>(`/articles/${articleId}/history`);
  },

  async duplicateArticle(articleId: string, newTitle?: string): Promise<ApiResponse<Article>> {
    return apiClient.post<Article>(`/articles/${articleId}/duplicate`, newTitle ? { title: newTitle } : {});
  }
};

/**
 * Search Service
 */
export const SearchService = {
  async search(params: SearchRequest): Promise<ApiResponse<SearchResult>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    return apiClient.get<SearchResult>(`/search?${queryParams.toString()}`);
  },

  async getSuggestions(query: string, limit = 10): Promise<ApiResponse<{ suggestions: string[] }>> {
    return apiClient.get<any>(`/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  async getPopularSearches(limit = 10): Promise<ApiResponse<{ searches: { query: string; count: number }[] }>> {
    return apiClient.get<any>(`/search/popular?limit=${limit}`);
  }
};

/**
 * Category Management Service
 */
export const CategoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/categories');
  },

  async getCategory(categoryId: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(`/categories/${categoryId}`);
  },

  async createCategory(categoryData: Omit<Category, 'id' | 'children' | 'article_count' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Category>> {
    return apiClient.post<Category>('/categories', categoryData);
  },

  async updateCategory(categoryId: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    return apiClient.put<Category>(`/categories/${categoryId}`, categoryData);
  },

  async deleteCategory(categoryId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/categories/${categoryId}`);
  },

  async getCategoryTree(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/categories/tree');
  }
};

/**
 * Tag Management Service
 */
export const TagService = {
  async getTags(): Promise<ApiResponse<Tag[]>> {
    return apiClient.get<Tag[]>('/tags');
  },

  async getTag(tagId: string): Promise<ApiResponse<Tag>> {
    return apiClient.get<Tag>(`/tags/${tagId}`);
  },

  async createTag(tagData: Omit<Tag, 'id' | 'usage_count' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Tag>> {
    return apiClient.post<Tag>('/tags', tagData);
  },

  async updateTag(tagId: string, tagData: Partial<Tag>): Promise<ApiResponse<Tag>> {
    return apiClient.put<Tag>(`/tags/${tagId}`, tagData);
  },

  async deleteTag(tagId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/tags/${tagId}`);
  },

  async getPopularTags(limit = 20): Promise<ApiResponse<Tag[]>> {
    return apiClient.get<Tag[]>(`/tags/popular?limit=${limit}`);
  }
};

/**
 * Activity & Analytics Service
 */
export const ActivityService = {
  async getActivityLogs(page = 1, per_page = 20, user_id?: string): Promise<ApiResponse<{ logs: ActivityLog[]; total: number; page: number; per_page: number }>> {
    const params = new URLSearchParams({ page: page.toString(), per_page: per_page.toString() });
    if (user_id) params.append('user_id', user_id);
    return apiClient.get<any>(`/activity?${params.toString()}`);
  },

  async getUserActivity(userId: string, page = 1, per_page = 20): Promise<ApiResponse<{ logs: ActivityLog[]; total: number }>> {
    return apiClient.get<any>(`/users/${userId}/activity?page=${page}&per_page=${per_page}`);
  },

  async getSystemStats(): Promise<ApiResponse<{
    total_articles: number;
    total_users: number;
    articles_this_month: number;
    active_users_this_month: number;
    popular_categories: { category: Category; count: number }[];
    popular_tags: { tag: Tag; count: number }[];
  }>> {
    return apiClient.get<any>('/stats');
  }
};

/**
 * Notification Service
 */
export const NotificationService = {
  async getNotifications(page = 1, per_page = 20, unread_only = false): Promise<ApiResponse<{ notifications: Notification[]; total: number; unread_count: number }>> {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      per_page: per_page.toString(),
      unread_only: unread_only.toString()
    });
    return apiClient.get<any>(`/notifications?${params.toString()}`);
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/notifications/read-all');
  },

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/notifications/${notificationId}`);
  },

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<any>('/notifications/unread-count');
  }
};

/**
 * File Upload Service
 */
export const FileService = {
  async uploadFile(file: File, type: 'image' | 'document' = 'document'): Promise<ApiResponse<{ url: string; filename: string; size: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return apiClient.request<any>('/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });
  },

  async deleteFile(filename: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/upload/${filename}`);
  }
};

// Export all services as a combined object
export const ApiServices = {
  auth: AuthService,
  users: UserService,
  articles: ArticleService,
  search: SearchService,
  categories: CategoryService,
  tags: TagService,
  activity: ActivityService,
  notifications: NotificationService,
  files: FileService
};

export default ApiServices;