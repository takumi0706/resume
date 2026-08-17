/**
 * UI 文言の辞書。
 *
 * ここに置くもの:
 *   ラベル・見出し・短い定型句。ページの骨格を作る語。
 *
 * ここに置かないもの:
 *   複数文の散文。src/content/prose/ に .md と .en.md で置く。
 *   文を断片に割って言語ごとに組み立てると、語順が違う言語で必ず壊れる。
 *   「{name} からご連絡ください」のような並びは日本語と英語で崩れる。
 *
 * Strings を明示的な interface にしてあるので、片方の言語でキーを書き忘れると
 * 型エラーになる。Record<Locale, Strings> がそれを強制する。
 */

import type { Locale } from "@i18n/config";

/** 雇用形態。日本語を値にせず、言語に依存しないキーで持つ。 */
export type Employment = "fulltime" | "parttime" | "intern" | "contract";

/** 技術の分類。同上。 */
export type SkillCategory =
  | "language"
  | "backend"
  | "frontend"
  | "data"
  | "infra"
  | "protocol";

/** スキルページでの分類の並び順。件数が同じときの二次キーになる。 */
export const skillCategoryOrder: SkillCategory[] = [
  "language",
  "backend",
  "frontend",
  "data",
  "infra",
  "protocol",
];

interface Strings {
  /* --- 共通 ------------------------------------------------------------- */
  nameJa: string;
  nameLatin: string;
  nameReading: string;
  role: string;
  skipToContent: string;
  railContact: string;
  present: string;
  remote: string;
  externalLinks: string;
  siteLinks: string;

  /* --- ナビゲーション ---------------------------------------------------- */
  navCommunity: string;
  navCommunityShort: string;
  navOss: string;
  navOssShort: string;
  navResume: string;
  navResumeShort: string;
  navSkill: string;
  navSkillShort: string;
  navBlog: string;
  navBlogShort: string;
  navHome: string;

  /* --- 分類 -------------------------------------------------------------- */
  employment: Record<Employment, string>;
  skillCategory: Record<SkillCategory, string>;

  /* --- トップ ------------------------------------------------------------ */
  indexTitle: string;
  indexDescription: string;
  indexRecordHead: string;
  indexTableCaption: string;
  groupCommunity: string;
  groupOss: string;
  groupWork: string;
  groupAwards: string;
  factCurrentRole: string;
  factDuty: string;
  factStack: string;
  factNow: string;
  indexCta: string;

  /* --- 職務経歴書 -------------------------------------------------------- */
  resumeTitle: string;
  resumeDescription: string;
  resumeHeading: string;
  factName: string;
  factOccupation: string;
  factEducation: string;
  factExperience: string;
  /** 「{count}社」/「{count} companies」。 */
  companyCount: string;
  /** 実務年数の添え書き。 */
  experienceSince: string;
  /** 学歴の添え書き。「{faculty} {date}卒業」。 */
  graduated: string;
  headWork: string;
  headEducation: string;
  headAwards: string;
  headContact: string;
  /** 「運営に携わったイベントは{count}件」のリンク文言。 */
  communityCountLink: string;
  awardWork: string;
  awardTeam: string;

  /* --- 技術 -------------------------------------------------------------- */
  skillTitle: string;
  skillDescription: string;
  skillHeading: string;
  skillCta: string;
  /** 「{skills}の技術 · {evidence}件の実績」。 */
  skillFoot: string;

  /* --- カンファレンス運営 ------------------------------------------------ */
  communityTitle: string;
  communityDescription: string;
  communityHeading: string;
  communityWhyHead: string;

  /* --- オープンソース ---------------------------------------------------- */
  ossTitle: string;
  ossDescription: string;
  ossStars: string;
  /** 「{summary}を、{date}から公開しています。」 */
  ossHeadline: string;
  factOssName: string;
  factOssRole: string;
  factOssReleased: string;
  factOssForks: string;
  /** 「{date}時点」。star / fork 数がいつの値かを添える。 */
  asOf: string;
  ossCta: string;
  ossOthersHead: string;

  /* --- 執筆 -------------------------------------------------------------- */
  blogTitle: string;
  blogDescription: string;
  /** 「Zenn に書いたもの · {range} · {count}本」。 */
  blogLede: string;

  /* --- 404 --------------------------------------------------------------- */
  notFoundTitle: string;
  notFoundDescription: string;
  notFoundHeading: string;
}

