# Agentic SDLC and Spec-Driven Development

Kiro-style Spec-Driven Development on an agentic SDLC

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro-spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow
- Phase 0 (optional): `/kiro-steering`, `/kiro-steering-custom`
- Discovery: `/kiro-discovery "idea"` — determines action path, writes brief.md + roadmap.md for multi-spec projects
- Phase 1 (Specification):
  - Single spec: `/kiro-spec-quick {feature} [--auto]` or step by step:
    - `/kiro-spec-init "description"`
    - `/kiro-spec-requirements {feature}`
    - `/kiro-validate-gap {feature}` (optional: for existing codebase)
    - `/kiro-spec-design {feature} [-y]`
    - `/kiro-validate-design {feature}` (optional: design review)
    - `/kiro-spec-tasks {feature} [-y]`
  - Multi-spec: `/kiro-spec-batch` — creates all specs from roadmap.md in parallel by dependency wave
- Phase 2 (Implementation): `/kiro-impl {feature} [tasks]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks in main context, still reviewer-gated before completion)
  - `/kiro-validate-impl {feature}` (standalone re-validation)
- Progress check: `/kiro-spec-status {feature}` (use anytime)

## Skills Structure
Skills are located in `.claude/skills/kiro-*/SKILL.md`
- Each skill is a directory with a `SKILL.md` file
- Skills run inline with access to conversation context
- Skills may delegate parallel research to subagents for efficiency
- Additional files (templates, examples) can be added to skill directories
- `kiro-review` — task-local adversarial review protocol used by reviewer subagents
- `kiro-debug` — root-cause-first debug protocol used by debugger subagents
- `kiro-verify-completion` — fresh-evidence gate before success or completion claims
- **If there is even a 1% chance a skill applies to the current task, invoke it.** Do not skip skills because the task seems simple.

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro-spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro-steering-custom`)

---

# このプロジェクト固有のルール

ポートフォリオサイト。仕様は `docs/specs/portfolio-site-spec.md` を参照。

## 技術スタック（確定済み・変更時は要相談）

| 項目 | 選定 |
|---|---|
| フレームワーク | Astro 7 |
| スタイリング | vanilla CSS + デザイントークン（`@layer` / CSS 変数 / container query） |
| パッケージマネージャ | pnpm |
| デプロイ | Cloudflare Workers (Static Assets) |
| フォント | Geist Sans / Geist Mono（`@fontsource-variable/geist`。CDN 参照はしない） |

- **Tailwind CSS を導入しない。** フルカスタムデザインのため素の CSS で組む
- **CSS-in-JS を導入しない**
- i18n は現時点で日本語のみだが、`/en/` を後付けできる構成を保つ

## コーディング規約

- **型アサーション（`as`）を使用しない**
- **`any` 型を使用しない**
- Content Collections のスキーマは Zod で定義し、型は推論させる

## デザイン規約

デザイン作業では **必ず `hallmark` スキルを通す**。

- ジャンル: `modern-minimal`（Vercel / Linear / Stripe の系譜）
- 色とフォントは必ず名前付きトークン (`var(--color-*)`, `var(--font-*)`) 経由。インライン hex / OKLCH / `font-family` 直書きは禁止
- 見出しに italic を使わない
- グラデーションテキスト、グラスモーフィズム禁止
- 320 / 375 / 414 / 768px で横スクロールが出ないことを確認する
- **実データのない数値・実績を書かない。** 経歴・実績は `docs/specs/portfolio-site-spec.md` に記載されたものだけを使う

## Git

- **コミットの共同著者に Claude Code を含めない**
- コミット・プッシュはユーザーから依頼された時だけ行う

## 開発サーバー

バックグラウンドモードで起動する。

```
astro dev --background
```

管理コマンド: `astro dev stop` / `astro dev status` / `astro dev logs`

## Astro ドキュメント

関連作業の前に参照すること。

- [ページ・動的ルート・ミドルウェア](https://docs.astro.build/en/guides/routing/)
- [Astro コンポーネント](https://docs.astro.build/en/basics/astro-components/)
- [React / Vue / Svelte などのフレームワークコンポーネント](https://docs.astro.build/en/guides/framework-components/)
- [コンテンツ管理 (Content Collections)](https://docs.astro.build/en/guides/content-collections/)
- [スタイリング](https://docs.astro.build/en/guides/styling/)
- [多言語対応](https://docs.astro.build/en/guides/internationalization/)
