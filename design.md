# Design — 小山田卓生 ポートフォリオ

ロック済みのデザインシステム。以降の Hallmark 実行はこのファイルを最初に読み、
各ページはこれに従う。**ページ間で見た目が変わってはならない** — 多様化ルールは
このファイルの存在によって反転し、「ページはシステムを共有する」が正となる。

変更は意図的に。このファイルが規則そのもの。

## System

- Genre · modern-minimal
- Theme · custom（vibe: 「工学的な正確さ、寒色、無装飾」）
- Axes · light / geometric-sans / neutral
- Nav · N9 Edge-aligned minimal（全ページ共通）
- Footer · Ft2 Inline single line（全ページ共通）

**nav と footer はサイト共通のクロームなので、ページごとにローテーションさせない。**
同一サイトの別ページでナビが変わるのは UX の破綻であり、多様化ルールの適用対象外。

## Page shapes

マクロ構造だけはページの役割に応じて変える。トークン・書体・モーション・CTA の声は共有する。

| ページ | マクロ構造 | 理由 |
|---|---|---|
| `/` | 03 Marquee Hero | 一文が主張。フォールドは純粋にタイポグラフィ |
| `/resume/` | 02 Long Document | 職務経歴書は読み物。連続する散文と内在する見出し |
| `/oss/` | 04 Stat-Led | 主役が1つ（google-calendar-mcp）で階層が明確。数字が narrative |
| `/community/` | 12 Letter | 一人称。運営に関わる理由は本人の言葉でしか書けない |
| `/skill/` | 未定 | |
| `/blog/` | 未定 | |

新しいページを足すときは、既出のマクロ構造と重複しないものを選び、この表に記録する。

**選定時は「Reach for it」だけでなく「Avoid」を必ず読むこと。** 実際に
以下の候補が Avoid 節で弾かれた。

| 候補 | 弾かれた理由 |
|---|---|
| 11 Catalogue → `/oss/` | 「全項目を等価に扱う。階層のあるものには誤り」 |
| 01 Bento Grid → `/oss/` | 「8〜15ブロックが前提」「単一の主張のページには使うな」 |
| 14 Narrative Workflow → `/community/` | 「明示的なワークフロー向け。実在の順序が必要」 |
| 15 Split Studio → `/community/` | 対向半分に視覚的な証拠が要る（画像がない）。しかも Reference が Vercel |
| 06 Conversational FAQ → `/community/` | 「主たるページには使うな。開幕を担う別のマクロ構造と組む前提」 |

## マクロ構造の既定から外している点

| 外したもの | 理由 |
|---|---|
| Stat-Led の number-tick（0からのカウントアップ） | motion-cut のため |
| Split Studio / Bento のリビール | 同上 |
| Letter の「セリフ体イタリックの呼びかけ」 | 見出しのイタリックは全体で禁止（gate 38a）。かつ modern-minimal はサンセリフ通し |

## import のルール

相対パス（`../`）は使わない。`tsconfig.json` の `paths` で定義したエイリアスを使う。

| エイリアス | 指す先 |
|---|---|
| `@/*` | `src/*` |
| `@layouts/*` | `src/layouts/*` |
| `@components/*` | `src/components/*` |
| `@styles/*` | `src/styles/*` |

## ナビの CTA

N9 は CTA が1つしかないので、**現在地に応じて行き先を変える**。
職務経歴書を読んでいる人に職務経歴書へのリンクを出しても行き止まりになる。

| 現在地 | CTA |
|---|---|
| `/resume/` 以外 | 職務経歴書 → `/resume/` |
| `/resume/` | 連絡する → X |

## Tokens

`src/styles/tokens.css` が唯一の情報源。以下は要約。

