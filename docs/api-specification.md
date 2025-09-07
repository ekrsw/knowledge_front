# KSAP - Knowledge System Approval Platform API 仕様書

## システム概要

**KSAP (Knowledge System Approval Platform)** は、ナレッジの修正提案と承認を効率的に管理する包括的なシステムです。

### 主要機能
- **修正案管理**: ナレッジの修正提案を作成・編集・提出し、進捗を追跡
- **承認ワークフロー**: ロールベースのアクセス制御による構造化された承認プロセス
- **差分分析**: 高度な変更検出と影響度評価機能
- **通知システム**: リアルタイム通知とコミュニケーション機能
- **分析・レポート**: 包括的なメトリクスとパフォーマンス分析

### ユーザー権限
- **一般ユーザー**: 自分の修正提案を作成・管理
- **承認者**: 担当領域の提案をレビューし、承認・却下の判断
- **管理者**: ユーザー管理やシステム設定を含む全機能へのアクセス

## API基本情報

- **ベースURL**: `/api/v1`
- **認証方式**: JWT Bearer トークン
- **レスポンス形式**: JSON
- **バージョン**: 0.1.0

### 認証について
公開エンドポイント以外の全てのAPIは、JWT Bearer トークン認証が必要です。

**認証ヘッダーの形式:**
```
Authorization: Bearer <JWT アクセストークン>
```

## API エンドポイント一覧

### 🔐 Authentication (認証関連) - 5 endpoints

#### POST `/api/v1/auth/login`
**OAuth2 compatible token login**
- **説明**: OAuth2互換のトークンログイン、将来のリクエスト用のアクセストークンを取得
- **リクエスト**: `application/x-www-form-urlencoded`
- **レスポンス**: Token オブジェクト
- **認証**: 不要

#### POST `/api/v1/auth/login/json`
**JSON login endpoint**
- **説明**: JSON形式のログインエンドポイント
- **リクエスト**: UserLogin オブジェクト
- **レスポンス**: Token オブジェクト
- **認証**: 不要

#### POST `/api/v1/auth/register`
**Register new user**
- **説明**: 新規ユーザー登録
- **リクエスト**: UserRegister オブジェクト
- **レスポンス**: User オブジェクト
- **認証**: 不要

#### GET `/api/v1/auth/me`
**Get current user information**
- **説明**: 現在のユーザー情報を取得
- **レスポンス**: User オブジェクト
- **認証**: 必要

#### POST `/api/v1/auth/test-token`
**Test access token**
- **説明**: アクセストークンの検証
- **レスポンス**: User オブジェクト
- **認証**: 必要

---

### 👥 Users (ユーザー管理) - 7 endpoints

#### GET `/api/v1/users/`
**Get all users**
- **説明**: 全ユーザーの一覧取得
- **クエリパラメータ**: `skip`, `limit`
- **レスポンス**: User配列
- **認証**: 必要

#### POST `/api/v1/users/`
**Create new user**
- **説明**: 新規ユーザー作成
- **リクエスト**: UserCreate オブジェクト
- **レスポンス**: User オブジェクト
- **認証**: 必要

#### GET `/api/v1/users/{user_id}`
**Get user by ID**
- **説明**: 指定IDのユーザー情報取得
- **レスポンス**: User オブジェクト
- **認証**: 必要

#### PUT `/api/v1/users/{user_id}`
**Update user**
- **説明**: ユーザー情報更新
- **リクエスト**: UserUpdate オブジェクト
- **レスポンス**: User オブジェクト
- **認証**: 必要

#### PUT `/api/v1/users/{user_id}/password`
**Update user password**
- **説明**: ユーザーパスワード更新
- **リクエスト**: UserPasswordUpdate オブジェクト
- **レスポンス**: User オブジェクト
- **認証**: 必要

#### PUT `/api/v1/users/{user_id}/admin-reset-password`
**Admin reset user password**
- **説明**: 管理者によるユーザーパスワードリセット
- **リクエスト**: AdminPasswordUpdate オブジェクト
- **レスポンス**: User オブジェクト
- **認証**: 必要

#### DELETE `/api/v1/users/{user_id}`
**Delete user**
- **説明**: ユーザー削除
- **認証**: 必要

---

### 📝 Proposals (修正案管理) - 11 endpoints

#### GET `/api/v1/proposals/{revision_id}`
**Get proposal by ID**
- **説明**: 指定IDの修正案取得
- **レスポンス**: Revision オブジェクト
- **認証**: 必要

