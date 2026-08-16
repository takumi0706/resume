# ポートフォリオサイト 仕様書

- 作成日: 2026-08-16
- ステータス: ドラフト（design フェーズ未確定）
- 対象: 小山田 卓生 (Takumi Oyamada / @takumi0706) の個人ポートフォリオサイト

---

## 1. 背景と目的

### 1.1 背景

これまで Notion ベースの `https://takumi0706.thesimple.ink` を使用していたが、
拡張性・デザインの自由度に限界があるため、自前実装に移行する。

参考にしたリポジトリ: [shunsock/resume](https://github.com/shunsock/resume)
（VitePress + Bun + Nix + go-task / GitHub Pages）

ただし後述の理由により、技術スタックと情報設計は参考リポジトリを踏襲しない。

### 1.2 目的（優先度順）

| 優先度 | 目的 | 想定読者 |
|---|---|---|
| 1 | 転職・採用 | 採用担当、エンジニアリングマネージャー |
| 2 | 副業案件の受注窓口 | 発注検討者 |
| 3 | 技術ブランディング | 技術コミュニティ |

いずれにも対応できる「プラットフォーム」としての拡張性を最重要視する。

### 1.3 成功条件

- 採用担当が 1 分で「何ができる人か」を判断できる
- 「AI-Slop」に見えない。テンプレート然としていない
- コンテンツ追加が Markdown 1 ファイルの追加で済む
- 将来 i18n・ブログ自前ホスト・デモ埋め込みを後付けできる

---

## 2. 技術スタック

| 項目 | 選定 | 理由 |
|---|---|---|
| フレームワーク | **Astro 7** | フルカスタムデザインが自然。Content Collections + Zod で型安全。i18n 公式サポート。Islands で部分的に React/Vue を差し込める |
| スタイリング | **vanilla CSS + デザイントークン** | `@layer` でカスケード管理、CSS 変数でトークン、container query でコンポーネント単位のレスポンシブ。依存ゼロで自由度最大 |
| デプロイ | **Cloudflare Workers (Static Assets)** | 2026 年時点で Cloudflare の新規推奨。将来 API・OGP 動的生成・i18n リダイレクトを同一デプロイに載せられる |
| デザイン手法 | **Hallmark スキル** (`~/.claude/skills/hallmark`) | 21 マクロ構造 × テーマ、57 slop-test ゲート、トークン強制、捏造禁止ゲート |
| フォント | **Geist Sans / Geist Mono** (`@fontsource-variable/geist` 5.3.0) | セルフホスト。CDN 参照はしない（Cloudflare Workers 上で外部依存を持たない） |
| パッケージマネージャ | **pnpm** | Astro 公式ドキュメント・エコシステムで最も無難 |
| 開発フロー | **cc-sdd 3.0.2** (`--claude-code-skills --lang ja`) | Kiro 互換の Spec-Driven Development。requirements → design → tasks → implementation の承認ゲート付き |
| CI | GitHub Actions | ビルド検証（PR 必須チェック）、デプロイ |

### 2.1 不採用にした選択肢

- **VitePress**: 最新版が 1.6.4 で長期間メジャー更新なし。ドキュメントサイト特化のテーマ設計で、フルカスタム要件と相反する
- **Next.js 16**: 静的コンテンツサイトには過剰。Content Collections 相当を自作する必要がある
- **Tailwind CSS v4**: v4 で CSS-first config になり素の CSS との差は縮んだが、独自デザインを目指す場合は theme 拡張に押し込むより素の CSS が素直
- **Cloudflare Pages**: 非推奨ではないが、Cloudflare の新規投資は Workers に集中している

---

## 3. 情報設計

### 3.1 設計方針

参考リポジトリは職務経歴（4 社）が背骨だが、本サイトの材料は以下の三本柱がいずれも強い。
職務経歴書だけを主役に置く構成は取らない。

| 柱 | 材料 | 強度 |
|---|---|---|
| コミュニティ | HonoConf in Tokyo 2026 実行委員長、HonoConf 2025 コアスタッフ、TSKaigi 2025/2026 スタッフ | ★★★ |
| OSS | google-calendar-mcp (59★/10 fork)、Calmendar、awesome-mcp-servers 貢献 | ★★☆ |
| 職務経歴 | LINEヤフー（AI 予約プロダクト）、ナガセ（DX 完遂）ほか計 5 社 | ★★★ |

「カンファレンス運営」は職歴でも OSS でもないため、既存の型に押し込むと埋もれる。
独立セクション `/community/` として立てる。

### 3.2 サイト構造

```
/                    トップ。三本柱を並列で提示
/community/          カンファレンス運営歴
/oss/                OSS・個人開発
/resume/             職務経歴書
/skill/              技術スタックと根拠
/blog/               記事・登壇（外部リンク集。将来は自前ホスト）
```

### 3.3 訴求の核

> サーバーサイドを書きながら、技術コミュニティを運営する。

「AI 予約プロダクトのサーバーサイド開発」「OSS 59★」「HonoConf 実行委員長」を
一人が同時にやっている、という組み合わせが最大の差別化要因。

---

## 4. コンテンツ

### 4.1 基本情報

| 項目 | 値 |
|---|---|
| 氏名 | 小山田 卓生（おやまだ たくみ）/ Takumi Oyamada |
| ハンドル | takumi0706 (GitHub), @1ye_q (X), たくみ (Zenn) |
| 拠点 | 東京 |
| 現職 | LINEヤフー株式会社 ソフトウェアエンジニア |
| 趣味 | ゴルフ、ランニング、スノーボード、マウンテンバイク |

**リンク**

- GitHub: https://github.com/takumi0706
- X: https://x.com/1ye_q
- Zenn: https://zenn.dev/takumi0706 (19 記事 / 138 いいね)
- Google Developer Program: https://developers.google.com/profile/u/takumi0706

### 4.2 学歴

| 期間 | 学校 |
|---|---|
| 2019.04–2022.03 | 山手学院高等学校 |
| 2022.04–2023.03 | 金沢大学 理工学域（教養課程） |
| 2023.04–2026.03 | 金沢大学 電気電子情報通信学類 情報通信コース |

※ 2 年目にコース配属（進振り）のため、学類の在籍表記が 3 年間になっている。
※ 課外: 医学部ゴルフ部

### 4.3 職務経歴

| 期間 | 所属 | 役割 |
|---|---|---|
| 2026.04– | LINEヤフー株式会社 | ソフトウェアエンジニア（正社員） |
| 2025.05– | 株式会社ナガセ | Part Tech Lead / ソフトウェアエンジニア（アルバイト・リモート） |
| 2025.02– | メモアカ | バックエンドエンジニア（インターン・リモート） |
| 2024.10–2024.12 | 株式会社ドリコム | SRE（インターン） |
| 2024.04–2024.09 | Kyoto Development Institute | Frontend & Backend Developer（インターン） |

#### LINEヤフー株式会社

飲食店向け AI 予約プロダクトのサーバーサイド開発。

- AI による電話応対 → 予約条件確認 → 予約基盤連携 → 予約成立までを支えるプロダクト
- リアルタイム音声対話の品質改善
- 予約ルール・在庫情報を踏まえた会話制御
- ガードレール・フォールバック設計
- 社内外システムとの連携構築
- 技術: Go, TypeScript

> **公開範囲**: 上記は LINEヤフーが採用ページで公開している粒度に準拠。
> プロダクト名・社内システム名・数値（ユーザー数/売上/トラフィック）・
> アーキテクチャ詳細は記載しない。最終確認は社の情報公開規程による。

#### 株式会社ナガセ（Part Tech Lead）

2 年間停滞していた DX プロジェクトに途中参画し、1 年弱で完遂させた。

- 参画時点で当初計画が陳腐化していたため、WebApp の利用部署との連携を取り直した
- Slack・チケットシステムを導入し、利用部署の意見を即時に吸い上げる体制を整備
- 並行して WebApp を設計・開発
- 結果として 1 年弱で DX を達成

#### メモアカ

ゲームのバックエンド開発。

- Node.js + DynamoDB
- 動的な難易度スケーリング
- データ整合性の担保

#### 株式会社ドリコム

SRE としてインフラ領域のインターン。

### 4.4 実装ハイライト

- **BtoB SaaS プラットフォーム開発** — マルチテナント業務アプリケーションのバックエンド設計・実装。決済処理、申込ライフサイクル管理、AWS 上のキューベース非同期ワークフロー
- **CI/CD パイプライン設計** — monorepo の品質チェックとコンテナデプロイ（ECS/Fargate）の GitHub Actions ワークフロー構築・運用
- **Spec-Driven Development の導入と定着** — 仕様先行の開発フローを導入し、プロダクト仕様から実装タスクへの橋渡しを OpenAPI/Orval による自動コード生成で実現
- **AI 支援開発ワークフロー** — コードレビュー、Issue トリアージ、週次レポートに AI コーディングツールを活用し、チームの開発速度を改善
- **ゲームのバックエンド** — Node.js + DynamoDB による構築・保守。動的な難易度スケーリングとデータ整合性の担保

### 4.5 技術スキル

| 分類 | 内容 |
|---|---|
| 言語 | TypeScript, Go, Java, Python |
| フレームワーク | Node.js, Next.js, Hono, Spring Boot, FastAPI |
| データ | Drizzle ORM, DynamoDB |
| API | RESTful API 設計, OpenAPI / Orval（型安全コード生成） |
| インフラ | AWS (Lambda, ECS/Fargate, SQS, DynamoDB), Docker, Terraform |
| CI/CD | GitHub Actions |
| ツール | Git/GitHub, Linear, Claude Code |
| プラクティス | Spec-Driven Development, AI-Assisted Development Workflow |
| プロダクト | プロジェクトリード, リーンプロセス, ユーザーリサーチ, 競合調査, ロードマップ, チームビルディング |

### 4.6 コミュニティ活動

| 年 | イベント | 役割 |
|---|---|---|
| 2026 | **Hono Conference in Tokyo 2026**（2026-10-11 / LINEヤフー紀尾井町オフィス） | **実行委員長 (Chair)** |
| 2026 | [TSKaigi 2026](https://2026.tskaigi.org/)（2026-05-22〜23） | スタッフ |
| 2025 | [TSKaigi Hokuriku 2025](https://hokuriku.tskaigi.org/)（2025-11-23 / ホテル金沢） | スタッフ |
| 2025 | Hono Conference 2025（2025-10-18） | コアスタッフ (Organizer) |

> **注意**: 公開ポートフォリオに記載する役職名は、イベント公式の告知表記と揃える。

### 4.7 OSS・作品

| 名称 | 内容 |
|---|---|
| [google-calendar-mcp](https://github.com/takumi0706/google-calendar-mcp) | Claude Desktop 連携用 Google Calendar MCP サーバー。TypeScript / 59★ / 10 fork / 2025-03 公開 |
| [Calmendar (for MyGPTs)](https://chatgpt.com/g/g-usmhsmMZh-calmendar) | 予定管理 GPTs。[ホームページ](https://homepage.calmendar.com/) |
| [awesome-mcp-servers への貢献](https://github.com/punkpeye/awesome-mcp-servers/pull/482) | README-ja.md の構成改善 |

### 4.8 受賞

| 賞 | 詳細 |
|---|---|
| **内定者Hack U 2025 LINEヤフー賞** | 2025-05-31 / チーム「ちーむろく」/ 作品「PostureGuard」/「発想と技術とともに最も優秀であると認められました」（表彰状原文） |

※ 内定者向けの社内イベントのため公開ページなし。名称は「内定者Hack U 2025」と正確に表記する。

### 4.9 副業として提供する領域

受注窓口として明示する。

| 領域 | 裏付け |
|---|---|
| バックエンド設計・実装 | マルチテナント BtoB SaaS、決済処理、キューベース非同期ワークフロー、AWS (Lambda / ECS Fargate / SQS / DynamoDB)、OpenAPI/Orval による型安全 API |
| DX 支援・業務アプリ開発 | ナガセでの DX 完遂（停滞プロジェクトの立て直し、部署間連携の再構築、Slack・チケットシステム導入、WebApp 開発） |
| AI / LLM 組み込み・MCP 開発 | google-calendar-mcp (59★)、LINEヤフーでの LLM エージェントのガードレール・フォールバック設計、AI 支援開発ワークフローの導入 |

---

## 5. 非機能要件

### 5.1 デザイン

- 方向性: ミニマル・タイポグラフィ主体
- **ジャンル: `modern-minimal`**（Hallmark の分類）
  - ユーザー指定「Vercel チック」に対応するジャンル。Hallmark の定義では
    「Stripe / Linear / ElevenLabs の系譜。Geist サンセリフ、大きく自信のあるディスプレイ、
    たっぷりの余白、ピル型 CTA、モノクロ＋任意の 1 アクセント」
  - ディスプレイ: Geist Sans 500–700、字送り `-0.02em` ～ `-0.035em`
  - ボディ: Geist Sans 400（ディスプレイと同一ファミリー）
  - アクセント: モノクロ基調。使うとしても 1 色のみ、フォーカスリング程度に抑える
  - レイアウト: 2 カラムヒーロー（左にタイトル、右にリード文）
  - モーション: 最小限。スクロールリビールは使わない
  - ナビ: N5 フローティングピル / フッター: Ft2 インライン 1 行
- **このジャンルで許可されるもの**（通常は slop 判定されるが本ジャンルでは可）
  - 純白の紙面 (`#fff`)、彩度ゼロのニュートラル、ピル型 CTA、
    細いボーダー + 8px 角丸のカード面
- **このジャンルで禁止されるもの**
  - イタリックのセリフ本文、非対称の本文カラム、ドロップキャップ・装飾、
    バウンド系イージング、グラデーションテキスト、グラスモーフィズム
- **差別化の方針**: Vercel 系の見た目は模倣が非常に多い。器を借りたうえで、
  Vercel がやらないこと ＝ **日本語タイポグラフィを正しく組む**（和欧混植、行長、
  行間、約物処理）ことで差をつける
- **AI-Slop を明確に排除する**
  - 禁止: Inter / Roboto などの頻出デフォルトフォント、紫→青グラデーション、角丸カードの三連グリッド、意味のないアイコン
  - Hallmark の 57 slop-test ゲートを通す
  - 色とフォントは必ず名前付きトークン (`var(--color-*)`, `var(--font-*)`) 経由。インライン hex/OKLCH 禁止
  - 見出しに italic を使わない（gate 38a）
- **捏造禁止**: 実データのない数値・実績を書かない（gate 46）
- レスポンシブ: 320 / 375 / 414 / 768px で検証必須。横スクロールを発生させない

### 5.2 アクセシビリティ

- コントラスト比を満たす
- インタラクティブ要素は 8 状態（default / hover / focus-visible / active / disabled / loading / error / success）に対応
- ダークモード対応（トークンの差し替えで実現）

### 5.3 i18n

- 現時点では日本語のみ
- 将来 `/en/` を追加できるよう、Astro の i18n ルーティングを前提としたディレクトリ構成にする
- コンテンツは Content Collections でロケール分離可能な形にする

### 5.4 CI/CD

- PR 時: ビルド検証（デッドリンクチェックを含む）を必須ステータスチェックに
- main への push 時: Cloudflare Workers へデプロイ

---

## 6. 未確定事項

| # | 項目 | 内容 |
|---|---|---|
| 1 | ナビタイムのインターン | GitHub に `navetime_intern_2024` がある。Kyoto Development Institute とは別のインターンだが、LinkedIn にも旧ポートフォリオにも記載がない。職歴に追加するか、期間・内容 |
| 2 | TSKaigi の役割表記 | 公式告知に合わせた正確な表記 |
| 3 | 独自ドメイン | 取得するか、`*.workers.dev` で始めるか |
| 4 | 職歴ページの表記言語 | 旧ポートフォリオは英語。本サイトは日本語メインだが、会社名・役職の表記をどうするか |

**解決済み**

- メモアカの業務内容 → 「ゲームのバックエンド」で確定
- 副業（ナガセ・メモアカの継続）の公開 → 可
- Kyoto Development Institute と `navetime_intern_2024` → 別のインターン

---

## 7. 進め方

1. ~~調査（フレームワーク・スタイリング・デプロイ先の 2026 年時点の選択肢）~~ 完了
2. ~~ヒアリング（実データの収集）~~ 完了（軽微な未確定事項あり）
3. ~~技術スタックの確定~~ 完了
4. ~~プロジェクトのセットアップ（Astro 7 + pnpm + git + cc-sdd）~~ 完了
5. ~~デザインの確定（Hallmark）~~ 完了。マクロ構造 Marquee Hero / custom テーマ / N9 nav / Ft2 footer
6. ~~デザイントークン + ベース CSS~~ 完了（`src/styles/tokens.css`, `base.css`, `fonts.css`）
7. ~~トップページ実装~~ 完了（`src/pages/index.astro`）
8. ~~Content Collections のスキーマ設計（Zod）~~ 完了（`src/content.config.ts` / 5コレクション）
9. ~~デザインシステムのロック~~ 完了（`design.md`）。以降ページ間でシステムを共有する
10. ~~`/resume/` の実装~~ 完了（02 Long Document）
11. **残りのページ**（/community/ /oss/ /skill/ /blog/） ← 次はここ
12. CI/CD・Cloudflare Workers デプロイ
13. 独自ドメイン

### 実装済みの検証結果（2026-08-16）

- Hallmark slop test 58 ゲート: 全通過（初回は 7 件 fail、修正済み）
- コントラスト: ライト最低 6.58:1 / ダーク最低 5.62:1（いずれも要件 4.5:1）
- 横スクロール: 320 / 375 / 414 / 768 / 1280 / 1920px で発生なし
- ヒーローのフォールド収まり: 1280×800 で見出し・太罫・導入文まで表示
- 配信サイズ: HTML 9.6KB · CSS 3KB (gzip) · フォント約 132KB

### 和文フォントの扱い

`@fontsource/ibm-plex-sans-jp` をそのまま import すると、124 サブセット × 2 ウェイト =
248 個の `@font-face` 宣言が CSS に展開され、レンダリングをブロックする CSS が
343KB（gzip 165KB）になる。`unicode-range` の16進リストは高エントロピーで gzip も効かない。

対策として `scripts/subset-jp-font.mjs` がソース中の和文を走査し、使う字だけの woff2 を
`public/fonts/` に生成する（873KB → 39KB / 510字）。`pnpm run fonts` で再生成でき、
`pnpm dev` / `pnpm build` の前に自動実行される。コンテンツに新しい漢字を足したときは
このステップが自動で拾う。