```css
:root {
  /* モノクロ厳密。有彩色のアクセントを持たず、アクセントの役割はインク自身が担う。
   * 唯一の有彩色は --color-focus で :focus-visible にのみ現れる。 */
  --color-paper:      oklch(99% 0.005 240);
  --color-paper-2:    oklch(96.5% 0.006 240);
  --color-paper-3:    oklch(93.5% 0.007 240);
  --color-ink:        oklch(19% 0.013 245);
  --color-ink-2:      oklch(44% 0.012 245);
  --color-muted:      oklch(47% 0.011 243);   /* 4.5:1 を満たす明るさの上限付近 */
  --color-rule:       oklch(82% 0.008 240);
  --color-rule-2:     oklch(88.5% 0.007 240);
  --color-accent:     var(--color-ink);
  --color-accent-ink: var(--color-paper);
  --color-focus:      oklch(55% 0.19 250);

  /* 和欧混植: 欧文は Geist、和文は IBM Plex Sans JP がグリフ単位で分担する。
   * ファミリー数は 3（2+1 ルールの上限）。これ以上増やさない。 */
  --font-display: "Geist Variable", "IBM Plex Sans JP", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Geist Variable", "IBM Plex Sans JP", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Geist Mono Variable", "IBM Plex Sans JP", ui-monospace, monospace;

  /* 4pt スケール --space-3xs … --space-3xl · 型スケールは 1.25（長三度） */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 120ms;  --dur-base: 200ms;
  --radius-sm: 4px;  --radius-md: 6px;   /* ピル型は使わない */
}
```

ダークモードはトークンの差し替えのみで実現する。構造・タイポグラフィ・余白は変えない。

## 和文組版

このサイトの差別化の核。`src/styles/base.css` の `@layer japanese` を参照。

- `text-spacing-trim: trim-start` — 約物のアキ詰め
- `text-autospace: normal` — 和欧間の四分アキ
- `line-break: strict` — 行頭に句読点・閉じ括弧を置かない
- `--measure-ja: 34em` — 行長は全角34字。`ch` は半角基準なので和文には使えない
- `--leading-body: 1.85` — 欧文向けの 1.5〜1.65 では和文は詰まる
- ラベルに `text-transform: uppercase` を使わない（和文に作用しない）

## outlier の割り当て

Geist Mono は **2スロットのみ**（2+1 ルール / gate 38）。

1. ワードマーク（ヘッダー・フッター）
2. 表の年号列（等幅数字）

3つ目に使いたくなったら、それは本文書体に戻すべきもの。

## CTA voice

- Primary · `--color-accent` の塗り · `--radius-md`(6px) の**矩形** · `--space-xs var(--space-md)`
  - ピル型（`border-radius: 999px`）は使わない。Vercel / Linear を最も強く想起させる形のため
- Secondary · 下線付きのテキストリンク · 矢印は本文書体のまま

## Motion stance

motion-cut。プリミティブは2つまで。

- リンクの下線が太くなる
- ボタンの塗りが変わる + 1px の押し込み

スクロール連動のリビールは使わない。`prefers-reduced-motion: reduce` では
transform を無効化し、色の変化のみに落とす。

## 守るべき最低ライン

- 色と `font-family` は必ず名前付きトークン経由。インラインの hex / oklch / 直書き禁止
- 見出しに italic を使わない
- コントラストは本文 4.5:1 / 大きい文字・アイコン・フォーカスリング 3:1
- 320 / 375 / 414 / 768px で横スクロールを出さない
- クリック可能なテキストを2行にしない
- **実データのない数値・実績を書かない。** 事実は `src/content/` と
  `docs/specs/portfolio-site-spec.md` にあるものだけを使う
- **第三者の実名を本人の許諾なく書かない。** 「紹介された」「引き継いだ」は
  いずれも相手の行動であり、公開の場に書けば相手を巻き込む
- **他人の内心・動機を代弁しない。** なぜ引き継いだのか、なぜ辞めたのかは
  本人にしか語れない。書けるのは起きた事実まで

## Exports

`src/styles/tokens.css` が唯一の情報源。Tailwind v4 の `@theme`、DTCG の
`tokens.json`、shadcn/ui の CSS 変数が必要になったら
「design.md に Tailwind exports を追加して」と言えば Hallmark が追記する。
