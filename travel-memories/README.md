# 旅行メモリーズ

Google Photosから旅行写真を取得し、訪問地を地図上にマーク表示するメモリーサイト。

## 機能

- 📸 Google Photosから写真を自動取得
- 🗺️ 訪問地を地図上にマーク表示（Leaflet + OpenStreetMap）
- 📅 タイムラインで日付順に表示
- 📍 EXIFメタデータから位置情報を自動抽出
- 👨‍👩‍👧 ローカルホストで家族と共有
- 📱 レスポンシブ対応

## セットアップ手順

### 1. Google Cloud Project 作成（初回のみ）

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新規プロジェクト作成（例：「Travel Memories」）
3. **Google Photos Library API を有効化**
   - 「APIとサービス」→「APIライブラリ」
   - 「Google Photos Library API」を検索して「有効にする」

4. **OAuth 2.0 認証情報を作成**
   - 「APIとサービス」→「認証情報」
   - 「認証情報を作成」→「OAuth クライアント ID」
   - アプリケーションの種類：「デスクトップアプリ」を選択
   - `client_id` と `client_secret` をコピー

5. **リダイレクト URI を設定**
   - 「认証情報」の OAuth 2.0 クライアント ID 設定
   - 「認可済みリダイレクト URI」に以下を追加：
     ```
     http://localhost:3001/api/auth/callback
     ```

### 2. バックエンド セットアップ

```bash
cd backend

# .env ファイルを作成
cp .env.example .env

# .env にGoogle APIの認証情報を入力
# GOOGLE_CLIENT_ID=your_client_id_here
# GOOGLE_CLIENT_SECRET=your_client_secret_here
```

テキストエディタで `.env` ファイルを開き、以下を入力：

```env
GOOGLE_CLIENT_ID=xxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxx
PORT=3001
```

依存関係をインストール：

```bash
npm install
```

### 3. フロントエンド セットアップ

別のターミナルで：

```bash
cd frontend
npm install
```

### 4. 実行

**ターミナル1：バックエンド**
```bash
cd backend
npm start
# ポート 3001 で起動
```

**ターミナル2：フロントエンド**
```bash
cd frontend
npm run dev
# ポート 5173 で起動
```

ブラウザで **http://localhost:5173** にアクセス

## 使い方

1. **ログイン** ボタンをクリック
2. Google アカウントで認証
3. 3月15日～4月3日の旅行写真が自動取得される
4. **タイムライン** タブで日付順に表示
5. **地図** タブで訪問地を表示
6. 写真をクリックして詳細を確認

## 表示内容

- **撮影枚数**：取得した写真の総数
- **位置情報あり**：EXIF情報に位置データがある写真の数
- **訪問日数**：写真が撮影された日数

## 家族で共有する場合

### ローカルネットワーク共有

1. PC のIPアドレスを確認：
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. 他のデバイスで `http://[PCのIPアドレス]:5173` にアクセス

### クラウドでホスティング（推奨）

1. **Vercel（フロントエンド）**
   ```bash
   cd frontend
   npm run build
   # Vercelにデプロイ
   ```

2. **Railway または Render（バックエンド）**
   - バックエンドコードを GitHub にプッシュ
   - 環境変数を設定
   - デプロイ

## トラブルシューティング

### 「Google Photos APIが無効」エラー
→ Google Cloud Console で API が有効化されているか確認

### 「リダイレクト URI が無効」エラー
→ `.env` の設定とGoogle Cloud Consoleの設定が一致しているか確認

### 位置情報が表示されない
→ Google Photosで写真に位置情報がタグ付けされているか確認

### CORS エラー
→ バックエンドが起動しているか確認（ポート3001）

## 技術スタック

**バックエンド**
- Node.js + Express
- Google Auth Library
- Axios

**フロントエンド**
- React + Vite
- Leaflet（地図表示）
- Tailwind CSS（スタイリング）
- date-fns（日付処理）

## カスタマイズ

### 日付範囲を変更
`backend/server.js` の `dateFilter` を編集：

```javascript
dateFilter: {
  ranges: [
    {
      startDate: { year: 2026, month: 3, day: 15 },
      endDate: { year: 2026, month: 4, day: 3 },
    },
  ],
},
```

### スタイルを変更
`frontend/src/index.css` と各 JSX ファイルで Tailwind CSS を修正

## ライセンス

MIT

## 作成者

旅行メモリーズ
