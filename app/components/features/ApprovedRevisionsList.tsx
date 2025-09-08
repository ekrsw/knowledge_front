'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'

interface ApprovedRevision {
  revision_id: string
  title: string
  content: string
  status: string
  proposer_id: string
  approver_id: string
  target_article_id: string
  created_at: string
  updated_at: string
  approved_at: string
  approval_comment: string
  proposer_name: string
  approver_name: string
  article_title: string
}

export function ApprovedRevisionsList() {
  const router = useRouter()
  const [revisions, setRevisions] = useState<ApprovedRevision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApprovedRevisions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/v1/revisions/?status=approved')
      if (!response.ok) {
        throw new Error('Failed to fetch approved revisions')
      }
      
      const data = await response.json()
      
      // Sort by approval date in descending order (most recent first)
      const sortedData = data.sort((a: ApprovedRevision, b: ApprovedRevision) => 
        new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime()
      )
      
      setRevisions(sortedData)
    } catch (err) {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovedRevisions()
  }, [])

  const handleRevisionClick = (revisionId: string) => {
    router.push(`/revisions/${revisionId}`)
  }

  const handleRetry = () => {
    fetchApprovedRevisions()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (loading) {
    return (
      <main role="main" aria-label="承認済み修正案一覧">
        <div className="max-w-6xl mx-auto p-6">
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
      <main role="main" aria-label="承認済み修正案一覧">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">エラーが発生しました</p>
            <Button onClick={handleRetry} variant="outline">
              再試行
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (revisions.length === 0) {
    return (
      <main role="main" aria-label="承認済み修正案一覧">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">承認済み修正案一覧</h1>
          <p className="text-gray-600 mb-8">承認された修正案の一覧です。</p>
          
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">承認済みの修正案がありません</p>
            <p className="text-gray-400 text-sm">修正案が承認されると、ここに表示されます。</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main role="main" aria-label="承認済み修正案一覧">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">承認済み修正案一覧</h1>
        <p className="text-gray-600 mb-8">承認された修正案の一覧です。</p>
        
        <div className="grid gap-6">
          {revisions.map((revision) => (
            <button
              key={revision.revision_id}
              onClick={() => handleRevisionClick(revision.revision_id)}
              aria-label={`承認済み修正案: ${revision.title}`}
              tabIndex={0}
              className="w-full text-left bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{revision.title}</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  承認済み
                </span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">提案者:</span> {revision.proposer_name}
                </div>
                <div>
                  <span className="font-medium">承認者:</span> {revision.approver_name}
                </div>
                <div>
                  <span className="font-medium">対象記事:</span> {revision.article_title}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  承認日: {formatDate(revision.approved_at)}
                </div>
                {revision.approval_comment && (
                  <div className="max-w-md text-right">
                    <span className="font-medium">承認コメント:</span> {revision.approval_comment}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}