#### PUT `/api/v1/proposals/{revision_id}`
**Update proposal**
- **説明**: 修正案更新
- **リクエスト**: RevisionUpdate オブジェクト
- **レスポンス**: Revision オブジェクト
- **認証**: 必要

#### DELETE `/api/v1/proposals/{revision_id}`
**Delete proposal**
- **説明**: 修正案削除
- **認証**: 必要

#### POST `/api/v1/proposals/{revision_id}/submit`
**Submit proposal for approval**
- **説明**: 修正案を承認用に提出
- **レスポンス**: Revision オブジェクト
- **認証**: 必要

#### POST `/api/v1/proposals/{revision_id}/withdraw`
**Withdraw proposal**
- **説明**: 修正案を取り下げ
- **レスポンス**: Revision オブジェクト
- **認証**: 必要

#### PUT `/api/v1/proposals/{revision_id}/approved-update`
**Update approved proposal**
- **説明**: 承認済み修正案の更新
- **リクエスト**: RevisionUpdate オブジェクト
- **レスポンス**: Revision オブジェクト
- **認証**: 必要

#### GET `/api/v1/proposals/my-proposals`
**Get current user's proposals**
- **説明**: 現在のユーザーの修正案取得
- **クエリパラメータ**: `skip`, `limit`, `status`
- **レスポンス**: Revision配列
- **認証**: 必要

#### GET `/api/v1/proposals/for-approval`
**Get proposals for approval**
- **説明**: 承認待ちの修正案取得
- **クエリパラメータ**: `skip`, `limit`, `urgency_filter`
- **レスポンス**: Revision配列
- **認証**: 必要

#### GET `/api/v1/proposals/statistics`
**Get proposal statistics**
- **説明**: 修正案の統計情報取得
- **認証**: 必要

---

### ✅ Approvals (承認関連) - 13 endpoints

#### POST `/api/v1/approvals/{revision_id}/decide`
**Make approval decision**
- **説明**: 承認決定の実行
- **リクエスト**: ApprovalDecision オブジェクト
- **レスポンス**: Revision オブジェクト
- **認証**: 必要

#### GET `/api/v1/approvals/queue`
**Get approval queue**
- **説明**: 承認待ちキューの取得
- **クエリパラメータ**: `skip`, `limit`, `sort_by`, `order`
- **レスポンス**: ApprovalQueue配列
- **認証**: 必要

#### GET `/api/v1/approvals/workload`
**Get approval workload**
- **説明**: 承認ワークロード取得
- **レスポンス**: ApprovalWorkload オブジェクト
- **認証**: 必要

#### GET `/api/v1/approvals/workload/{approver_id}`
**Get approver workload**
- **説明**: 特定承認者のワークロード取得
- **レスポンス**: ApprovalWorkload オブジェクト
- **認証**: 必要

#### GET `/api/v1/approvals/metrics`
**Get approval metrics**
- **説明**: 承認メトリクス取得
- **クエリパラメータ**: `days`
- **レスポンス**: ApprovalMetrics オブジェクト
- **認証**: 必要

#### POST `/api/v1/approvals/bulk`
**Bulk approval operation**
- **説明**: 一括承認操作
- **リクエスト**: BulkApprovalRequest オブジェクト
- **認証**: 必要

#### GET `/api/v1/approvals/{revision_id}/can-approve`
**Check if user can approve**
- **説明**: ユーザーが承認可能かチェック
- **認証**: 必要

#### GET `/api/v1/approvals/history`
**Get approval history**
- **説明**: 承認履歴取得
- **クエリパラメータ**: `skip`, `limit`, `revision_id`, `approver_id`
- **レスポンス**: ApprovalHistory配列
- **認証**: 必要

#### GET `/api/v1/approvals/statistics/dashboard`
**Get dashboard statistics**
- **説明**: ダッシュボード統計取得
- **認証**: 必要

#### GET `/api/v1/approvals/team-overview`
**Get team overview**
- **説明**: チーム概要取得
- **認証**: 必要

#### POST `/api/v1/approvals/{revision_id}/quick-actions/{action}`
**Quick approval actions**
- **説明**: クイック承認アクション
- **パスパラメータ**: `action` (ApprovalAction)
- **認証**: 必要

#### GET `/api/v1/approvals/workflow/recommendations`
**Get workflow recommendations**
- **説明**: ワークフロー推奨事項取得
- **認証**: 必要

