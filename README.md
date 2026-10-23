# リーディングランプ（Web版）

読んだ本の記録をつける、個人用の読書ノートアプリ。Next.js + Supabase で動く、誰でもログインして使える独立したWebアプリです。
（claude.aiのArtifact版「リーディングランプ」をもとに、課金・独自ドメインでの公開を見据えて作り直したもの）

v1の方針: **まず無料で公開**。AIによる表紙写真からのタイトル自動読み取りは外し、手入力のみ。課金機能はまだ入っていません（後から追加できる構成にしてあります）。

## 公開までに必要な準備（あなたが行う作業）

コードはすべて用意済みですが、以下の2つはアカウント作成が必要なため、あなた自身で行ってください。

### 1. Supabase プロジェクトを作成する（データベース・ログイン・画像保存）

1. https://supabase.com にアクセスし、アカウントを作成（無料）。
2. 「New project」で新しいプロジェクトを作成（リージョンは `Northeast Asia (Tokyo)` がおすすめ）。
3. プロジェクトができたら、左メニューの **SQL Editor** を開き、このリポジトリの `supabase/schema.sql` の中身を全部貼り付けて実行する（テーブル・権限・画像保存用のバケットが一度に作られます）。
4. 左メニューの **Project Settings → API** を開き、以下の2つをコピーする:
   - `Project URL`
   - `anon public` キー
5. 左メニューの **Authentication → URL Configuration** で、`Site URL` を一旦 `http://localhost:3000` にしておく（Vercelにデプロイしたら、そのURLに後で変更します）。

### 2. 環境変数を設定する

このフォルダ直下に `.env.local` というファイルを作り、`env.example` を参考に以下を書く:

```
NEXT_PUBLIC_SUPABASE_URL=（さっきコピーしたProject URL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（さっきコピーしたanon publicキー）
```

### 3. ローカルで動作確認する

```bash
npm install
npm run dev
```

http://localhost:3000 を開くと、ログイン画面が出ます。メールアドレスを入れると、ログイン用のリンクがそのメール宛に届きます（Supabaseの無料プランはメール送信回数に上限があります）。

### 4. Vercelに公開する

1. https://vercel.com でアカウントを作成（GitHubアカウントでログインすると楽です）。
2. このプロジェクトをGitHubリポジトリにpushする。
3. Vercelで「Add New... → Project」からそのリポジトリを選び、「Environment Variables」に手順2と同じ `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定してデプロイする。
4. デプロイが終わると `xxx.vercel.app` のようなURLが発行されます。
5. Supabaseの **Authentication → URL Configuration** に戻り、`Site URL` をそのVercelのURLに変更する（ログインリンクが正しい場所に飛ぶようにするため）。

これで `xxx.vercel.app` を誰にでも共有できます。各ユーザーは自分のメールアドレスでログインし、本棚・記録は他の人とは完全に分離されます（Supabaseの行レベルセキュリティで保護）。

## 今後やれること

- 独自ドメインをVercelに接続する（Vercelの「Domains」設定から）。
- Stripeを使った月額/買い切り課金の追加。
- AIによる表紙写真からのタイトル・著者自動読み取り（Anthropic APIキーが別途必要）。

## 技術構成

- フレームワーク: Next.js 16（App Router, Server Actions）
- スタイル: Tailwind CSS v4（配色・書体は claude.ai 版で選んだ「図書目録」スタイルを踏襲）
- データベース・認証・画像保存: Supabase（PostgreSQL + Auth + Storage）
- ホスティング: Vercel

## ローカル開発コマンド

```bash
npm run dev     # 開発サーバー
npm run build   # 本番ビルド
npm run lint    # ESLint
```
