export interface Category {
  category_id: string
  name: string
  description?: string
  parent_id?: string
  is_active: boolean
  created_at: string
}

export interface Article {
  article_id: string
  title: string
  content: string
  category_id: string
  created_at: string
  updated_at: string
  created_by: string
  current_revision_id: string
  published_revision_id?: string
  is_active: boolean
  tags?: string[]
}

export interface ArticleForm {
  title: string
  content: string
  category_id: string
  tags?: string[]
  save_as_draft?: boolean
}

export interface Draft {
  draft_id: string
  article_id?: string
  title: string
  content: string
  category_id: string
  tags?: string[]
  created_at: string
  updated_at: string
  created_by: string
  auto_saved?: boolean
}

export interface CreateArticleRequest {
  title: string
  content: string
  category_id: string
  tags?: string[]
  save_as_draft?: boolean
}

export interface CreateArticleResponse {
  article_id: string
  revision_id: string
  status: 'draft' | 'pending'
}

export interface CategoryTree extends Category {
  children?: CategoryTree[]
}