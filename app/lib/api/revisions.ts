import { apiClient } from '../api-client'
import { 
  Revision, 
  RevisionListResponse, 
  RevisionListParams,
  RevisionStatus
} from '../../types/revision'

export const revisionsApi = {
  /**
   * Get list of revisions with filtering and pagination
   */
  async getRevisions(params?: RevisionListParams) {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    
    if (params?.filter) {
      if (params.filter.status?.length) {
        searchParams.set('status', params.filter.status.join(','))
      }
      if (params.filter.category_id) {
        searchParams.set('category_id', params.filter.category_id)
      }
      if (params.filter.author_id) {
        searchParams.set('author_id', params.filter.author_id)
      }
      if (params.filter.search) {
        searchParams.set('search', params.filter.search)
      }
      if (params.filter.date_from) {
        searchParams.set('date_from', params.filter.date_from)
      }
      if (params.filter.date_to) {
        searchParams.set('date_to', params.filter.date_to)
      }
    }
    
    if (params?.sort) {
      searchParams.set('sort_by', params.sort.field)
      searchParams.set('sort_order', params.sort.direction)
    }
    
    const query = searchParams.toString()
    const endpoint = `/api/v1/revisions${query ? `?${query}` : ''}`
    
    return apiClient.get<RevisionListResponse>(endpoint)
  },

  /**
   * Get a specific revision by ID
   */
  async getRevision(revisionId: string) {
    return apiClient.get<Revision>(`/api/v1/revisions/${revisionId}`)
  },

  /**
   * Update revision status
   */
  async updateRevisionStatus(revisionId: string, status: RevisionStatus, comment?: string) {
    return apiClient.patch(`/api/v1/revisions/${revisionId}/status`, {
      status,
      comment
    })
  },

  /**
   * Delete a revision
   */
  async deleteRevision(revisionId: string) {
    return apiClient.delete(`/api/v1/revisions/${revisionId}`)
  },

  /**
   * Get revision history for an article
   */
  async getArticleRevisions(articleId: string) {
    return apiClient.get<Revision[]>(`/api/v1/articles/${articleId}/revisions`)
  },

  /**
   * Compare two revisions
   */
  async compareRevisions(oldRevisionId: string, newRevisionId: string) {
    return apiClient.get(`/api/v1/revisions/compare?old=${oldRevisionId}&new=${newRevisionId}`)
  }
}