#### GET `/api/v1/approvals/workflow/checklist/{revision_id}`
**Get approval checklist**
- **説明**: 承認チェックリスト取得
- **認証**: 必要

---

### 🔄 Diffs (差分分析) - 8 endpoints

#### GET `/api/v1/diffs/{revision_id}`
**Get revision diff**
- **説明**: 修正案の差分取得
- **レスポンス**: RevisionDiff オブジェクト
- **認証**: 必要

#### GET `/api/v1/diffs/{revision_id}/summary`
**Get diff summary**
- **説明**: 差分サマリー取得
- **レスポンス**: DiffSummary オブジェクト
- **認証**: 必要

#### GET `/api/v1/diffs/{revision_id}/snapshot`
**Get revision snapshot**
- **説明**: 修正案スナップショット取得
- **レスポンス**: ArticleSnapshot オブジェクト
- **認証**: 必要

#### GET `/api/v1/diffs/article/{article_id}/history`
**Get article diff history**
- **説明**: 記事の差分履歴取得
- **クエリパラメータ**: `skip`, `limit`
- **レスポンス**: RevisionDiff配列
- **認証**: 必要

#### GET `/api/v1/diffs/{revision_id}/visual`
**Get visual diff**
- **説明**: ビジュアル差分取得
- **認証**: 必要

#### GET `/api/v1/diffs/{revision_id}/impact`
**Get change impact analysis**
- **説明**: 変更影響分析取得
- **認証**: 必要

#### GET `/api/v1/diffs/compare/{revision_id_1}/{revision_id_2}`
**Compare two revisions**
- **説明**: 2つの修正案の比較
- **認証**: 必要

#### GET `/api/v1/diffs/statistics`
**Get diff statistics**
- **説明**: 差分統計取得
- **認証**: 必要

---

### 🗂️ Articles (記事管理) - 8 endpoints

#### GET `/api/v1/articles/`
**Get all articles**
- **説明**: 全記事の取得
- **クエリパラメータ**: `skip`, `limit`, `search`, `category`, `approval_group`
- **レスポンス**: Article配列
- **認証**: 必要

#### POST `/api/v1/articles/`
**Create new article**
- **説明**: 新規記事作成
- **リクエスト**: ArticleCreate オブジェクト
- **レスポンス**: Article オブジェクト
- **認証**: 必要

#### GET `/api/v1/articles/{article_id}`
**Get article by ID**
- **説明**: 指定IDの記事取得
- **レスポンス**: Article オブジェクト
- **認証**: 必要

#### PUT `/api/v1/articles/{article_id}`
**Update article**
- **説明**: 記事更新
- **リクエスト**: ArticleUpdate オブジェクト
- **レスポンス**: Article オブジェクト
- **認証**: 必要

#### DELETE `/api/v1/articles/{article_id}`
**Delete article**
- **説明**: 記事削除
- **認証**: 必要

#### GET `/api/v1/articles/by-category/{info_category}`
**Get articles by category**
- **説明**: カテゴリ別記事取得
- **クエリパラメータ**: `skip`, `limit`
- **レスポンス**: Article配列
- **認証**: 必要

#### GET `/api/v1/articles/by-group/{approval_group}`
**Get articles by approval group**
- **説明**: 承認グループ別記事取得
- **クエリパラメータ**: `skip`, `limit`
- **レスポンス**: Article配列
- **認証**: 必要

#### GET `/api/v1/articles/search`
**Search articles**
- **説明**: 記事検索
- **クエリパラメータ**: `q`, `skip`, `limit`
- **認証**: 必要

---

### ⚙️ System (システム関連) - 6 endpoints

#### GET `/api/v1/system/health`
**Health check**
- **説明**: ヘルスチェック
- **認証**: 不要

#### GET `/api/v1/system/metrics`
**Get system metrics**
- **説明**: システムメトリクス取得
- **認証**: 必要

#### GET `/api/v1/system/status`
**Get system status**
- **説明**: システムステータス取得
- **認証**: 必要

#### POST `/api/v1/system/backup`
**Create system backup**
- **説明**: システムバックアップ作成
- **認証**: 必要

#### GET `/api/v1/system/logs`
**Get system logs**
- **説明**: システムログ取得
- **クエリパラメータ**: `level`, `skip`, `limit`
- **認証**: 必要

#### GET `/api/v1/system/version`
**Get API version**
- **説明**: APIバージョン取得
- **認証**: 不要

