import { apiClient } from '../api-client'
import { 
  ApprovalRequest,
  ApprovalComment,
  ApprovalActionRequest,
  ApprovalActionResponse,
  ApprovalHistory,
  PendingApprovalListResponse,
  PendingApprovalListParams
} from '../../types/approval'

export const approvalsApi = {
  /**
   * Get pending approvals list
   */
  async getPendingApprovals(params?: PendingApprovalListParams) {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    
    if (params?.filter) {
      if (params.filter.priority) {
        searchParams.set('priority', params.filter.priority)
      }
      if (params.filter.category_id) {
        searchParams.set('category_id', params.filter.category_id)
      }
      if (params.filter.author_id) {
        searchParams.set('author_id', params.filter.author_id)
      }
      if (params.filter.deadline_before) {
        searchParams.set('deadline_before', params.filter.deadline_before)
      }
      if (params.filter.submitted_after) {
        searchParams.set('submitted_after', params.filter.submitted_after)
      }
    }
    
    if (params?.sort) {
      searchParams.set('sort_by', params.sort.field)
      searchParams.set('sort_order', params.sort.direction)
    }
    
    const query = searchParams.toString()
    const endpoint = `/api/v1/approvals/pending${query ? `?${query}` : ''}`
    
    return apiClient.get<PendingApprovalListResponse>(endpoint)
  },

  /**
   * Get specific approval request
   */
  async getApprovalRequest(approvalId: string) {
    return apiClient.get<ApprovalRequest>(`/api/v1/approvals/${approvalId}`)
  },

  /**
   * Perform approval action (approve/reject/request changes)
   */
  async performApprovalAction(data: ApprovalActionRequest) {
    return apiClient.post<ApprovalActionResponse>('/api/v1/approvals/action', data)
  },

  /**
   * Get approval comments for a specific approval
   */
  async getApprovalComments(approvalId: string) {
    return apiClient.get<ApprovalComment[]>(`/api/v1/approvals/${approvalId}/comments`)
  },

  /**
   * Add comment to approval
   */
  async addApprovalComment(approvalId: string, comment: string) {
    return apiClient.post<ApprovalComment>(`/api/v1/approvals/${approvalId}/comments`, {
      comment
    })
  },

  /**
   * Get approval history for a revision
   */
  async getApprovalHistory(revisionId: string) {
    return apiClient.get<ApprovalHistory[]>(`/api/v1/revisions/${revisionId}/approval-history`)
  },

  /**
   * Bulk approve multiple revisions
   */
  async bulkApprove(revisionIds: string[], comment?: string) {
    return apiClient.post('/api/v1/approvals/bulk-approve', {
      revision_ids: revisionIds,
      comment
    })
  },

  /**
   * Bulk reject multiple revisions
   */
  async bulkReject(revisionIds: string[], comment: string) {
    return apiClient.post('/api/v1/approvals/bulk-reject', {
      revision_ids: revisionIds,
      comment
    })
  },

  /**
   * Get approval statistics
   */
  async getApprovalStats() {
    return apiClient.get<{
      pending_count: number
      overdue_count: number
      approved_today: number
      rejected_today: number
      average_approval_time: number
    }>('/api/v1/approvals/stats')
  }
}