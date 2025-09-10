export type RevisionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published'

export interface Revision {
  revision_id: string
  article_id: string
  title: string
  content: string
  status: RevisionStatus
  created_at: string
  updated_at: string
  created_by: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  version: number
  category_id: string
}

export interface RevisionListItem {
  revision_id: string
  article_id: string
  title: string
  status: RevisionStatus
  created_at: string
  created_by: string
  version: number
  category_name: string
  author_name: string
}

export interface RevisionFilter {
  status?: RevisionStatus[]
  category_id?: string
  author_id?: string
  search?: string
  date_from?: string
  date_to?: string
}

export interface RevisionSort {
  field: 'created_at' | 'updated_at' | 'title' | 'status' | 'version'
  direction: 'asc' | 'desc'
}

export interface RevisionListParams {
  page?: number
  limit?: number
  filter?: RevisionFilter
  sort?: RevisionSort
}

export interface RevisionListResponse {
  revisions: RevisionListItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}