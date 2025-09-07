# テストユーザー情報

このドキュメントには、開発・テスト用に登録済みのユーザー情報が記載されています。

## 登録済みテストユーザー

### 管理者ユーザー
- **Username**: `testadmin`
- **Email**: `testadmin@example.com`
- **Password**: `password`
- **Role**: `admin`
- **権限**: 全機能へのアクセス、ユーザー管理、システム設定

### 一般ユーザー
- **Username**: `testuser`
- **Email**: `testuser@example.com`
- **Password**: `password`
- **Role**: `user`
- **権限**: 自分の修正案作成・管理、特定の記事の修正履歴（提出済み、承認済み）

### 承認者ユーザー
- **Username**: `testapprover`
- **Email**: `testapprover@example.com`
- **Password**: `password`
- **Role**: `approver`
- **権限**: 一般ユーザー権限 + 承認待ち画面・承認操作、修正案一覧画面操作

## ログインテスト用

### JSON形式ログイン（`/api/v1/auth/login/json`）
```json
{
  "username": "testadmin",
  "password": "password"
}
```

### フォーム形式ログイン（`/api/v1/auth/login`）
```
username=testadmin&password=password
```

## 権限レベル
- **admin** > **approver** > **user**
- JWT トークンに role 情報が含まれ、フロントエンドでの権限制御に使用

## 注意事項
- これらは開発・テスト専用のアカウントです
- 本番環境では使用しないでください
- パスワードは本番環境では適切な強度のものに変更してください