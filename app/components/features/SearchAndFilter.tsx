'use client'

import React, { useState, FormEvent } from 'react'
import { Button } from '../ui/Button'

interface SearchResult {
  id: string
  title: string
  content: string
  article_number?: string
  info_category?: string
  approval_group?: string
  created_at: string
  updated_at: string
  author?: string
  status: string
  tags?: string[]
}

interface RevisionResult {
  revision_id: string
  title: string
  content: string
  status: string
  proposer_id: string
  proposer_name: string
  target_article_id: string
  created_at: string
  updated_at: string
}

interface SearchResponse {
  total: number
  results: (SearchResult | RevisionResult)[]
}

interface SearchFilters {
  category: string
  status: string
  type: 'all' | 'articles' | 'revisions'
}

export function SearchAndFilter() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    status: '',
    type: 'all',
  })
  const [results, setResults] = useState<(SearchResult | RevisionResult)[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = async () => {
    if (!query.trim() && !hasSearched) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query.trim()) {
        params.set('q', query.trim())
      }
      if (filters.category) {
        params.set('category', filters.category)
      }
      if (filters.status) {
        params.set('status', filters.status)
      }
      if (filters.type !== 'all') {
        params.set('type', filters.type)
      }

      const response = await fetch(`/api/v1/search?${params}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data: SearchResponse = await response.json()
      setResults(data.results)
      setTotal(data.total)
      setHasSearched(true)
    } catch (err) {
      setError('検索エラーが発生しました')
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const handleRetry = () => {
    performSearch()
  }

  const handleReset = () => {
    setQuery('')
    setFilters({
      category: '',
      status: '',
      type: 'all',
    })
    setResults([])
    setTotal(0)
    setError(null)
    setHasSearched(false)
  }

  const isRevision = (result: SearchResult | RevisionResult): result is RevisionResult => {
    return 'revision_id' in result
  }

  const highlightKeywords = (text: string, keywords: string) => {
    if (!keywords.trim()) return text

    const keywordList = keywords.trim().split(/\s+/)
    let highlightedText = text

    keywordList.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<span class="search-highlight bg-yellow-200">$1</span>')
    })

    return highlightedText
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSubmit} role="search" className="space-y-6">
          <div>
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
              検索キーワード
            </label>
            <div className="flex gap-4">
              <input
                id="search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="記事や修正案を検索..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder:text-gray-500"
                aria-label="検索キーワード"
              />
              <Button
                type="submit"
                disabled={loading}
                className="px-6"
              >
                検索
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー
              </label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                aria-label="カテゴリーでフィルター"
              >
                <option value="">すべてのカテゴリー</option>
                <option value="general">一般</option>
                <option value="technical">技術</option>
                <option value="policy">ポリシー</option>
                <option value="procedure">手順</option>
              </select>
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                aria-label="ステータスでフィルター"
              >
                <option value="">すべてのステータス</option>
                <option value="published">公開済み</option>
                <option value="draft">下書き</option>
                <option value="submitted">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
              </select>
            </div>

            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                タイプ
              </label>
              <select
                id="type-filter"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as 'all' | 'articles' | 'revisions' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                aria-label="タイプでフィルター"
              >
                <option value="all">すべて</option>
                <option value="articles">記事</option>
                <option value="revisions">修正案</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              リセット
            </Button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div
            data-testid="search-loading"
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"
          />
          <p className="text-gray-600">検索中...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            再検索
          </Button>
        </div>
      )}

      {/* Initial State */}
      {!loading && !error && !hasSearched && (
        <div className="text-center py-12">
          <p className="text-gray-500">検索キーワードを入力してください。</p>
        </div>
      )}

      {/* Empty Results */}
      {!loading && !error && hasSearched && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">検索結果が見つかりませんでした。</p>
          <p className="text-gray-400 text-sm">検索条件を変更してお試しください。</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && !error && results.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              検索結果: {total}件
            </h2>
          </div>

          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={isRevision(result) ? result.revision_id : result.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-2"
                      dangerouslySetInnerHTML={{
                        __html: highlightKeywords(result.title, query)
                      }}
                    />
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isRevision(result) 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isRevision(result) ? '修正案' : '記事'}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.status === 'published' ? 'bg-green-100 text-green-800' :
                        result.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        result.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        result.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.status === 'published' ? '公開済み' :
                         result.status === 'approved' ? '承認済み' :
                         result.status === 'submitted' ? '承認待ち' :
                         result.status === 'draft' ? '下書き' :
                         '却下'}
                      </span>

                      {!isRevision(result) && result.article_number && (
                        <span className="text-gray-500">
                          {result.article_number}
                        </span>
                      )}
                    </div>

                    <p 
                      className="text-gray-700 line-clamp-2 mb-3"
                      dangerouslySetInnerHTML={{
                        __html: highlightKeywords(result.content, query)
                      }}
                    />

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">
                          {isRevision(result) ? '提案者:' : '作成者:'}
                        </span>{' '}
                        {isRevision(result) ? result.proposer_name : result.author || '不明'}
                      </div>
                      <div>
                        <span className="font-medium">更新日:</span> {formatDate(result.updated_at)}
                      </div>
                      {!isRevision(result) && result.info_category && (
                        <div>
                          <span className="font-medium">カテゴリー:</span> {result.info_category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}