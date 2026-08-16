import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

/**
 * 日付は文字列で持つ。
 * YYYY-MM / YYYY-MM-DD は辞書順が時系列順と一致するため、Date に変換しなくても
 * 正しく並び替えられる。Date にするとタイムゾーンのずれで1日前後する事故が起きる。
 */
const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, "YYYY-MM の形式で書いてください");
const yearMonthDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD の形式で書いてください");

/** 職務経歴。本文に業務内容を書く。 */
const work = defineCollection({
  loader: glob({ base: "./src/content/work", pattern: "**/*.md" }),
  schema: z.object({
    company: z.string(),
    companyUrl: z.url().optional(),
    title: z.string(),
    employment: z.enum(["正社員", "アルバイト", "インターン", "業務委託"]),
    start: yearMonth,
    /** null は「現在も継続中」を意味する。 */
    end: yearMonth.nullable(),
    remote: z.boolean().default(false),
    stack: z.array(z.string()).default([]),
    summary: z.string(),
  }),
});

/** 学歴。 */
const education = defineCollection({
  loader: glob({ base: "./src/content/education", pattern: "**/*.md" }),
  schema: z.object({
    school: z.string(),
    schoolUrl: z.url().optional(),
    faculty: z.string().optional(),
    start: yearMonth,
    end: yearMonth,
  }),
});

/** カンファレンス運営。 */
const community = defineCollection({
  loader: glob({ base: "./src/content/community", pattern: "**/*.md" }),
  schema: z.object({
    event: z.string(),
    role: z.string(),
    date: yearMonthDay,
    url: z.url().optional(),
    venue: z.string().optional(),
  }),
});

/** OSS・個人開発。 */
const oss = defineCollection({
  loader: glob({ base: "./src/content/oss", pattern: "**/*.md" }),
  schema: z.object({
    name: z.string(),
    url: z.url(),
    role: z.string(),
    released: yearMonth,
    stars: z.number().int().nonnegative().optional(),
    forks: z.number().int().nonnegative().optional(),
    /** star / fork 数は変動するので、いつ時点の数字かを必ず添える。 */
    metricsAsOf: yearMonth.optional(),
    stack: z.array(z.string()).default([]),
    summary: z.string(),
  }),
});

/** 受賞。 */
const awards = defineCollection({
  loader: glob({ base: "./src/content/awards", pattern: "**/*.md" }),
  schema: z.object({
    event: z.string(),
    award: z.string(),
    date: yearMonthDay,
    team: z.string().optional(),
    work: z.string().optional(),
    url: z.url().optional(),
  }),
});

/**
 * 技術スキル。
 *
 * 「中級」「実務レベル」といった自己申告の段階は持たない。検証できないうえ、
 * 面接で必ず掘られる。代わりに usedIn に「どこで使ったか」だけを書く。
 * usedIn が空のものはページに出ない（最低1件を必須にしている）。
 */
const skills = defineCollection({
  loader: glob({ base: "./src/content/skills", pattern: "**/*.md" }),
  schema: z.object({
    name: z.string(),
    category: z.enum(["言語", "フレームワーク", "データ", "インフラ", "開発プロセス"]),
    /** 実績のある場所。会社名・OSS 名・記事名など、辿れる単位で書く。 */
    usedIn: z.array(z.string()).min(1, "実績が1件もない技術は載せない"),
    note: z.string().optional(),
  }),
});

/**
 * Zenn の記事。scripts/fetch-zenn.mjs が生成した JSON を読む。
 * ビルド時に Zenn を叩かないのは、外部サービスの障害で CI が落ちるのを避けるため。
 * 記事を書いたら pnpm run zenn で更新する。
 */
const writing = defineCollection({
  loader: file("src/data/zenn.json"),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    publishedAt: yearMonthDay,
    likes: z.number().int().nonnegative(),
    /** Zenn の記事区分。tech = 技術記事、idea = アイデア記事。 */
    type: z.enum(["tech", "idea"]),
  }),
});

export const collections = { work, education, community, oss, awards, skills, writing };