const ja: Strings = {
  nameJa: "小山田 卓生",
  nameLatin: "Takumi Oyamada",
  nameReading: "おやまだ たくみ",
  role: "サーバーサイドエンジニア",
  skipToContent: "本文へスキップ",
  railContact: "連絡する",
  present: "現在",
  remote: "リモート",
  externalLinks: "外部リンク",
  siteLinks: "サイト内",

  navCommunity: "コミュニティ",
  navCommunityShort: "運営",
  navOss: "OSS",
  navOssShort: "OSS",
  navResume: "職務経歴書",
  navResumeShort: "経歴",
  navSkill: "スキル",
  navSkillShort: "技術",
  navBlog: "執筆",
  navBlogShort: "執筆",
  navHome: "ホーム",

  employment: {
    fulltime: "正社員",
    parttime: "アルバイト",
    intern: "インターン",
    contract: "業務委託",
  },
  skillCategory: {
    language: "言語",
    backend: "サーバーサイド",
    frontend: "フロントエンド",
    data: "データ",
    infra: "インフラ",
    protocol: "仕様・プロトコル",
  },

  indexTitle: "小山田 卓生 — Takumi Oyamada",
  indexDescription:
    "小山田卓生（@takumi0706）のポートフォリオ。LINEヤフー株式会社のソフトウェアエンジニア。Hono Conference in Tokyo 2026 実行委員長。",
  indexRecordHead: "これまで",
  indexTableCaption: "年・内容・役割の一覧",
  groupCommunity: "コミュニティ",
  groupOss: "オープンソース",
  groupWork: "職務",
  groupAwards: "受賞",
  factCurrentRole: "現職",
  factDuty: "担当",
  factStack: "技術",
  factNow: "いま",
  indexCta: "職務経歴書を読む",

  resumeTitle: "職務経歴書 — 小山田 卓生",
  resumeDescription:
    "小山田卓生（@takumi0706）の職務経歴書。LINEヤフー株式会社のソフトウェアエンジニア。サーバーサイド開発とデータ基盤、AI・LLM の組み込み。",
  resumeHeading: "職務経歴書",
  factName: "氏名",
  factOccupation: "職種",
  factEducation: "学歴",
  factExperience: "実務",
  companyCount: "{count}社",
  experienceSince: "2024年10月から",
  graduated: "{faculty} {date}卒業",
  headWork: "職務経歴",
  headEducation: "学歴",
  headAwards: "受賞",
  headContact: "連絡先",
  communityCountLink: "運営に携わったイベントは{count}件",
  awardWork: "作品「{work}」",
  awardTeam: "／チーム「{team}」",

  skillTitle: "技術 — 小山田 卓生",
  skillDescription:
    "小山田卓生（@takumi0706）が実務・OSS・執筆で使ってきた技術の一覧。TypeScript、Go、Node.js、AWS など。",
  skillHeading: "使ってきた技術",
  skillCta: "業務の詳細は職務経歴書へ",
  skillFoot: "{skills}の技術 · {evidence}件の実績",

  communityTitle: "カンファレンス運営 — 小山田 卓生",
  communityDescription:
    "小山田卓生（@takumi0706）のカンファレンス運営歴。Hono Conference in Tokyo 2026 実行委員長。YAPC::Hakodate 2024 からカンファレンスの運営に関わっています。",
  communityHeading: "カンファレンス運営",
  communityWhyHead: "なぜやっているのか",

  ossTitle: "オープンソース — 小山田 卓生",
  ossDescription:
    "小山田卓生（@takumi0706）が公開しているオープンソース。Claude Desktop 連携用の Google Calendar MCP サーバーほか。",
  ossStars: "スター",
  ossHeadline: "{summary}を、{date}から公開しています。",
  factOssName: "名称",
  factOssRole: "役割",
  factOssReleased: "公開",
  factOssForks: "フォーク",
  asOf: "{date}時点",
  ossCta: "GitHub で見る",
  ossOthersHead: "ほかに公開しているもの",

  blogTitle: "執筆 — 小山田 卓生",
  blogDescription:
    "小山田卓生（@takumi0706）が Zenn に書いた記事の一覧。バックエンド、AWS、TypeScript、開発プロセスについて。",
  blogLede: "Zenn に書いたもの · {range} · {count}本",

  notFoundTitle: "ページが見つかりません — 小山田 卓生",
  notFoundDescription: "お探しのページは見つかりませんでした。",
  notFoundHeading: "このページはありません。",
};

