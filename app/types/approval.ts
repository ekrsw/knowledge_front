export type ApprovalAction = 'approve' | 'reject' | 'request_changes'

export interface ApprovalRequest {
  approval_id: string
  revision_id: string
  article_id: string
  title: string
  content: string
  category_name: string
  submitted_by: string
  submitted_at: string
  author_name: string
  version: number
  current_status: 'pending'
  priority: 'low' | 'medium' | 'high'
  deadline?: string
}

export interface ApprovalComment {
  comment_id: string
  approval_id: string
  user_id: string
  user_name: string
  comment: string
  created_at: string
  is_system_generated?: boolean
}

export interface ApprovalActionRequest {
  revision_id: string
  action: ApprovalAction
  comment?: string
}

export interface ApprovalActionResponse {
  success: boolean
  message: string
  new_status: 'approved' | 'rejected' | 'pending'
}

export interface ApprovalHistory {
  history_id: string
  revision_id: string
  action: ApprovalAction
  performed_by: string
  performed_at: string
  comment?: string
  previous_status: string
  new_status: string
}

export interface PendingApprovalFilter {
  priority?: 'low' | 'medium' | 'high'
  category_id?: string
  author_id?: string
  deadline_before?: string
  submitted_after?: string
}

export interface PendingApprovalSort {
  field: 'submitted_at' | 'deadline' | 'priority' | 'title' | 'author_name'
  direction: 'asc' | 'desc'
}

export interface PendingApprovalListParams {
  page?: number
  limit?: number
  filter?: PendingApprovalFilter
  sort?: PendingApprovalSort
}

export interface PendingApprovalListResponse {
  approvals: ApprovalRequest[]
  total: number
  page: number
  limit: number
  total_pages: number
}