# Phase 2 テストガイド

## 概要
Knowledge Management System フロントエンドのPhase 2（コア機能）に関するテストコマンドと実行手順。

---

## 📋 Phase 2 テストコマンド

### **基本テストコマンド**
```bash
# 全テスト実行
npm test

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage
```

### **Phase 2 専用テスト**
```bash
# Phase 1 検証テスト（Phase 2の前提条件確認）
npm run test:phase1

# API統合テスト（localhost:8000との接続確認）
npm run test:api

# バックエンド接続確認
npm run check-backend
```

### **Phase 2 コンポーネント別テスト**
```bash
# 修正案一覧画面テスト
npm test -- --testPathPattern="RevisionList"

# 新規作成画面テスト  
npm test -- --testPathPattern="NewCreation"

# 承認待ち画面テスト
npm test -- --testPathPattern="PendingApproval"

# 認証関連テスト
npm test -- --testPathPattern="auth"

# 全Phase 2機能テスト
npm test -- --testPathPattern="features"
```

### **E2Eテスト**
```bash
# Cypress E2E テスト開始
npm run cypress

# Cypress ヘッドレス実行
npm run cypress:run

# E2E専用テスト
npm run e2e

# コンポーネントテスト
npm run component
```

---

## 🧪 Phase 2 テスト実行手順

### **1. 事前準備**
```bash
# バックエンドサーバー起動確認
npm run check-backend
```
**期待結果**: `✅ Backend is available and responding!`

### **2. Phase 1 基盤確認**
```bash
# Phase 1の完了確認
npm run test:phase1
```
**期待結果**: API接続テスト、認証テストがパス

### **3. Phase 2 機能テスト**
```bash
# Phase 2の新機能テスト
npm test -- --testPathPattern="features/(RevisionList|NewCreation|PendingApproval)"
```

### **4. 統合テスト**
```bash
# API統合テスト実行
npm run test:api
```

### **5. フルテストスイート**
```bash
# 全テスト実行
npm test
```

---

## 📊 Phase 2 実装済み機能

### **コア画面**
- ✅ **修正案一覧画面** (`RevisionList.tsx`)
  - フィルタリング、ソート機能
  - リアルタイム更新
  - ペイジネーション

- ✅ **新規作成画面** (`NewCreation.tsx`)
  - リッチフォーム
  - バリデーション
  - 下書き保存機能

- ✅ **承認待ち画面** (`PendingApproval.tsx`)
  - 承認ワークフロー
  - 一括操作
  - コメント機能

- ✅ **ログイン画面** (`LoginForm.tsx`)
  - JWT認証
  - エラーハンドリング

### **API統合**
- ✅ `localhost:8000` バックエンド接続
- ✅ 認証API (`/api/v1/auth/*`)
- ✅ 記事API (`/api/v1/articles/*`)
- ✅ 修正版API (`/api/v1/revisions/*`)
- ✅ 承認API (`/api/v1/approvals/*`)

---

## 🔧 トラブルシューティング

### **よくある問題と解決方法**

#### 1. バックエンド接続エラー
```bash
# 問題: Backend is not available
# 解決: バックエンドサーバーを起動
cd ../backend
python -m uvicorn main:app --reload --port 8000
```

#### 2. API認証エラー
```bash
# 問題: 401 Unauthorized
# 解決: テストユーザーの確認
cat docs/test-users.md
```

#### 3. テスト失敗
```bash
# 問題: コンポーネントテストの失敗
# 解決: MSWサーバーのリセット
npm test -- --clearCache
```

#### 4. ESLintエラー
```bash
# 問題: Linting errors
# 解決: 自動修正可能なエラーを修正
npm run lint -- --fix
```

---

## 📋 テストチェックリスト

### **Phase 2 完了確認**
- [ ] `npm run check-backend` - バックエンド接続確認
- [ ] `npm run test:phase1` - Phase 1基盤確認
- [ ] `npm test -- --testPathPattern="features"` - Phase 2機能確認
- [ ] `npm run test:api` - API統合確認
- [ ] `npm test` - 全テスト実行
- [ ] `npm run build` - ビルド確認

### **機能別確認**
- [ ] 修正案一覧画面の表示・フィルタリング
- [ ] 新規作成画面のフォーム動作・保存
- [ ] 承認待ち画面のワークフロー
- [ ] ログイン・ログアウト機能
- [ ] レスポンシブデザイン対応

---

## 🎯 成功指標

### **Phase 2 完了基準**
- ✅ **機能性**: 4つのコア画面が動作
- ✅ **統合性**: バックエンドAPIとの連携
- ✅ **品質**: テストカバレッジ >90%
- ✅ **ユーザビリティ**: レスポンシブ対応
- ✅ **アクセシビリティ**: WCAG 2.1 AA準拠

### **テスト実行結果の目安**
```
Test Suites: 10+ passed
Tests: 75+ passed  
Coverage: >90% statements, >85% branches
Build: ✅ Successfully compiled
```

---

## 🚀 次のステップ

Phase 2テストが全て成功したら、以下に進んでください：

1. **Phase 3準備**: `docs/frontend-implementation-master-plan.md`
2. **品質向上**: ESLintエラーの修正
3. **パフォーマンス**: Core Web Vitals最適化
4. **セキュリティ**: セキュリティ監査実行

---

**Last Updated**: 2025-01-30  
**Phase Status**: ✅ Phase 2 Complete & Tested