const en: Strings = {
  nameJa: "小山田 卓生",
  nameLatin: "Takumi Oyamada",
  nameReading: "Oyamada Takumi",
  role: "Server-side engineer",
  skipToContent: "Skip to content",
  railContact: "Get in touch",
  present: "Present",
  remote: "Remote",
  externalLinks: "Elsewhere",
  siteLinks: "This site",

  navCommunity: "Community",
  navCommunityShort: "Community",
  navOss: "OSS",
  navOssShort: "OSS",
  navResume: "Résumé",
  navResumeShort: "Résumé",
  navSkill: "Skills",
  navSkillShort: "Skills",
  navBlog: "Writing",
  navBlogShort: "Writing",
  navHome: "Home",

  employment: {
    fulltime: "Full-time",
    parttime: "Part-time",
    intern: "Internship",
    contract: "Contract",
  },
  skillCategory: {
    language: "Languages",
    backend: "Server-side",
    frontend: "Frontend",
    data: "Data",
    infra: "Infrastructure",
    protocol: "Specs & protocols",
  },

  indexTitle: "Takumi Oyamada",
  indexDescription:
    "Portfolio of Takumi Oyamada (@takumi0706), a software engineer at LY Corporation and chair of Hono Conference in Tokyo 2026.",
  indexRecordHead: "Record",
  indexTableCaption: "Year, subject and role",
  groupCommunity: "Community",
  groupOss: "Open source",
  groupWork: "Work",
  groupAwards: "Awards",
  factCurrentRole: "Now",
  factDuty: "Work",
  factStack: "Stack",
  factNow: "Next",
  indexCta: "Read the résumé",

  resumeTitle: "Résumé — Takumi Oyamada",
  resumeDescription:
    "Résumé of Takumi Oyamada (@takumi0706), a software engineer at LY Corporation working on server-side systems, data platforms and LLM integration.",
  resumeHeading: "Résumé",
  factName: "Name",
  factOccupation: "Field",
  factEducation: "Education",
  factExperience: "Experience",
  companyCount: "{count} companies",
  experienceSince: "since October 2024",
  graduated: "{faculty}, graduated {date}",
  headWork: "Experience",
  headEducation: "Education",
  headAwards: "Awards",
  headContact: "Contact",
  communityCountLink: "{count} conferences organised",
  awardWork: "Project “{work}”",
  awardTeam: " / Team “{team}”",

  skillTitle: "Skills — Takumi Oyamada",
  skillDescription:
    "Technologies Takumi Oyamada (@takumi0706) has used in professional work, open source and writing: TypeScript, Go, Node.js, AWS and more.",
  skillHeading: "What I have worked with",
  skillCta: "See the résumé for details",
  skillFoot: "{skills} technologies · {evidence} pieces of evidence",

  communityTitle: "Community — Takumi Oyamada",
  communityDescription:
    "Conferences Takumi Oyamada (@takumi0706) has helped run. Chair of Hono Conference in Tokyo 2026, organising conferences since YAPC::Hakodate 2024.",
  communityHeading: "Running conferences",
  communityWhyHead: "Why I do it",

  ossTitle: "Open source — Takumi Oyamada",
  ossDescription:
    "Open source published by Takumi Oyamada (@takumi0706), including a Google Calendar MCP server for Claude Desktop.",
  ossStars: "stars",
  ossHeadline: "{summary}, published since {date}.",
  factOssName: "Name",
  factOssRole: "Role",
  factOssReleased: "Released",
  factOssForks: "Forks",
  asOf: "as of {date}",
  ossCta: "View on GitHub",
  ossOthersHead: "Also published",

  blogTitle: "Writing — Takumi Oyamada",
  blogDescription:
    "Articles Takumi Oyamada (@takumi0706) has written on Zenn, in Japanese: back-end development, AWS, TypeScript and engineering process.",
  blogLede: "Written on Zenn · {range} · {count} articles",

  notFoundTitle: "Page not found — Takumi Oyamada",
  notFoundDescription: "The page you were looking for does not exist.",
  notFoundHeading: "This page does not exist.",
};

export const ui: Record<Locale, Strings> = { ja, en };

/**
 * 文字列の差し込み。`{count}` のような目印を置き換える。
 *
 * 文を断片に割らずに済ませるための最小限の仕組み。
 * 差し込みは値だけにして、文の構造は各言語が丸ごと持つ。
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key) => {
    const value = values[key];
    return value === undefined ? whole : String(value);
  });
}
