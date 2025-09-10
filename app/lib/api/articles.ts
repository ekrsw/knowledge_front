import { apiClient } from '../api-client'
import { 
  Article, 
  Category,
  CategoryTree,
  CreateArticleRequest,
  CreateArticleResponse,
  Draft
} from '../../types/article'

export const articlesApi = {
  /**
   * Create a new article
   */
  async createArticle(data: CreateArticleRequest) {
    return apiClient.post<CreateArticleResponse>('/api/v1/articles', data)
  },

  /**
   * Get article by ID
   */
  async getArticle(articleId: string) {
    return apiClient.get<Article>(`/api/v1/articles/${articleId}`)
  },

  /**
   * Update an existing article (creates new revision)
   */
  async updateArticle(articleId: string, data: Omit<CreateArticleRequest, 'save_as_draft'>) {
    return apiClient.put(`/api/v1/articles/${articleId}`, data)
  },

  /**
   * Delete an article
   */
  async deleteArticle(articleId: string) {
    return apiClient.delete(`/api/v1/articles/${articleId}`)
  },

  /**
   * Get list of categories
   */
  async getCategories() {
    return apiClient.get<Category[]>('/api/v1/categories')
  },

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree() {
    return apiClient.get<CategoryTree[]>('/api/v1/categories/tree')
  },

  /**
   * Create a new category
   */
  async createCategory(data: { name: string; description?: string; parent_id?: string }) {
    return apiClient.post<Category>('/api/v1/categories', data)
  },

  /**
   * Save article as draft
   */
  async saveDraft(data: Omit<Draft, 'draft_id' | 'created_at' | 'updated_at' | 'created_by'>) {
    return apiClient.post<Draft>('/api/v1/drafts', data)
  },

  /**
   * Update existing draft
   */
  async updateDraft(draftId: string, data: Partial<Omit<Draft, 'draft_id' | 'created_at' | 'updated_at' | 'created_by'>>) {
    return apiClient.put<Draft>(`/api/v1/drafts/${draftId}`, data)
  },

  /**
   * Get user's drafts
   */
  async getDrafts() {
    return apiClient.get<Draft[]>('/api/v1/drafts')
  },

  /**
   * Get specific draft
   */
  async getDraft(draftId: string) {
    return apiClient.get<Draft>(`/api/v1/drafts/${draftId}`)
  },

  /**
   * Delete draft
   */
  async deleteDraft(draftId: string) {
    return apiClient.delete(`/api/v1/drafts/${draftId}`)
  },

  /**
   * Auto-save draft (throttled)
   */
  async autoSaveDraft(data: Omit<Draft, 'draft_id' | 'created_at' | 'updated_at' | 'created_by'>) {
    return apiClient.post<Draft>('/api/v1/drafts/autosave', data)
  }
}