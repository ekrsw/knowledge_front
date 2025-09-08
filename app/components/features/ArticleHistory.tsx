'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'

interface HistoryEntry {
  version_id: string
  revision_id: string
  article_id: string
  title: string
  content: string
  version_number: number
  change_type: 'created' | 'updated' | 'deleted'
  editor_id: string
  editor_name: string
  approved_by: string
  created_at: string
  summary: string
}

interface ArticleHistoryProps {
  articleId: string
}

export function ArticleHistory({ articleId }: ArticleHistoryProps) {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticleHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/v1/articles/${articleId}/history`)
      if (!response.ok) {
        throw new Error('Failed to fetch article history')
      }
      
      const data = await response.json()
      
      // Sort by version number in descending order (newest first)
      const sortedData = data.sort((a: HistoryEntry, b: HistoryEntry) => 
        b.version_number - a.version_number
      )
      
      setHistory(sortedData)
    } catch (err) {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticleHistory()
  }, [articleId])

  const handleCompareClick = (currentVersion: HistoryEntry, index: number) => {
    if (index < history.length - 1) {
      const previousVersion = history[index + 1]
      router.push(`/articles/${articleId}/compare?from=${previousVersion.version_id}&to=${currentVersion.version_id}`)
    }
  }

  const handleRetry = () => {
    fetchArticleHistory()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-green-700 text-xs font-medium">作成</span>
          </div>
        )
      case 'updated':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-blue-700 text-xs font-medium">更新</span>
          </div>
        )
      case 'deleted':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-red-700 text-xs font-medium">削除</span>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <main role="main" aria-label="記事履歴">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <div
              data-testid="loading-spinner"
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"
            />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main role="main" aria-label="記事履歴">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">エラーが発生しました</p>
            <Button onClick={handleRetry} variant="outline">
              再読み込み
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (history.length === 0) {
    return (
      <main role="main" aria-label="記事履歴">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">記事履歴</h1>
          <p className="text-gray-600 mb-8">記事の変更履歴を表示します。</p>
          
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">履歴がありません</p>
            <p className="text-gray-400 text-sm">記事の変更履歴がまだありません。</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main role="main" aria-label="記事履歴">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">記事履歴</h1>
        <p className="text-gray-600 mb-8">記事の変更履歴を表示します。</p>
        
        <ol className="space-y-6" role="list" aria-label="履歴タイムライン">
          {history.map((entry, index) => (
            <li key={entry.version_id} role="listitem" className="relative">
              {/* Timeline line */}
              {index < history.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          v{entry.version_number}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          バージョン {entry.version_number}
                        </h2>
                        {getChangeTypeIcon(entry.change_type)}
                      </div>
                    </div>
                  </div>
                  
                  {index < history.length - 1 && (
                    <Button
                      onClick={() => handleCompareClick(entry, index)}
                      variant="outline"
                      size="sm"
                    >
                      比較
                    </Button>
                  )}
                </div>
                
                <div className="ml-16">
                  <p className="text-gray-900 mb-3 line-clamp-2">
                    {entry.summary}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">編集者:</span> {entry.editor_name}
                    </div>
                    <div>
                      <span className="font-medium">承認者:</span> {entry.approved_by}
                    </div>
                    <div>
                      <span className="font-medium">日時:</span> {formatDate(entry.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}