---

## 追加エンドポイント群

### 📝 Revisions (リビジョン管理)
- **GET** `/api/v1/revisions/` - 全リビジョン取得
- **POST** `/api/v1/revisions/` - 新規リビジョン作成
- **GET** `/api/v1/revisions/my-revisions` - 自分のリビジョン取得
- **GET** `/api/v1/revisions/{revision_id}` - 指定リビジョン取得
- **PUT** `/api/v1/revisions/{revision_id}` - リビジョン更新
- **DELETE** `/api/v1/revisions/{revision_id}` - リビジョン削除
- **GET** `/api/v1/revisions/by-proposer/{proposer_id}` - 提案者別リビジョン取得
- **GET** `/api/v1/revisions/by-status/{status}` - ステータス別リビジョン取得
- **GET** `/api/v1/revisions/by-article/{target_article_id}` - 記事別リビジョン取得
- **PUT** `/api/v1/revisions/{revision_id}/status` - リビジョンステータス更新

### 🏷️ Categories & Groups (カテゴリ・グループ管理)
- **GET** `/api/v1/info-categories/` - 情報カテゴリ取得
- **POST** `/api/v1/info-categories/` - 情報カテゴリ作成
- **GET** `/api/v1/info-categories/{category_id}` - 指定カテゴリ取得
- **PUT** `/api/v1/info-categories/{category_id}` - カテゴリ更新
- **DELETE** `/api/v1/info-categories/{category_id}` - カテゴリ削除
- **GET** `/api/v1/approval-groups/` - 承認グループ取得
- **POST** `/api/v1/approval-groups/` - 承認グループ作成
- **GET** `/api/v1/approval-groups/{group_id}` - 指定グループ取得
- **PUT** `/api/v1/approval-groups/{group_id}` - グループ更新
- **DELETE** `/api/v1/approval-groups/{group_id}` - グループ削除

### 🔔 Notifications (通知管理)
- **GET** `/api/v1/notifications/my-notifications` - 自分の通知取得
- **GET** `/api/v1/notifications/stats` - 通知統計取得
- **GET** `/api/v1/notifications/digest` - 通知ダイジェスト取得
- **PUT** `/api/v1/notifications/{notification_id}/read` - 通知既読化
- **POST** `/api/v1/notifications/bulk-read` - 一括既読化
- **GET** `/api/v1/notifications/{user_id}` - ユーザー通知取得（レガシー）
- **POST** `/api/v1/notifications/{user_id}` - ユーザー通知作成（レガシー）

## エラーハンドリング

### 標準HTTPステータスコード
- **200 OK**: 成功レスポンス
- **201 Created**: リソース作成成功
- **400 Bad Request**: リクエストエラー
- **401 Unauthorized**: 認証エラー
- **403 Forbidden**: 権限不足
- **404 Not Found**: リソースが見つからない
- **422 Unprocessable Entity**: バリデーションエラー
- **500 Internal Server Error**: サーバー内部エラー

### エラーレスポンス形式
```json
{
  "detail": [
    {
      "loc": ["field_name"],
      "msg": "エラーメッセージ",
      "type": "error_type"
    }
  ]
}
```

## データモデル概要

### 主要エンティティ
- **User**: ユーザー情報（ID、ユーザー名、メール、ロール、ステータス）
- **Article**: 記事情報（ID、記事番号、タイトル、内容、カテゴリ、承認グループ）
- **Revision**: 修正案（ID、タイトル、内容、ステータス、提案者、対象記事）
- **ApprovalQueue**: 承認キュー（優先度、期限、承認者情報）
- **RevisionDiff**: 差分情報（変更タイプ、旧値、新値、フィールド差分）
- **Notification**: 通知情報（タイプ、タイトル、メッセージ、優先度）

### ステータス管理
- **draft**: 下書き
- **submitted**: 提出済み
- **approved**: 承認済み
- **rejected**: 却下
- **deleted**: 削除済み

## セキュリティ

### 認証スキーム
- **HTTPBearer**: JWT Bearer トークン認証

### アクセス制御
- ロールベースアクセス制御（RBAC）
- エンドポイントレベルでの権限チェック
- リソースレベルでの所有者制御

## サポート情報

**開発チーム連絡先**: dev-team@company.com  
**ライセンス**: Proprietary License  
**API バージョン**: 0.1.0

---

*このドキュメントは OpenAPI 3.1.0 仕様から自動生成されています。*